import SwiftUI

struct WordInputView: View {
    @Binding var text: String
    let expectedLength: Int
    let isCorrect: Bool?
    let showClue: Bool
    let firstLetter: String
    let onSubmit: () -> Void

    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(spacing: 15) {
            if showClue {
                // Letter boxes with first letter hint - made tappable
                HStack(spacing: 8) {
                    ForEach(0..<expectedLength, id: \.self) { index in
                        let textArray = Array(text)
                        let displayLetter: String = {
                            if index < textArray.count {
                                return String(textArray[index])
                            }
                            return ""
                        }()

                        LetterBox(
                            letter: displayLetter,
                            isCorrect: isCorrect,
                            isCurrent: index == text.count,
                            isHint: index == 0
                        )
                    }
                }
                .padding(.horizontal, 20)
                .onTapGesture {
                    isFocused = true
                }

                // Hidden text field to capture input
                TextField("", text: $text)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .keyboardType(.asciiCapable)
                    .textContentType(.none)
                    .focused($isFocused)
                    .onSubmit(onSubmit)
                    .opacity(0)
                    .frame(height: 0)
                    .accessibilityHidden(true)

                // Helper text
                Text("\(text.count) of \(expectedLength) letters")
                    .font(.system(size: 16, weight: .medium, design: .rounded))
                    .foregroundColor(.secondary.opacity(0.7))
            } else {
                // Single text field
                TextField("Type the word here", text: $text)
                    .font(.system(size: 42, weight: .semibold, design: .rounded))
                    .foregroundColor(.black)
                    .multilineTextAlignment(.center)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .keyboardType(.asciiCapable)
                    .textContentType(.none)
                    .focused($isFocused)
                    .onSubmit(onSubmit)
                    .padding(.vertical, 20)
                    .padding(.horizontal, 30)
                    .background(
                        RoundedRectangle(cornerRadius: 16)
                            .fill(Color.white)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(borderColor, lineWidth: 3)
                    )
                    .shadow(color: borderColor.opacity(0.2), radius: 8, y: 4)
                    .padding(.horizontal, 30)
            }
        }
        .onAppear {
            isFocused = true
        }
        .onChange(of: text) { oldValue, newValue in
            if showClue {
                // Ensure first letter (hint) stays locked
                if newValue.isEmpty {
                    // User tried to delete everything - restore first letter
                    text = firstLetter
                } else if !newValue.lowercased().hasPrefix(firstLetter.lowercased()) {
                    // User tried to change first letter - keep old value or restore
                    text = oldValue.isEmpty ? firstLetter : oldValue
                } else if newValue.count > expectedLength {
                    // Limit input to expected length
                    text = String(newValue.prefix(expectedLength))
                }
            }
        }
    }

    private var borderColor: Color {
        guard let isCorrect = isCorrect else {
            return Color(red: 0.2, green: 0.5, blue: 1.0)
        }
        return isCorrect ? Color(red: 0.2, green: 0.8, blue: 0.4) : Color(red: 1.0, green: 0.3, blue: 0.3)
    }
}

struct LetterBox: View {
    let letter: String
    let isCorrect: Bool?
    let isCurrent: Bool
    let isHint: Bool

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 12)
                .fill(isHint ? Color(red: 1.0, green: 0.95, blue: 0.7) : Color.white)

            RoundedRectangle(cornerRadius: 12)
                .stroke(borderColor, lineWidth: 2.5)

            Text(letter)
                .font(.system(size: 32, weight: .bold, design: .rounded))
                .foregroundColor(isHint ? Color(red: 0.6, green: 0.4, blue: 0.0) : .black)
        }
        .frame(width: 48, height: 56)
        .shadow(color: .black.opacity(0.08), radius: 4, y: 2)
    }

    private var borderColor: Color {
        if isHint {
            return Color(red: 1.0, green: 0.8, blue: 0.3)
        }
        if isCurrent {
            return Color(red: 0.2, green: 0.5, blue: 1.0)
        }
        guard let isCorrect = isCorrect else {
            return Color.gray.opacity(0.25)
        }
        return isCorrect ? Color(red: 0.2, green: 0.8, blue: 0.4) : Color(red: 1.0, green: 0.3, blue: 0.3)
    }
}
