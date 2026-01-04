import SwiftUI

struct FeedbackView: View {
    let isCorrect: Bool
    let onNext: () -> Void

    @State private var showConfetti = false

    var body: some View {
        ZStack {
            Color.black.opacity(0.5)
                .ignoresSafeArea()
                .onTapGesture(perform: onNext)

            VStack(spacing: 30) {
                // Emoji feedback
                Text(isCorrect ? "🎉" : "💪")
                    .font(.system(size: 100))
                    .scaleEffect(showConfetti ? 1.2 : 0.8)
                    .animation(.easeInOut(duration: 0.6).repeatForever(autoreverses: true), value: showConfetti)

                // Message
                Text(isCorrect ? "Correct!" : "Try Again Later!")
                    .font(.system(size: 42, weight: .bold, design: .rounded))
                    .foregroundColor(.white)

                if isCorrect {
                    Text("+1 toward next gem!")
                        .font(.system(size: 24, weight: .medium, design: .rounded))
                        .foregroundColor(.yellow)
                }

                // Continue button
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
        .onAppear {
            showConfetti = true
        }
    }
}
