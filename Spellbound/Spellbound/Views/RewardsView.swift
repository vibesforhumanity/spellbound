import SwiftUI

struct RewardsView: View {
    @StateObject private var storageService = StorageService()
    let rewards = Reward.presets

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [.blue.opacity(0.2), .purple.opacity(0.2)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 20) {
                    // Current gems
                    HStack {
                        Text("Your Gems:")
                            .font(.system(size: 24, weight: .bold, design: .rounded))

                        Spacer()

                        HStack(spacing: 8) {
                            Text("💎")
                                .font(.system(size: 32))
                            Text("\(storageService.gemstones)")
                                .font(.system(size: 28, weight: .bold, design: .rounded))
                                .foregroundColor(.yellow)
                        }
                    }
                    .padding()
                    .background(.ultraThinMaterial)
                    .cornerRadius(15)

                    // Rewards
                    ForEach(rewards) { reward in
                        RewardCard(
                            reward: reward,
                            currentGems: storageService.gemstones,
                            onRedeem: { storageService.redeemReward(reward) }
                        )
                    }
                }
                .padding()
            }
            .navigationTitle("Rewards")
            .navigationBarTitleDisplayMode(.large)
        }
    }
}

struct RewardCard: View {
    let reward: Reward
    let currentGems: Int
    let onRedeem: () -> Void

    @State private var showRedemptionAlert = false

    var canAfford: Bool {
        currentGems >= reward.gemCost
    }

    var body: some View {
        HStack(spacing: 20) {
            Image(systemName: reward.icon)
                .font(.system(size: 50))
                .foregroundColor(canAfford ? .blue : .gray)
                .frame(width: 80)

            VStack(alignment: .leading, spacing: 8) {
                Text(reward.title)
                    .font(.system(size: 20, weight: .bold, design: .rounded))
                    .foregroundColor(.primary)

                HStack(spacing: 5) {
                    Text("💎")
                        .font(.title2)
                    Text("\(reward.gemCost) gems")
                        .font(.system(size: 18, weight: .semibold, design: .rounded))
                        .foregroundColor(.yellow)
                }
            }

            Spacer()

            Button {
                showRedemptionAlert = true
            } label: {
                Text("Redeem")
                    .font(.system(size: 18, weight: .semibold, design: .rounded))
                    .foregroundColor(.white)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(canAfford ? Color.green : Color.gray)
                    .cornerRadius(10)
            }
            .disabled(!canAfford)
        }
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(15)
        .opacity(canAfford ? 1.0 : 0.6)
        .alert("Redeem Reward?", isPresented: $showRedemptionAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Redeem") {
                onRedeem()
            }
        } message: {
            Text("Redeem \(reward.title) for \(reward.gemCost) gems?")
        }
    }
}
