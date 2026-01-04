import SwiftUI

struct GemCounterView: View {
    let count: Int
    let progressToNext: Int  // out of 10

    var body: some View {
        VStack(spacing: 10) {
            HStack(spacing: 10) {
                Text("💎")
                    .font(.system(size: 32))

                Text("\(count)")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(.yellow)
            }

            // Progress bar to next gem
            if progressToNext > 0 {
                VStack(spacing: 5) {
                    Text("\(progressToNext)/10")
                        .font(.system(size: 14, weight: .medium, design: .rounded))

                    ProgressView(value: Double(progressToNext), total: 10.0)
                        .tint(.yellow)
                        .frame(width: 100)
                }
            }
        }
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(15)
        .shadow(color: .black.opacity(0.1), radius: 5)
    }
}
