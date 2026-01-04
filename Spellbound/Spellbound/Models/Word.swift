import Foundation

struct Word: Identifiable, Codable {
    let id: UUID
    let text: String
    let sentence: String
    let definition: String
    let tip: String?
    var timesCorrect: Int = 0
    var timesIncorrect: Int = 0
    var lastPracticed: Date?

    // Adaptive learning properties
    var patterns: [DetectedPattern] = []
    var difficultyScore: Double = 0.0
    var masteryLevel: Double = 0.0

    init(id: UUID = UUID(), text: String, sentence: String = "", definition: String = "", tip: String? = nil) {
        self.id = id
        self.text = text
        self.sentence = sentence
        self.definition = definition
        self.tip = tip
    }

    // Computed properties for backward compatibility
    var exampleSentence: String {
        sentence.isEmpty ? "Can you spell \(text)?" : sentence
    }

    var definitionHint: String {
        definition.isEmpty ? "This is the word: \(text)" : definition
    }

    var spellingTip: String {
        tip ?? "No tip available."
    }

    // Computed property for accuracy
    var accuracy: Double {
        let total = timesCorrect + timesIncorrect
        guard total > 0 else { return 0 }
        return Double(timesCorrect) / Double(total)
    }

    // Update mastery level based on performance
    mutating func updateMastery() {
        let accuracyComponent = accuracy * 0.6

        let repetitions = timesCorrect + timesIncorrect
        let repetitionComponent = min(Double(repetitions) / 5.0, 1.0) * 0.3

        let recencyComponent = recencyFactor() * 0.1

        masteryLevel = accuracyComponent + repetitionComponent + recencyComponent
    }

    // Calculate recency factor (1.0 if practiced recently, lower if not)
    private func recencyFactor() -> Double {
        guard let lastPracticed = lastPracticed else { return 0.0 }

        let daysSince = Date().timeIntervalSince(lastPracticed) / 86400.0

        if daysSince < 1 {
            return 1.0
        } else if daysSince < 7 {
            return 0.7
        } else if daysSince < 30 {
            return 0.4
        } else {
            return 0.1
        }
    }
}
