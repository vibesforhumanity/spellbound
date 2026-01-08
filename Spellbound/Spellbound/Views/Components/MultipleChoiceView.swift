import SwiftUI
import AudioToolbox

struct MultipleChoiceQuestion: Codable {
    let question: String
    let options: [String]
    let correctAnswer: String
    let explanation: String
}

struct MultipleChoiceView: View {
    let question: MultipleChoiceQuestion
    let onAnswer: (String, Bool) -> Void

    @State private var selectedAnswer: String?
    @State private var showResult: Bool = false
    @State private var isCorrect: Bool = false

    var body: some View {
        ZStack {
            // Background
            Color.black.opacity(0.5)
                .ignoresSafeArea()

            VStack(spacing: 30) {
                // Header
                VStack(spacing: 12) {
                    Text("🎯")
                        .font(.system(size: 80))

                    Text("Pattern Practice")
                        .font(.system(size: 32, weight: .bold, design: .rounded))
                        .foregroundColor(.white)

                    Text(question.question)
                        .font(.system(size: 20, weight: .medium, design: .rounded))
                        .foregroundColor(.white.opacity(0.9))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 20)
                }

                // Options
                VStack(spacing: 16) {
                    ForEach(question.options, id: \.self) { option in
                        Button {
                            if selectedAnswer == nil {
                                selectedAnswer = option
                                isCorrect = option == question.correctAnswer
                                showResult = true

                                // Play success sound for correct answer
                                if isCorrect {
                                    AudioServicesPlaySystemSound(1057) // Pleasant "ding" sound
                                }

                                // Delay callback to show feedback
                                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                                    onAnswer(option, isCorrect)
                                }
                            }
                        } label: {
                            HStack {
                                Text(option)
                                    .font(.system(size: 20, weight: .semibold, design: .rounded))
                                    .foregroundColor(buttonTextColor(for: option))
                                    .multilineTextAlignment(.leading)

                                Spacer()

                                if showResult && option == selectedAnswer {
                                    Image(systemName: isCorrect ? "checkmark.circle.fill" : "xmark.circle.fill")
                                        .font(.system(size: 24))
                                        .foregroundColor(isCorrect ? .green : .red)
                                }
                            }
                            .padding(20)
                            .background(buttonBackground(for: option))
                            .cornerRadius(16)
                        }
                        .disabled(selectedAnswer != nil)
                    }
                }
                .padding(.horizontal, 30)

                // Explanation (shown after answer)
                if showResult {
                    VStack(spacing: 12) {
                        Text(isCorrect ? "Correct! 🎉" : "Not quite...")
                            .font(.system(size: 24, weight: .bold, design: .rounded))
                            .foregroundColor(isCorrect ? .green : .orange)

                        Text(question.explanation)
                            .font(.system(size: 18, weight: .medium, design: .rounded))
                            .foregroundColor(.white)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 20)

                        // Continue button
                        Button {
                            if let answer = selectedAnswer {
                                onAnswer(answer, isCorrect)
                            }
                        } label: {
                            Text(isCorrect ? "Continue" : "Try Again")
                                .font(.system(size: 22, weight: .bold, design: .rounded))
                                .foregroundColor(.white)
                                .padding(.horizontal, 40)
                                .padding(.vertical, 15)
                                .background(isCorrect ? Color.green : Color.orange)
                                .cornerRadius(15)
                        }
                        .padding(.top, 8)
                    }
                    .padding(20)
                    .background(Color.black.opacity(0.3))
                    .cornerRadius(16)
                    .padding(.horizontal, 30)
                }
            }
            .padding(40)
            .background(.ultraThinMaterial)
            .cornerRadius(30)
            .shadow(color: .black.opacity(0.3), radius: 20)
            .padding(20)
        }
    }

    private func buttonBackground(for option: String) -> Color {
        if showResult && option == selectedAnswer {
            return isCorrect ? Color.green.opacity(0.3) : Color.red.opacity(0.3)
        }
        return Color.white.opacity(0.9)
    }

    private func buttonTextColor(for option: String) -> Color {
        if showResult && option == selectedAnswer {
            return isCorrect ? .green : .red
        }
        return .primary
    }
}
