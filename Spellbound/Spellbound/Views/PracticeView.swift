import SwiftUI

struct PracticeView: View {
    @StateObject var viewModel: PracticeViewModel
    @StateObject var storageService: StorageService
    @ObservedObject var wordService: WordService

    var body: some View {
        if viewModel.isSessionComplete {
            ResultsView(
                session: viewModel.currentSession,
                gemsEarned: viewModel.currentSession.gemsEarned,
                totalGems: storageService.gemstones,
                wordService: wordService,
                onDone: viewModel.resetSession
            )
        } else {
            practiceContent
        }
    }

    var practiceContent: some View {
        ZStack {
            // Modern gradient background
            LinearGradient(
                colors: [
                    Color(red: 0.95, green: 0.97, blue: 1.0),
                    Color(red: 0.98, green: 0.95, blue: 1.0)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 24) {
                // Header with progress counter
                HStack {
                    Spacer()

                    Text("\(viewModel.currentSession.correctCount)/15")
                        .font(.system(size: 20, weight: .semibold, design: .rounded))
                        .foregroundColor(.primary)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(Color.white.opacity(0.6))
                        .cornerRadius(12)
                }
                .padding(.horizontal, 20)
                .padding(.top, 10)

                Spacer()

                // Speaker button - modern design
                Button {
                    viewModel.speakCurrentWord()
                } label: {
                    VStack(spacing: 12) {
                        Image(systemName: "speaker.wave.3.fill")
                            .font(.system(size: 64))
                            .foregroundStyle(
                                LinearGradient(
                                    colors: [Color(red: 0.3, green: 0.6, blue: 1.0), Color(red: 0.5, green: 0.4, blue: 1.0)],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )

                        Text("Tap to hear the word")
                            .font(.system(size: 17, weight: .medium, design: .rounded))
                            .foregroundColor(.primary.opacity(0.6))
                    }
                    .frame(width: 220, height: 220)
                    .background(Color.white)
                    .cornerRadius(24)
                    .shadow(color: .black.opacity(0.06), radius: 12, y: 6)
                }

                // Helper buttons - cleaner design
                HStack(spacing: 12) {
                    HelperButton(icon: "text.bubble", title: "Sentence", color: Color(red: 1.0, green: 0.6, blue: 0.2)) {
                        viewModel.speakSentence()
                    }

                    HelperButton(icon: "book.fill", title: "Definition", color: Color(red: 0.6, green: 0.4, blue: 1.0)) {
                        viewModel.speakDefinition()
                    }

                    HelperButton(icon: "lightbulb.fill", title: "Clue", color: Color(red: 1.0, green: 0.8, blue: 0.2)) {
                        viewModel.toggleClue()
                    }
                }
                .padding(.horizontal, 20)

                // Text input
                WordInputView(
                    text: $viewModel.userInput,
                    expectedLength: viewModel.currentWord?.text.count ?? 5,
                    isCorrect: viewModel.isCorrect,
                    showClue: viewModel.showClue,
                    firstLetter: String(viewModel.currentWord?.text.prefix(1) ?? ""),
                    onSubmit: viewModel.checkAnswer
                )

                // Submit button - modern design
                Button {
                    viewModel.checkAnswer()
                } label: {
                    Text("Check Spelling")
                        .font(.system(size: 20, weight: .semibold, design: .rounded))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 18)
                        .background(
                            viewModel.canCheckSpelling ?
                            LinearGradient(
                                colors: [Color(red: 0.2, green: 0.8, blue: 0.5), Color(red: 0.1, green: 0.7, blue: 0.4)],
                                startPoint: .leading,
                                endPoint: .trailing
                            ) :
                            LinearGradient(
                                colors: [Color.gray.opacity(0.5), Color.gray.opacity(0.4)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(16)
                        .shadow(
                            color: viewModel.canCheckSpelling ? Color(red: 0.2, green: 0.8, blue: 0.5).opacity(0.3) : Color.clear,
                            radius: 8,
                            y: 4
                        )
                }
                .disabled(!viewModel.canCheckSpelling)
                .padding(.horizontal, 30)

                Spacer()
            }
            .padding()

            // Feedback overlay
            if viewModel.showFeedback {
                FeedbackView(
                    isCorrect: viewModel.isCorrect ?? false,
                    userAttempt: viewModel.isCorrect == false ? viewModel.lastIncorrectAttempt : nil,
                    correctWord: viewModel.isCorrect == false ? viewModel.currentWord?.text : nil,
                    incorrectPatterns: viewModel.incorrectPatterns,
                    ttsService: viewModel.ttsService,
                    sessionId: viewModel.currentSession.id.uuidString,
                    studentId: "default-student",  // Single-user app
                    agentService: viewModel.agentService,
                    onNext: viewModel.nextWord
                )
            }

            // Multiple choice overlay (pattern reinforcement)
            if viewModel.showMultipleChoice,
               let question = viewModel.currentMultipleChoiceQuestion {
                MultipleChoiceView(
                    question: question,
                    onAnswer: viewModel.handleMultipleChoiceAnswer
                )
                .id(question.question) // Force view to reinitialize when question changes
            }
        }
    }
}

struct HelperButton: View {
    let icon: String
    let title: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 22, weight: .semibold))
                Text(title)
                    .font(.system(size: 13, weight: .medium, design: .rounded))
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(color)
            .cornerRadius(14)
            .shadow(color: color.opacity(0.3), radius: 6, y: 3)
        }
    }
}
