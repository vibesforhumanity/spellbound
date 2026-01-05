import Foundation

/// Service for communicating with the Spelling Coach Agent API (Claude Agent SDK)
class AgentService {
    // Change this to your actual server URL
    // For local development: http://localhost:3000
    // For production: https://spellbound-production.up.railway.app
    let baseURL: String

    init(baseURL: String = "https://spellbound-production.up.railway.app") {
        self.baseURL = baseURL
    }

    // MARK: - Generate Pattern Question

    /// Generate a multiple choice question for pattern reinforcement using Claude Agent SDK
    /// - Parameters:
    ///   - sessionId: Unique session identifier for the student
    ///   - incorrectWord: The word the student misspelled
    ///   - userAttempt: What the student typed
    ///   - pattern: The phonics pattern they struggled with (e.g., "suffix -tion")
    ///   - previousAttempts: Number of previous attempts for this pattern (0-2)
    /// - Returns: MultipleChoiceQuestion if successful, nil if failed
    func generatePatternQuestion(
        sessionId: String,
        incorrectWord: String,
        userAttempt: String,
        pattern: String,
        previousAttempts: Int = 0
    ) async -> MultipleChoiceQuestion? {
        let endpoint = "\(baseURL)/api/generate-question"

        guard let url = URL(string: endpoint) else {
            print("❌ Invalid URL: \(endpoint)")
            return nil
        }

        let requestBody: [String: Any] = [
            "sessionId": sessionId,
            "incorrectWord": incorrectWord,
            "userAttempt": userAttempt,
            "pattern": pattern,
            "previousAttempts": previousAttempts
        ]

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)

            print("📡 Calling agent API: \(endpoint)")
            print("   Pattern: \(pattern) | Attempt: \(previousAttempts + 1)/3")

            let (data, response) = try await URLSession.shared.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse else {
                print("❌ Invalid response type")
                return nil
            }

            guard httpResponse.statusCode == 200 else {
                print("❌ HTTP \(httpResponse.statusCode)")
                if let errorText = String(data: data, encoding: .utf8) {
                    print("   Error: \(errorText)")
                }
                return nil
            }

            // Parse response
            let decoder = JSONDecoder()
            let apiResponse = try decoder.decode(AgentQuestionResponse.self, from: data)

            if apiResponse.success, let question = apiResponse.question {
                print("✅ Agent generated question successfully")
                return question
            } else {
                print("❌ Agent failed: \(apiResponse.error ?? "Unknown error")")
                return nil
            }

        } catch {
            print("❌ Network error: \(error.localizedDescription)")
            return nil
        }
    }

    // MARK: - Analyze Practice Session

    /// Analyze a practice session and get coaching feedback
    /// - Parameters:
    ///   - sessionId: Unique session identifier for the student
    ///   - practiceResults: Results from the practice session
    ///   - studentQuestion: Optional follow-up question from the student
    /// - Returns: Coaching feedback string if successful, nil if failed
    func analyzePracticeSession(
        sessionId: String,
        practiceResults: PracticeResults,
        studentQuestion: String? = nil
    ) async -> String? {
        let endpoint = "\(baseURL)/api/analyze-session"

        guard let url = URL(string: endpoint) else {
            print("❌ Invalid URL: \(endpoint)")
            return nil
        }

        var requestBody: [String: Any] = [
            "sessionId": sessionId,
            "practiceResults": [
                "correctWords": practiceResults.correctWords,
                "incorrectWords": practiceResults.incorrectWords,
                "masteredPatterns": practiceResults.masteredPatterns,
                "challengingPatterns": practiceResults.challengingPatterns,
                "missedWordsByPattern": practiceResults.missedWordsByPattern
            ]
        ]

        if let question = studentQuestion {
            requestBody["studentQuestion"] = question
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)

            print("📡 Analyzing practice session with agent")

            let (data, response) = try await URLSession.shared.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse else {
                print("❌ Invalid response type")
                return nil
            }

            guard httpResponse.statusCode == 200 else {
                print("❌ HTTP \(httpResponse.statusCode)")
                return nil
            }

            // Parse response
            if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
               let responseText = json["response"] as? String {
                print("✅ Agent analysis complete")
                return responseText
            } else {
                print("❌ Failed to parse response")
                return nil
            }

        } catch {
            print("❌ Network error: \(error.localizedDescription)")
            return nil
        }
    }

    // MARK: - Health Check

    /// Check if the agent API is running and healthy
    /// - Returns: true if API is accessible, false otherwise
    func checkHealth() async -> Bool {
        let endpoint = "\(baseURL)/health"

        guard let url = URL(string: endpoint) else {
            return false
        }

        do {
            let (data, response) = try await URLSession.shared.data(from: url)

            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200 else {
                return false
            }

            if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
               let status = json["status"] as? String {
                return status == "ok"
            }

            return false
        } catch {
            return false
        }
    }
}

// MARK: - Data Models

struct AgentQuestionResponse: Codable {
    let success: Bool
    let question: MultipleChoiceQuestion?
    let error: String?
}

struct PracticeResults {
    let correctWords: [String]
    let incorrectWords: [String]
    let masteredPatterns: [String]
    let challengingPatterns: [String]
    let missedWordsByPattern: [String: [String]]
}
