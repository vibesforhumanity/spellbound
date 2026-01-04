import SwiftUI

struct FeedbackView: View {
    let isCorrect: Bool
    let userAttempt: String?
    let correctWord: String?
    let incorrectPatterns: [DetectedPattern]
    let ttsService: TTSService
    let onNext: () -> Void

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

                    // Pattern tips section
                    if !incorrectPatterns.isEmpty {
                        VStack(spacing: 12) {
                            HStack {
                                Text("💡 Spelling Tip:")
                                    .font(.system(size: 24, weight: .bold, design: .rounded))
                                    .foregroundColor(.white)
                                Spacer()
                            }

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
                        .padding(16)
                        .background(Color.black.opacity(0.3))
                        .cornerRadius(15)
                        .onAppear {
                            // Auto-read tips aloud
                            let tipsText = incorrectPatterns.prefix(2)
                                .map { $0.type.tipMessage }
                                .joined(separator: ". ")
                            ttsService.speak(tipsText, type: .definition, word: correctWord ?? "")
                        }
                    }
                    }

                    // Continue button (only for incorrect answers)
                    Button {
                        onNext()
                    } label: {
                        Text("Next Word")
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
    }
}
