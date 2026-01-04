import Foundation
import SwiftUI

class PracticeViewModel: ObservableObject {
    @Published var currentWord: Word?
    @Published var userInput: String = ""
    @Published var isCorrect: Bool?
    @Published var showFeedback: Bool = false
    @Published var currentSession: Session
    @Published var sessionWords: [Word] = []
    @Published var retryQueue: [Word] = []
    @Published var practiceWordIds: Set<UUID> = []
    @Published var currentIndex: Int = 0
    @Published var isSessionComplete: Bool = false

    private let wordService: WordService
    private let ttsService: TTSService
    private let storageService: StorageService

    private let wordsPerSession = 10

    init(wordService: WordService, ttsService: TTSService, storageService: StorageService) {
        self.wordService = wordService
        self.ttsService = ttsService
        self.storageService = storageService
        self.currentSession = Session()

        startSession()
    }

    func startSession() {
        // Select random words for this session
        let allWords = wordService.words
        sessionWords = Array(allWords.shuffled().prefix(wordsPerSession))
        practiceWordIds = Set(sessionWords.map { $0.id })

        // Start with first word
        if !sessionWords.isEmpty {
            currentWord = sessionWords[0]
            currentIndex = 0
            ttsService.speak(currentWord!.text)
        }
    }

    func speakCurrentWord() {
        guard let word = currentWord else { return }
        ttsService.speak(word.text)
    }

    func checkAnswer() {
        guard let word = currentWord else { return }

        let correct = userInput.lowercased().trimmingCharacters(in: .whitespacesAndNewlines) == word.text.lowercased()
        isCorrect = correct

        // Update session
        currentSession.wordsAttempted.append((word: word.text, correct: correct))

        if correct {
            wordService.markCorrect(word.id)
            storageService.totalCorrect += 1

            // Award gems (1 per 10 correct)
            if currentSession.correctCount % 10 == 0 {
                let gemsEarned = 1
                currentSession.gemsEarned += gemsEarned
                storageService.addGems(gemsEarned)
            }
        } else {
            wordService.markIncorrect(word.id)
            // Add to retry queue if not already there
            if !retryQueue.contains(where: { $0.id == word.id }) {
                retryQueue.append(word)
            }
        }

        storageService.totalPracticed += 1

        // Show feedback
        showFeedback = true
    }

    func nextWord() {
        showFeedback = false
        userInput = ""
        isCorrect = nil
        currentIndex += 1

        // Check if main words are done
        if currentIndex < sessionWords.count {
            currentWord = sessionWords[currentIndex]
            ttsService.speak(currentWord!.text)
        } else if !retryQueue.isEmpty {
            // Practice retry queue
            currentWord = retryQueue.removeFirst()
            ttsService.speak(currentWord!.text)
        } else {
            // Session complete
            endSession()
        }
    }

    func endSession() {
        isSessionComplete = true
        storageService.saveSession(currentSession)
        ttsService.stop()
    }

    func resetSession() {
        currentSession = Session()
        retryQueue = []
        practiceWordIds = []
        currentIndex = 0
        isSessionComplete = false
        userInput = ""
        isCorrect = nil
        showFeedback = false

        startSession()
    }

    var sessionProgress: (current: Int, total: Int) {
        (currentIndex + 1, sessionWords.count + retryQueue.count)
    }

    var totalWords: Int {
        sessionWords.count
    }
}
