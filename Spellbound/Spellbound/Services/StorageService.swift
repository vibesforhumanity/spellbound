import Foundation
import SwiftUI
import Combine

class StorageService: ObservableObject {
    @AppStorage("gemstoneCount") var gemstones: Int = 0
    @AppStorage("totalWordsCorrect") var totalCorrect: Int = 0
    @AppStorage("totalWordsPracticed") var totalPracticed: Int = 0
    @AppStorage("selectionStrategy") private var strategyRawValue: String = "balanced"

    private let sessionsKey = "practice_sessions"
    private let patternStatsKey = "pattern_statistics"

    var currentStrategy: SelectionStrategy {
        SelectionStrategy(rawValue: strategyRawValue) ?? .balanced
    }

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

    // MARK: - Pattern Statistics Persistence

    func savePatternStats(_ stats: [PhonicsPatternType: PatternPerformance]) {
        let entries = stats.map { PatternStatEntry(patternType: $0.key, performance: $0.value) }

        if let encoded = try? JSONEncoder().encode(entries) {
            UserDefaults.standard.set(encoded, forKey: patternStatsKey)
        }
    }

    func loadPatternStats() -> [PhonicsPatternType: PatternPerformance] {
        guard let data = UserDefaults.standard.data(forKey: patternStatsKey),
              let entries = try? JSONDecoder().decode([PatternStatEntry].self, from: data) else {
            return [:]
        }

        var stats: [PhonicsPatternType: PatternPerformance] = [:]
        for entry in entries {
            stats[entry.patternType] = entry.performance
        }
        return stats
    }
}

// Helper struct for encoding pattern stats dictionary
private struct PatternStatEntry: Codable {
    let patternType: PhonicsPatternType
    let performance: PatternPerformance
}
