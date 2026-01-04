import SwiftUI

struct ResultsView: View {
    let session: Session
    let gemsEarned: Int
    let totalGems: Int
    let onDone: () -> Void

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [.purple.opacity(0.3), .blue.opacity(0.3)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 40) {
                Spacer()

                Text("Great Job!")
                    .font(.system(size: 48, weight: .bold, design: .rounded))
                    .foregroundColor(.primary)

                // Stats
                VStack(spacing: 20) {
                    HStack {
                        Text("Correct:")
                            .font(.title2)
                        Spacer()
                        Text("\(session.correctCount)/\(session.totalCount)")
                            .font(.title2.bold())
                    }

                    if gemsEarned > 0 {
                        Divider()

                        HStack {
                            Text("Gems Earned:")
                                .font(.title2)
                            Spacer()
                            HStack(spacing: 5) {
                                Text("💎")
                                    .font(.title)
                                Text("\(gemsEarned)")
                                    .font(.title2.bold())
                                    .foregroundColor(.yellow)
                            }
                        }
                    }

                    Divider()

                    HStack {
                        Text("Total Gems:")
                            .font(.title2)
                        Spacer()
                        HStack(spacing: 5) {
                            Text("💎")
                                .font(.title)
                            Text("\(totalGems)")
                                .font(.title2.bold())
                                .foregroundColor(.yellow)
                        }
                    }
                }
                .padding(30)
                .background(.ultraThinMaterial)
                .cornerRadius(20)
                .padding(.horizontal)

                Spacer()

                // Buttons
                VStack(spacing: 15) {
                    Button {
                        onDone()
                    } label: {
                        Text("Practice Again")
                            .font(.system(size: 24, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.green)
                            .cornerRadius(20)
                    }

                    NavigationLink(destination: RewardsView()) {
                        Text("View Rewards")
                            .font(.system(size: 24, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.purple)
                            .cornerRadius(20)
                    }
                }
                .padding(.horizontal, 40)

                Spacer()
            }
        }
    }
}
