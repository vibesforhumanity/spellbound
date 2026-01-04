import Foundation

struct Session: Identifiable, Codable {
    let id: UUID
    let date: Date
    var wordsAttempted: [(word: String, correct: Bool)]
    var gemsEarned: Int = 0

    // Track patterns practiced in this session
    var patternsPracticed: [PhonicsPatternType] = []

    var correctCount: Int {
        wordsAttempted.filter { $0.correct }.count
    }

    var totalCount: Int {
        wordsAttempted.count
    }

    var accuracy: Double {
        guard totalCount > 0 else { return 0 }
        return Double(correctCount) / Double(totalCount)
    }

    init(id: UUID = UUID(), date: Date = Date()) {
        self.id = id
        self.date = date
        self.wordsAttempted = []
    }

    // Custom Codable implementation for tuple array
    enum CodingKeys: String, CodingKey {
        case id, date, wordsAttempted, gemsEarned, patternsPracticed
    }

    struct WordAttempt: Codable {
        let word: String
        let correct: Bool
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(UUID.self, forKey: .id)
        date = try container.decode(Date.self, forKey: .date)
        let attempts = try container.decode([WordAttempt].self, forKey: .wordsAttempted)
        wordsAttempted = attempts.map { ($0.word, $0.correct) }
        gemsEarned = try container.decode(Int.self, forKey: .gemsEarned)
        patternsPracticed = (try? container.decode([PhonicsPatternType].self, forKey: .patternsPracticed)) ?? []
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(date, forKey: .date)
        let attempts = wordsAttempted.map { WordAttempt(word: $0.word, correct: $0.correct) }
        try container.encode(attempts, forKey: .wordsAttempted)
        try container.encode(gemsEarned, forKey: .gemsEarned)
        try container.encode(patternsPracticed, forKey: .patternsPracticed)
    }
}
