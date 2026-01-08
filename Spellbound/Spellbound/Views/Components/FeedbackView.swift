import SwiftUI

struct FeedbackView: View {
    let isCorrect: Bool
    let userAttempt: String?
    let correctWord: String?
    let incorrectPatterns: [DetectedPattern]
    let ttsService: TTSService
    let sessionId: String
    let studentId: String
    let agentService: AgentService
    let onNext: () -> Void

    @State private var agentFeedback: String?
    @State private var isLoadingFeedback: Bool = false
    @State private var showAskQuestion: Bool = false
    @State private var userQuestion: String = ""
    @State private var thinkingDots: String = ""

    var body: some View {
        ZStack {
            if isCorrect {
                // Green checkmark overlay for correct answers
                Color.green.opacity(0.3)
                    .ignoresSafeArea()
                    .transition(.opacity)
                    .animation(.easeInOut(duration: 0.3), value: isCorrect)

                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 120))
                    .foregroundColor(.green)
                    .shadow(color: .green.opacity(0.5), radius: 20)
                    .transition(.scale.combined(with: .opacity))
                    .animation(.spring(response: 0.5, dampingFraction: 0.6), value: isCorrect)
            } else {
                // Existing incorrect answer feedback
                Color.black.opacity(0.5)
                    .ignoresSafeArea()
                    .onTapGesture(perform: onNext)

                VStack(spacing: 30) {
                    // Emoji feedback
                    Text("💪")
                        .font(.system(size: 100))

                if let attempt = userAttempt, let correct = correctWord {
                    // Show comparison
                    VStack(spacing: 20) {
                        // User's attempt with errors in red
                        VStack(spacing: 8) {
                            Text("Your spelling:")
                                .font(.system(size: 20, weight: .medium, design: .rounded))
                                .foregroundColor(.white.opacity(0.8))

                            HStack(spacing: 2) {
                                ForEach(Array(attempt.enumerated()), id: \.offset) { index, char in
                                    let isError = index >= correct.count || char != Array(correct)[index]
                                    Text(String(char))
                                        .font(.system(size: 36, weight: .bold, design: .monospaced))
                                        .foregroundColor(isError ? .red : .white)
                                }
                            }
                        }

                        // Correct spelling with corrections in green
                        VStack(spacing: 8) {
                            Text("Correct spelling:")
                                .font(.system(size: 20, weight: .medium, design: .rounded))
                                .foregroundColor(.white.opacity(0.8))

                            HStack(spacing: 2) {
                                ForEach(Array(correct.enumerated()), id: \.offset) { index, char in
                                    let isDifferent = index >= attempt.count || char != Array(attempt)[index]
                                    Text(String(char))
                                        .font(.system(size: 36, weight: .bold, design: .monospaced))
                                        .foregroundColor(isDifferent ? .green : .white)
                                }
                            }
                        }
                    }
                    .padding(20)
                    .background(Color.black.opacity(0.3))
                    .cornerRadius(15)

                    // Agent feedback section
                    if !incorrectPatterns.isEmpty {
                        VStack(spacing: 12) {
                            HStack {
                                Text("💡 Coach Spark says:")
                                    .font(.system(size: 24, weight: .bold, design: .rounded))
                                    .foregroundColor(.white)
                                Spacer()
                            }

                            if isLoadingFeedback {
                                // Animated "thinking" message
                                VStack(spacing: 8) {
                                    HStack {
                                        Text("Coach Spark is thinking\(thinkingDots)")
                                            .font(.system(size: 20, weight: .medium, design: .rounded))
                                            .foregroundColor(.white.opacity(0.9))
                                        Spacer()
                                    }

                                    if let attempt = userAttempt, let correct = correctWord {
                                        HStack {
                                            Text("Analyzing: '\(attempt)' → '\(correct)'")
                                                .font(.system(size: 16, design: .rounded))
                                                .foregroundColor(.white.opacity(0.7))
                                            Spacer()
                                        }
                                    }
                                }
                                .padding(12)
                                .background(Color.purple.opacity(0.3))
                                .cornerRadius(10)
                                .onAppear {
                                    startThinkingAnimation()
                                }
                                .onDisappear {
                                    thinkingDots = ""
                                }
                            } else if let feedback = agentFeedback {
                                VStack(spacing: 12) {
                                    HStack {
                                        Text(feedback)
                                            .font(.system(size: 20, weight: .medium, design: .rounded))
                                            .foregroundColor(.white)
                                            .multilineTextAlignment(.leading)
                                        Spacer()
                                    }
                                    .padding(12)
                                    .background(Color.blue.opacity(0.3))
                                    .cornerRadius(10)

                                    // Ask Coach Spark button
                                    Button {
                                        showAskQuestion = true
                                    } label: {
                                        HStack {
                                            Image(systemName: "questionmark.circle.fill")
                                            Text("Ask Coach Spark")
                                        }
                                        .font(.system(size: 18, weight: .semibold, design: .rounded))
                                        .foregroundColor(.white)
                                        .padding(.horizontal, 20)
                                        .padding(.vertical, 10)
                                        .background(Color.purple.opacity(0.6))
                                        .cornerRadius(10)
                                    }
                                }
                            } else {
                                // Fallback to local pattern tips
                                ForEach(Array(incorrectPatterns.prefix(2)), id: \.type) { pattern in
                                    HStack {
                                        Text(pattern.type.tipMessage)
                                            .font(.system(size: 20, weight: .medium, design: .rounded))
                                            .foregroundColor(.white)
                                            .multilineTextAlignment(.leading)
                                        Spacer()
                                    }
                                    .padding(12)
                                    .background(Color.blue.opacity(0.3))
                                    .cornerRadius(10)
                                }
                            }
                        }
                        .padding(16)
                        .background(Color.black.opacity(0.3))
                        .cornerRadius(15)
                        .onAppear {
                            fetchAgentFeedback()
                        }
                    }
                    }

                    // Continue button (only for incorrect answers)
                    Button {
                        onNext()
                    } label: {
                        Text("Got it!")
                            .font(.system(size: 28, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                            .padding(.horizontal, 50)
                            .padding(.vertical, 20)
                            .background(Color.blue)
                            .cornerRadius(20)
                    }
                }
                .padding(40)
                .background(.ultraThinMaterial)
                .cornerRadius(30)
                .shadow(color: .black.opacity(0.3), radius: 20)
            }
        }
        .sheet(isPresented: $showAskQuestion) {
            AskQuestionSheet(
                sessionId: sessionId,
                studentId: studentId,
                agentService: agentService,
                ttsService: ttsService,
                onDismiss: { showAskQuestion = false }
            )
        }
    }

    // MARK: - Helper Methods

    private func startThinkingAnimation() {
        thinkingDots = ""
        Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { timer in
            if !isLoadingFeedback {
                timer.invalidate()
                thinkingDots = ""
                return
            }

            // Cycle through "", ".", "..", "..."
            switch thinkingDots {
            case "":
                thinkingDots = "."
            case ".":
                thinkingDots = ".."
            case "..":
                thinkingDots = "..."
            default:
                thinkingDots = ""
            }
        }
    }

    private func fetchAgentFeedback() {
        guard let word = correctWord, let attempt = userAttempt else { return }

        isLoadingFeedback = true

        Task {
            // Call agent API for feedback
            let patternNames = incorrectPatterns.map { $0.type.displayName }

            // Create request matching backend model
            let endpoint = "\(agentService.baseURL)/api/get-feedback"
            guard let url = URL(string: endpoint) else { return }

            let requestBody: [String: Any] = [
                "session_id": sessionId,
                "student_id": studentId,
                "incorrect_word": word,
                "user_attempt": attempt,
                "incorrect_patterns": patternNames
            ]

            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")

            do {
                request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)

                let (data, _) = try await URLSession.shared.data(for: request)

                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let feedback = json["feedback"] as? String {

                    await MainActor.run {
                        agentFeedback = feedback
                        isLoadingFeedback = false

                        // Use OpenAI's natural voice for agent feedback
                        speakWithOpenAI(feedback)
                    }
                } else {
                    // Fallback to local tips
                    await MainActor.run {
                        isLoadingFeedback = false
                        speakLocalTips()
                    }
                }
            } catch {
                print("❌ Failed to fetch agent feedback: \(error)")
                await MainActor.run {
                    isLoadingFeedback = false
                    speakLocalTips()
                }
            }
        }
    }

    private func speakLocalTips() {
        let tipsText = incorrectPatterns.prefix(2)
            .map { $0.type.tipMessage }
            .joined(separator: ". ")
        // Use OpenAI TTS even for local fallback tips
        speakWithOpenAI(tipsText)
    }

    private func speakWithOpenAI(_ text: String) {
        print("🎤 Attempting OpenAI TTS for: \(text.prefix(50))...")

        Task {
            // Call OpenAI TTS endpoint
            let endpoint = "\(agentService.baseURL)/api/text-to-speech"
            guard let url = URL(string: endpoint) else {
                print("❌ Invalid TTS URL")
                return
            }

            print("📡 Calling OpenAI TTS: \(endpoint)")

            let requestBody: [String: Any] = [
                "text": text,
                "voice": "nova"  // Kid-friendly voice
            ]

            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")

            do {
                request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)

                let (data, response) = try await URLSession.shared.data(for: request)

                if let httpResponse = response as? HTTPURLResponse {
                    print("📥 TTS Response status: \(httpResponse.statusCode)")

                    guard httpResponse.statusCode == 200 else {
                        print("❌ TTS failed with status \(httpResponse.statusCode)")
                        throw NSError(domain: "TTS", code: httpResponse.statusCode, userInfo: nil)
                    }
                }

                // Save to temp file and play
                let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent("agent-speech.mp3")
                try data.write(to: tempURL)

                print("✅ OpenAI TTS audio saved, playing...")
                await MainActor.run {
                    ttsService.playAudioFile(at: tempURL)
                }
            } catch {
                print("❌ OpenAI TTS failed, using fallback: \(error)")
                // Fallback to local synthesis
                await MainActor.run {
                    ttsService.speak(text, type: .plain, word: nil)
                }
            }
        }
    }
}

// MARK: - Ask Question Sheet

struct AskQuestionSheet: View {
    let sessionId: String
    let studentId: String
    let agentService: AgentService
    let ttsService: TTSService
    let onDismiss: () -> Void

    @State private var userQuestion: String = ""
    @State private var agentAnswer: String?
    @State private var isLoading: Bool = false
    @State private var thinkingDots: String = ""

    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Text("Ask Coach Spark")
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .padding(.top)

                TextField("What do you want to know?", text: $userQuestion)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .font(.system(size: 20, design: .rounded))
                    .padding()

                Button {
                    askQuestion()
                } label: {
                    Text("Ask")
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                        .padding(.horizontal, 50)
                        .padding(.vertical, 15)
                        .background(userQuestion.isEmpty ? Color.gray : Color.blue)
                        .cornerRadius(15)
                }
                .disabled(userQuestion.isEmpty)

                if isLoading {
                    VStack(spacing: 12) {
                        Text("Coach Spark is thinking\(thinkingDots)")
                            .font(.system(size: 22, weight: .medium, design: .rounded))
                            .foregroundColor(.purple)

                        Text("Answering your question...")
                            .font(.system(size: 16, design: .rounded))
                            .foregroundColor(.gray)
                    }
                    .padding()
                    .background(Color.purple.opacity(0.1))
                    .cornerRadius(15)
                    .onAppear {
                        startThinkingAnimation()
                    }
                    .onDisappear {
                        thinkingDots = ""
                    }
                }

                if let answer = agentAnswer {
                    ScrollView {
                        VStack(alignment: .leading, spacing: 10) {
                            Text("Coach Spark says:")
                                .font(.system(size: 20, weight: .bold, design: .rounded))

                            Text(answer)
                                .font(.system(size: 18, weight: .medium, design: .rounded))
                                .multilineTextAlignment(.leading)
                        }
                        .padding()
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(15)
                        .padding()
                    }
                }

                Spacer()

                Button {
                    onDismiss()
                } label: {
                    Text("Done")
                        .font(.system(size: 20, weight: .semibold, design: .rounded))
                        .foregroundColor(.white)
                        .padding(.horizontal, 40)
                        .padding(.vertical, 12)
                        .background(Color.green)
                        .cornerRadius(12)
                }
                .padding(.bottom)
            }
            .navigationBarHidden(true)
        }
    }

    private func askQuestion() {
        isLoading = true

        Task {
            // Call agent API
            let endpoint = "\(agentService.baseURL)/api/ask-question"
            guard let url = URL(string: endpoint) else { return }

            let requestBody: [String: Any] = [
                "session_id": sessionId,
                "student_id": studentId,
                "question": userQuestion
            ]

            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")

            do {
                request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)

                let (data, _) = try await URLSession.shared.data(for: request)

                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let message = json["message"] as? String {

                    await MainActor.run {
                        agentAnswer = message
                        isLoading = false

                        // Use OpenAI TTS for the answer
                        speakWithOpenAI(message)
                    }
                }
            } catch {
                print("❌ Failed to ask question: \(error)")
                await MainActor.run {
                    isLoading = false
                }
            }
        }
    }

    private func startThinkingAnimation() {
        thinkingDots = ""
        Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { timer in
            if !isLoading {
                timer.invalidate()
                thinkingDots = ""
                return
            }

            // Cycle through "", ".", "..", "..."
            switch thinkingDots {
            case "":
                thinkingDots = "."
            case ".":
                thinkingDots = ".."
            case "..":
                thinkingDots = "..."
            default:
                thinkingDots = ""
            }
        }
    }

    private func speakWithOpenAI(_ text: String) {
        print("🎤 [AskQuestion] Attempting OpenAI TTS for: \(text.prefix(50))...")

        Task {
            // Call OpenAI TTS endpoint
            let endpoint = "\(agentService.baseURL)/api/text-to-speech"
            guard let url = URL(string: endpoint) else {
                print("❌ [AskQuestion] Invalid TTS URL")
                return
            }

            print("📡 [AskQuestion] Calling OpenAI TTS: \(endpoint)")

            let requestBody: [String: Any] = [
                "text": text,
                "voice": "nova"  // Kid-friendly voice
            ]

            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")

            do {
                request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)

                let (data, response) = try await URLSession.shared.data(for: request)

                if let httpResponse = response as? HTTPURLResponse {
                    print("📥 [AskQuestion] TTS Response status: \(httpResponse.statusCode)")

                    guard httpResponse.statusCode == 200 else {
                        print("❌ [AskQuestion] TTS failed with status \(httpResponse.statusCode)")
                        throw NSError(domain: "TTS", code: httpResponse.statusCode, userInfo: nil)
                    }
                }

                // Save to temp file and play
                let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent("agent-question-speech.mp3")
                try data.write(to: tempURL)

                print("✅ [AskQuestion] OpenAI TTS audio saved, playing...")
                await MainActor.run {
                    ttsService.playAudioFile(at: tempURL)
                }
            } catch {
                print("❌ [AskQuestion] OpenAI TTS failed, using fallback: \(error)")
                // Fallback to local synthesis
                await MainActor.run {
                    ttsService.speak(text, type: .plain, word: nil)
                }
            }
        }
    }
}
