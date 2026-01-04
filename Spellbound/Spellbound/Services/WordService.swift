import Foundation
import Combine

struct WordData: Codable {
    let text: String
    let sentence: String
    let definition: String
}

class WordService: ObservableObject {
    @Published var words: [Word] = []
    private let patternService = PhonicsPatternService()

    func loadWords() {
        // Try JSON format first
        if let jsonUrl = Bundle.main.url(forResource: "wordlist", withExtension: "json") {
            loadWordsFromJSON(url: jsonUrl)
        }
        // Fallback to TXT format for backward compatibility
        else if let txtUrl = Bundle.main.url(forResource: "wordlist", withExtension: "txt") {
            loadWordsFromTXT(url: txtUrl)
        }
        else {
            print("❌ Could not find wordlist.json or wordlist.txt in bundle")
            print("❌ Make sure wordlist file is added to the Xcode project target")
        }
    }

    private func loadWordsFromJSON(url: URL) {
        do {
            let data = try Data(contentsOf: url)
            let wordDataArray = try JSONDecoder().decode([WordData].self, from: data)

            words = wordDataArray.map { wordData in
                Word(text: wordData.text, sentence: wordData.sentence, definition: wordData.definition)
            }
            print("✅ Loaded \(words.count) words from JSON")

            // Analyze patterns after loading
            analyzePatterns()
        } catch {
            print("❌ Error loading words from JSON: \(error)")
        }
    }

    private func loadWordsFromTXT(url: URL) {
        do {
            let contents = try String(contentsOf: url, encoding: .utf8)
            let lines = contents.components(separatedBy: .newlines)
                .map { $0.trimmingCharacters(in: .whitespaces) }
                .filter { !$0.isEmpty && !$0.hasPrefix("#") }

            words = lines.map { Word(text: $0) }
            print("✅ Loaded \(words.count) words from TXT")

            // Analyze patterns after loading
            analyzePatterns()
        } catch {
            print("❌ Error loading words from TXT: \(error)")
        }
    }

    // MARK: - Pattern Analysis

    private func analyzePatterns() {
        let startTime = Date()
        var patternDistribution: [PhonicsPatternType: Int] = [:]

        for i in 0..<words.count {
            // Detect patterns
            let patterns = patternService.detectPatterns(in: words[i].text)
            words[i].patterns = patterns

            // Calculate difficulty
            let difficulty = patternService.calculateDifficulty(for: words[i].text, patterns: patterns)
            words[i].difficultyScore = difficulty

            // Initialize mastery
            words[i].updateMastery()

            // Track pattern distribution for logging
            for pattern in patterns {
                patternDistribution[pattern.type, default: 0] += 1
            }
        }

        let elapsed = Date().timeIntervalSince(startTime)
        print("✅ Pattern analysis complete in \(String(format: "%.2f", elapsed))s")
        print("📊 Detected \(patternDistribution.count) unique pattern types across \(words.count) words")
    }

    func getNextWord(from words: [Word], excluding: Set<UUID>) -> Word? {
        let availableWords = words.filter { !excluding.contains($0.id) }
        return availableWords.randomElement()
    }

    func markCorrect(_ wordId: UUID) {
        if let index = words.firstIndex(where: { $0.id == wordId }) {
            words[index].timesCorrect += 1
            words[index].lastPracticed = Date()
            words[index].updateMastery()
        }
    }

    func markIncorrect(_ wordId: UUID) {
        if let index = words.firstIndex(where: { $0.id == wordId }) {
            words[index].timesIncorrect += 1
            words[index].lastPracticed = Date()
            words[index].updateMastery()
        }
    }
}
