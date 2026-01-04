import Foundation
import SwiftUI

class StorageService: ObservableObject {
    @AppStorage("gemstoneCount") var gemstones: Int = 0
    @AppStorage("totalWordsCorrect") var totalCorrect: Int = 0
    @AppStorage("totalWordsPracticed") var totalPracticed: Int = 0

    private let sessionsKey = "practice_sessions"

    func saveSession(_ session: Session) {
        var sessions = loadSessions()
        sessions.append(session)

        // Keep only last 30 sessions
        if sessions.count > 30 {
            sessions = Array(sessions.suffix(30))
        }

        if let encoded = try? JSONEncoder().encode(sessions) {
            UserDefaults.standard.set(encoded, forKey: sessionsKey)
        }
    }

    func loadSessions() -> [Session] {
        guard let data = UserDefaults.standard.data(forKey: sessionsKey),
              let sessions = try? JSONDecoder().decode([Session].self, from: data) else {
            return []
        }
        return sessions
    }

    func redeemReward(_ reward: Reward) {
        guard gemstones >= reward.gemCost else {
            print("❌ Not enough gems to redeem \(reward.title)")
            return
        }

        gemstones -= reward.gemCost
        print("✅ Redeemed: \(reward.title)")
    }

    func addGems(_ count: Int) {
        gemstones += count
    }
}
