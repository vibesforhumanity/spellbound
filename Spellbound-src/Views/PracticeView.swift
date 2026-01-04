import SwiftUI

struct PracticeView: View {
    @StateObject var viewModel: PracticeViewModel
    @StateObject var storageService: StorageService

    var body: some View {
        if viewModel.isSessionComplete {
            ResultsView(
                session: viewModel.currentSession,
                gemsEarned: viewModel.currentSession.gemsEarned,
                totalGems: storageService.gemstones,
                onDone: viewModel.resetSession
            )
        } else {
            practiceContent
        }
    }

    var practiceContent: some View {
        ZStack {
            LinearGradient(
                colors: [.blue.opacity(0.3), .purple.opacity(0.3)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 30) {
                // Header
                HStack {
                    GemCounterView(
                        count: storageService.gemstones,
                        progressToNext: viewModel.currentSession.correctCount % 10
                    )

                    Spacer()

                    Text("\(viewModel.sessionProgress.current)/\(viewModel.totalWords)")
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .padding()
                        .background(.ultraThinMaterial)
                        .cornerRadius(15)
                }
                .padding(.horizontal)

                Spacer()

                // Speaker button
                Button {
                    viewModel.speakCurrentWord()
                } label: {
                    VStack(spacing: 15) {
                        Image(systemName: "speaker.wave.3.fill")
                            .font(.system(size: 80))
                            .foregroundColor(.blue)

                        Text("Tap to hear the word")
                            .font(.system(size: 20, weight: .medium, design: .rounded))
                            .foregroundColor(.secondary)
                    }
                    .frame(width: 250, height: 250)
                    .background(.ultraThinMaterial)
                    .cornerRadius(30)
                    .shadow(color: .black.opacity(0.1), radius: 10)
                }

                // Text input
                WordInputView(
                    text: $viewModel.userInput,
                    isCorrect: viewModel.isCorrect,
                    onSubmit: viewModel.checkAnswer
                )

                // Submit button
                Button {
                    viewModel.checkAnswer()
                } label: {
                    Text("Check Spelling")
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.green)
                        .cornerRadius(20)
                }
                .padding(.horizontal, 40)

                Spacer()
            }
            .padding()

            // Feedback overlay
            if viewModel.showFeedback {
                FeedbackView(
                    isCorrect: viewModel.isCorrect ?? false,
                    onNext: viewModel.nextWord
                )
            }
        }
    }
}
