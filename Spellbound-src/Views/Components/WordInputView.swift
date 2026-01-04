import SwiftUI

struct WordInputView: View {
    @Binding var text: String
    let isCorrect: Bool?
    let onSubmit: () -> Void

    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(spacing: 10) {
            TextField("Type the word here", text: $text)
                .font(.system(size: 48, weight: .bold, design: .rounded))
                .multilineTextAlignment(.center)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .focused($isFocused)
                .onSubmit(onSubmit)
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 20)
                        .fill(.white)
                        .shadow(color: borderColor.opacity(0.3), radius: 10)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(borderColor, lineWidth: 4)
                )
                .padding(.horizontal, 40)

            // Character count helper
            Text("\(text.count) letters")
                .font(.system(size: 18, design: .rounded))
                .foregroundColor(.secondary)
        }
        .onAppear {
            isFocused = true
        }
    }

    private var borderColor: Color {
        guard let isCorrect = isCorrect else {
            return .blue
        }
        return isCorrect ? .green : .red
    }
}
