# Kimi K2 Migration Guide

## Overview

This guide walks through migrating from Claude Agent SDK to self-hosted Kimi K2 for cost control and infrastructure ownership. The agent architecture is designed to be model-agnostic, making this transition straightforward.

## Why Kimi K2?

### Advantages:
- **Cost Control**: Self-hosting eliminates per-token API costs
- **Data Privacy**: Full control over data and model execution
- **Customization**: Fine-tune for educational use cases
- **Learning**: Hands-on experience with agent infrastructure
- **Scalability**: No API rate limits

### Trade-offs:
- **Infrastructure Cost**: Server/GPU hosting required
- **Maintenance**: You manage updates, monitoring, scaling
- **Initial Setup**: More complex than API-based solution
- **Performance**: May be slower than Claude's optimized API

## Migration Strategy

### Phase 1: Prototype with Claude (✅ Complete)
- Validate agent design and interactions
- Test with real students
- Refine system prompt and teaching approach
- Establish baseline quality

### Phase 2: Dual Model Support (Current Phase)
- Add Kimi K2 integration alongside Claude
- A/B test quality and performance
- Gradually increase Kimi K2 traffic
- Monitor cost savings

### Phase 3: Full Migration
- Transition 100% to Kimi K2
- Remove Claude dependency
- Optimize for Kimi K2's strengths

## Kimi K2 Overview

**Model Details:**
- **Architecture**: Mixture-of-Experts (MoE) with 127B total parameters, 13B active
- **Context Window**: 128K tokens
- **Agentic Features**: Native function calling, reasoning, tool use
- **Languages**: Multilingual with strong English support
- **Open Source**: Apache 2.0 license

**Performance:**
- Competitive with frontier models on agentic tasks
- Fast inference (optimized for tool calling)
- Good reasoning for educational content

## Self-Hosting Options

### Option 1: Moonshot AI Cloud (Easiest)
Use Kimi K2 via Moonshot's hosted API (similar to Claude, but cheaper).

**Cost**: ~$0.10 per 1M tokens (vs $3-15/MTok for Claude)

```bash
# Set up environment
export KIMI_API_KEY="your_moonshot_api_key"
export KIMI_API_BASE_URL="https://api.moonshot.cn/v1"
```

### Option 2: Local GPU Server (Full Control)
Host Kimi K2 on your own hardware.

**Requirements:**
- GPU: NVIDIA A100 (40GB) or better
- RAM: 64GB+
- Storage: 100GB+ SSD
- OS: Ubuntu 22.04 or similar

**Setup:**
```bash
# Install dependencies
pip install torch transformers accelerate bitsandbytes

# Download Kimi K2 model
git lfs install
git clone https://huggingface.co/Moonshot/Kimi-K2

# Run inference server
python -m vllm.entrypoints.openai.api_server \
  --model Moonshot/Kimi-K2 \
  --tensor-parallel-size 2 \
  --dtype bfloat16
```

### Option 3: Cloud GPU (AWS/GCP/Azure)
Rent GPU instances on-demand.

**Recommended:**
- AWS: p4d.24xlarge (8x A100)
- GCP: a2-ultragpu-8g
- Azure: NC24ads A100 v4

**Cost**: $3-10/hour (cheaper than API for high volume)

### Option 4: Modal/RunPod/Together AI (Managed)
Use managed GPU inference platforms.

**Benefits:**
- No infrastructure management
- Pay-per-use GPU time
- Auto-scaling
- Pre-configured environments

## Code Changes Required

### Step 1: Create Kimi K2 Client

Create new file: `src/kimiClient.ts`

```typescript
import Anthropic from "@anthropic-ai/sdk";

/**
 * Kimi K2 client using OpenAI-compatible API
 * Works with Moonshot hosted API or self-hosted vLLM server
 */
export class KimiK2Client {
  private baseURL: string;
  private apiKey: string;

  constructor(apiKey: string, baseURL: string = "https://api.moonshot.cn/v1") {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

  /**
   * Stream chat completion (compatible with Claude Agent SDK interface)
   */
  async *streamChat(params: {
    systemPrompt: string;
    userPrompt: string;
    model?: string;
  }) {
    const { systemPrompt, userPrompt, model = "kimi-k2-instruct" } = params;

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((line) => line.trim() !== "");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }
}
```

### Step 2: Update Agent to Support Multiple Models

Modify `src/agent.ts`:

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";
import { KimiK2Client } from "./kimiClient.js";
import SPELLING_COACH_SYSTEM_PROMPT from "./systemPrompt.js";
// ... other imports

// Add model provider enum
export enum ModelProvider {
  CLAUDE = "claude",
  KIMI_K2 = "kimi-k2",
}

interface AgentOptions {
  sessionId?: string;
  model?: string;
  provider?: ModelProvider;  // NEW
  allowedTools?: string[];
}

export async function runSpellingCoachAgent(
  userPrompt: string,
  options: AgentOptions = {}
) {
  const {
    sessionId = generateSessionId(),
    model = "claude-sonnet-4-5-20250929",
    provider = ModelProvider.CLAUDE,  // NEW
    allowedTools = ["Read", "WebSearch"],
  } = options;

  // Load session context (same for both providers)
  let sessionContext = await loadSession(sessionId);
  if (!sessionContext) {
    sessionContext = createSessionContext(sessionId);
  }

  const sessionContextMessage = buildSessionContextMessage(sessionContext);
  const systemPrompt = `${SPELLING_COACH_SYSTEM_PROMPT}\n\n${sessionContextMessage}`;

  console.log(`\n🎓 Starting spelling coach session: ${sessionId}`);
  console.log(`🤖 Provider: ${provider}, Model: ${model}\n`);

  // Route to appropriate provider
  if (provider === ModelProvider.KIMI_K2) {
    return runWithKimiK2(userPrompt, systemPrompt, sessionContext, model);
  } else {
    return runWithClaude(userPrompt, systemPrompt, sessionContext, model, allowedTools);
  }
}

/**
 * Run agent with Claude (existing implementation)
 */
async function runWithClaude(
  userPrompt: string,
  systemPrompt: string,
  sessionContext: SessionContext,
  model: string,
  allowedTools: string[]
) {
  let fullResponse = "";

  for await (const message of query({
    prompt: userPrompt,
    options: {
      model,
      systemPrompt,
      allowedTools,
      permissionMode: "acceptEdits",
    },
  })) {
    if (message.type === "assistant" && message.message?.content) {
      for (const block of message.message.content) {
        if ("text" in block) {
          console.log(`\n[Coach Spark] ${block.text}`);
          fullResponse += block.text + "\n";
        }
      }
    }

    if (message.type === "result") {
      console.log(`\n💰 Cost: $${message.total_cost_usd.toFixed(6)}`);
    }
  }

  await saveSession(sessionContext);
  return { sessionContext, response: fullResponse };
}

/**
 * Run agent with Kimi K2 (new implementation)
 */
async function runWithKimiK2(
  userPrompt: string,
  systemPrompt: string,
  sessionContext: SessionContext,
  model: string
) {
  const client = new KimiK2Client(
    process.env.KIMI_API_KEY!,
    process.env.KIMI_API_BASE_URL
  );

  let fullResponse = "";

  for await (const chunk of client.streamChat({
    systemPrompt,
    userPrompt,
    model,
  })) {
    process.stdout.write(chunk);
    fullResponse += chunk;
  }

  console.log("\n");

  await saveSession(sessionContext);
  return { sessionContext, response: fullResponse };
}
```

### Step 3: Update Environment Variables

Add to `.env`:

```bash
# Claude (for prototyping)
ANTHROPIC_API_KEY=sk-ant-...

# Kimi K2 (for production)
KIMI_API_KEY=your_moonshot_api_key
KIMI_API_BASE_URL=https://api.moonshot.cn/v1

# Or for self-hosted:
# KIMI_API_BASE_URL=http://localhost:8000/v1
```

### Step 4: Update Usage

```typescript
import { runSpellingCoachAgent, ModelProvider } from "./agent.js";

// Use Claude (default)
const resultClaude = await runSpellingCoachAgent("Help me spell 'beautiful'");

// Use Kimi K2 (hosted)
const resultKimi = await runSpellingCoachAgent("Help me spell 'beautiful'", {
  provider: ModelProvider.KIMI_K2,
  model: "kimi-k2-instruct",
});

// Use self-hosted Kimi K2
process.env.KIMI_API_BASE_URL = "http://localhost:8000/v1";
const resultSelfHosted = await runSpellingCoachAgent("Help me spell 'beautiful'", {
  provider: ModelProvider.KIMI_K2,
});
```

## Testing & Quality Comparison

### Create Test Suite

Create `tests/model-comparison.ts`:

```typescript
import { runSpellingCoachAgent, ModelProvider } from "../src/agent.js";

const testCases = [
  {
    name: "Basic word help",
    prompt: "Help me spell 'beautiful'",
  },
  {
    name: "Etymology question",
    prompt: "Why is 'knight' spelled with a 'k'?",
  },
  {
    name: "Practice session analysis",
    prompt: "I got these words wrong: beautiful, treasure, afternoon",
  },
];

async function compareModels() {
  for (const test of testCases) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Test: ${test.name}`);
    console.log("=".repeat(60));

    // Test Claude
    console.log("\n📘 CLAUDE:");
    const claudeStart = Date.now();
    const claudeResult = await runSpellingCoachAgent(test.prompt, {
      provider: ModelProvider.CLAUDE,
    });
    const claudeTime = Date.now() - claudeStart;

    // Test Kimi K2
    console.log("\n📗 KIMI K2:");
    const kimiStart = Date.now();
    const kimiResult = await runSpellingCoachAgent(test.prompt, {
      provider: ModelProvider.KIMI_K2,
    });
    const kimiTime = Date.now() - kimiStart;

    console.log(`\n⏱️  Performance: Claude ${claudeTime}ms | Kimi ${kimiTime}ms`);
  }
}

compareModels().catch(console.error);
```

### Quality Metrics to Monitor

1. **Response Quality**:
   - Educational accuracy
   - Age-appropriateness
   - Engagement level
   - Etymology accuracy

2. **Performance**:
   - Latency (first token)
   - Throughput (tokens/sec)
   - Total response time

3. **Cost**:
   - Cost per session
   - Monthly operating cost
   - Break-even analysis

## Cost Analysis

### Claude Sonnet 4.5:
```
Input:  $3.00 / 1M tokens
Output: $15.00 / 1M tokens

Per session (2K input, 500 output):
= (2000 * $3 / 1M) + (500 * $15 / 1M)
= $0.006 + $0.0075
= $0.0135 per session

1000 sessions/month = $13.50
```

### Kimi K2 (Moonshot Hosted):
```
Flat rate: ~$0.10 / 1M tokens (combined)

Per session (2.5K tokens):
= 2500 * $0.10 / 1M
= $0.00025 per session

1000 sessions/month = $0.25
```

**Savings: 98% reduction** ($13.50 → $0.25)

### Self-Hosted Kimi K2:
```
AWS p4d.24xlarge: ~$32/hour = $23,040/month (dedicated)
1M sessions capacity per month
Cost per session: $0.023

Break-even: ~600 sessions/month vs Claude
```

## Deployment Guide

### Production Setup (Modal)

Create `modal_deploy.py`:

```python
from modal import Image, Stub, web_endpoint
import modal

# Create Modal app
stub = Stub("spelling-coach-kimi")

# Define image with Kimi K2
kimi_image = Image.debian_slim().pip_install(
    "vllm",
    "transformers",
    "torch",
)

@stub.function(
    image=kimi_image,
    gpu="A100",
    timeout=300,
)
@web_endpoint(method="POST")
def chat_completion(request: dict):
    from vllm import LLM, SamplingParams

    llm = LLM(model="Moonshot/Kimi-K2")

    params = SamplingParams(
        temperature=0.7,
        max_tokens=2048,
        stream=True,
    )

    prompt = request["prompt"]

    for output in llm.generate([prompt], params):
        yield output.outputs[0].text
```

Deploy:
```bash
modal deploy modal_deploy.py
```

## Monitoring & Observability

Add to `src/monitoring.ts`:

```typescript
interface SessionMetrics {
  provider: string;
  model: string;
  latency_ms: number;
  tokens_input: number;
  tokens_output: number;
  cost_usd: number;
  quality_score?: number;
}

export function logMetrics(metrics: SessionMetrics) {
  // Send to your analytics platform
  console.log(JSON.stringify(metrics));

  // Could integrate with:
  // - Datadog
  // - Prometheus
  // - CloudWatch
  // - Custom dashboard
}
```

## Rollback Plan

If Kimi K2 quality is insufficient:

1. **Immediate**: Flip provider back to Claude in `agent.ts`
2. **Short-term**: Use Kimi K2 for simple queries, Claude for complex
3. **Long-term**: Fine-tune Kimi K2 on educational content

## Next Steps

1. ✅ Test current Claude implementation thoroughly
2. ⏳ Set up Moonshot API account
3. ⏳ Implement Kimi K2 client
4. ⏳ Run A/B tests (20% Kimi K2, 80% Claude)
5. ⏳ Monitor quality and cost
6. ⏳ Gradually increase Kimi K2 percentage
7. ⏳ Evaluate self-hosting if volume justifies

## Resources

- **Kimi K2 Model**: https://huggingface.co/Moonshot/Kimi-K2
- **Moonshot API**: https://platform.moonshot.ai
- **vLLM Documentation**: https://docs.vllm.ai
- **Modal Documentation**: https://modal.com/docs
- **Performance Benchmarks**: https://github.com/MoonshotAI/Kimi-K2/benchmarks

## Support

For migration questions:
- Review code examples in this guide
- Test with `tests/model-comparison.ts`
- Monitor metrics dashboard
- Consult Kimi K2 community forums
