import Foundation

struct PatternPerformance: Codable {
    let patternType: PhonicsPatternType
    var timesCorrect: Int = 0
    var timesIncorrect: Int = 0
    var lastPracticed: Date?

    var accuracy: Double {
        let total = timesCorrect + timesIncorrect
        guard total > 0 else { return 0 }
        return Double(timesCorrect) / Double(total)
    }

    var totalAttempts: Int {
        timesCorrect + timesIncorrect
    }

    var isWeak: Bool {
        // Pattern is weak if accuracy < 70% and has been attempted at least twice
        totalAttempts >= 2 && accuracy < 0.7
    }

    var needsPractice: Bool {
        // Needs practice if weak OR hasn't been seen in 7+ days
        if isWeak { return true }

        guard let lastDate = lastPracticed else { return true }
        let daysSince = Date().timeIntervalSince(lastDate) / 86400
        return daysSince >= 7
    }
}
