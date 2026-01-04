import Foundation

class WordService: ObservableObject {
    @Published var words: [Word] = []

    func loadWords() {
        guard let url = Bundle.main.url(forResource: "wordlist", withExtension: "txt", subdirectory: "words") else {
            print("❌ Could not find wordlist.txt in bundle")
            return
        }

        do {
            let contents = try String(contentsOf: url, encoding: .utf8)
            let lines = contents.components(separatedBy: .newlines)
                .map { $0.trimmingCharacters(in: .whitespaces) }
                .filter { !$0.isEmpty && !$0.hasPrefix("#") }

            words = lines.map { Word(text: $0) }
            print("✅ Loaded \(words.count) words")
        } catch {
            print("❌ Error loading words: \(error)")
        }
    }

    func getNextWord(from words: [Word], excluding: Set<UUID>) -> Word? {
        let availableWords = words.filter { !excluding.contains($0.id) }
        return availableWords.randomElement()
    }

    func markCorrect(_ wordId: UUID) {
        if let index = words.firstIndex(where: { $0.id == wordId }) {
            words[index].timesCorrect += 1
            words[index].lastPracticed = Date()
        }
    }

    func markIncorrect(_ wordId: UUID) {
        if let index = words.firstIndex(where: { $0.id == wordId }) {
            words[index].timesIncorrect += 1
            words[index].lastPracticed = Date()
        }
    }
}
