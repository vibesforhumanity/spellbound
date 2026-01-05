import Foundation
import SwiftUI
import Combine

// Timer for auto-progression
import Dispatch

class PracticeViewModel: ObservableObject {
    @Published var currentWord: Word?
    @Published var userInput: String = ""
    @Published var isCorrect: Bool?
    @Published var showFeedback: Bool = false
    @Published var lastIncorrectAttempt: String = ""
    @Published var showClue: Bool = false
    @Published var currentSession: Session
    @Published var sessionWords: [Word] = []
    @Published var retryQueue: [Word] = []
    @Published var practiceWordIds: Set<UUID> = []
    @Published var currentIndex: Int = 0
    @Published var isSessionComplete: Bool = false
    @Published var incorrectPatterns: [DetectedPattern] = []
    @Published var showMultipleChoice: Bool = false
    @Published var currentMultipleChoiceQuestion: MultipleChoiceQuestion?
    @Published var patternReinforcementAttempts: Int = 0

    private let wordService: WordService
    let ttsService: TTSService
    private let storageService: StorageService
    private let adaptiveService: AdaptiveSelectionService
    let agentService: AgentService

    private let wordsPerSession = 15
    private let maxPatternReinforcementAttempts = 3
    private var currentReinforcementPattern: DetectedPattern?

    init(wordService: WordService, ttsService: TTSService, storageService: StorageService) {
        self.wordService = wordService
        self.ttsService = ttsService
        self.storageService = storageService
        self.adaptiveService = AdaptiveSelectionService()
        self.agentService = AgentService()
        self.currentSession = Session()

        startSession()
    }

    func startSession() {
        let allWords = wordService.words
        let sessions = storageService.loadSessions()

        // Calculate pattern statistics from session history
        let patternStats = adaptiveService.calculatePatternStats(from: allWords, sessions: sessions)

        // Use adaptive selection with balanced strategy
        sessionWords = adaptiveService.selectWords(
            count: wordsPerSession,
            from: allWords,
            patternStats: patternStats,
            strategy: storageService.currentStrategy,
            sessionHistory: sessions
        )

        practiceWordIds = Set(sessionWords.map { $0.id })

        print("🎯 Strategy: \(storageService.currentStrategy.rawValue)")
        print("📚 Selected \(sessionWords.count) words for this session")

        // Start with first word
        if !sessionWords.isEmpty {
            currentWord = sessionWords[0]
            currentIndex = 0
            // Don't auto-speak - wait for user to tap speaker button
        }
    }

    func speakCurrentWord() {
        guard let word = currentWord else { return }
        ttsService.speak(word.text, type: .word, word: word.text)
    }

    func speakSentence() {
        guard let word = currentWord else { return }
        ttsService.speak(word.exampleSentence, type: .sentence, word: word.text)
    }

    func speakDefinition() {
        guard let word = currentWord else { return }
        ttsService.speak(word.definitionHint, type: .definition, word: word.text)
    }
    
    func speakTip() {
        guard let word = currentWord, let tip = word.tip, !tip.isEmpty else { return }
        ttsService.speak(tip, type: .plain, word: nil) // Playing as plain text for now, could be .tip type later
    }

    func toggleClue() {
        showClue.toggle()

        // Pre-fill first letter when enabling clue
        if showClue, let firstLetter = currentWord?.text.prefix(1) {
            userInput = String(firstLetter)
        }
    }

    func checkAnswer() {
        guard let word = currentWord else { return }

        let correct = userInput.lowercased().trimmingCharacters(in: .whitespacesAndNewlines) == word.text.lowercased()
        isCorrect = correct

        // Save incorrect attempt for feedback display
        if !correct {
            lastIncorrectAttempt = userInput.trimmingCharacters(in: .whitespacesAndNewlines)
            // Identify which patterns were incorrect
            incorrectPatterns = identifyIncorrectPatterns(
                userAttempt: lastIncorrectAttempt,
                correctWord: word
            )
        }

        // Track patterns practiced in this session
        for pattern in word.patterns {
            if !currentSession.patternsPracticed.contains(pattern.type) {
                currentSession.patternsPracticed.append(pattern.type)
            }
        }

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
            // Add to retry queue - will keep retrying until correct
            if !retryQueue.contains(where: { $0.id == word.id }) && currentIndex < sessionWords.count {
                // Only add if this is from the main session words
                retryQueue.append(word)
            } else if currentIndex >= sessionWords.count {
                // If this is already from retry queue, add it back to the end
                retryQueue.append(word)
            }
        }

        storageService.totalPracticed += 1

        // Log word details
        let patternNames = word.patterns.map { $0.type.displayName }.joined(separator: ", ")
        print("📝 Word: '\(word.text)' | Difficulty: \(String(format: "%.1f", word.difficultyScore)) | Patterns: [\(patternNames)] | Result: \(correct ? "✅ Correct" : "❌ Incorrect")")

        // Show feedback
        showFeedback = true

        // Auto-progress to next word if correct (after brief delay for checkmark animation)
        if correct {
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in
                self?.nextWord()
            }
        }
    }

    func nextWord() {
        // Check if we need pattern reinforcement before moving to next word
        if checkIfNeedsPatternReinforcement() {
            showFeedback = false
            generatePatternQuestion()
            return
        }

        // Normal progression
        showFeedback = false
        userInput = ""
        isCorrect = nil
        showClue = false
        incorrectPatterns = []
        resetPatternReinforcement()
        currentIndex += 1

        // Check if main words are done
        if currentIndex < sessionWords.count {
            currentWord = sessionWords[currentIndex]
            speakCurrentWord()
        } else if !retryQueue.isEmpty {
            // Practice retry queue
            currentWord = retryQueue.removeFirst()
            speakCurrentWord()
        } else {
            // Session complete
            endSession()
        }
    }

    func endSession() {
        isSessionComplete = true
        storageService.saveSession(currentSession)

        // Calculate and save pattern statistics
        let sessions = storageService.loadSessions()
        let patternStats = adaptiveService.calculatePatternStats(from: wordService.words, sessions: sessions)
        storageService.savePatternStats(patternStats)

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

    // MARK: - Pattern Analysis

    private func identifyIncorrectPatterns(userAttempt: String, correctWord: Word) -> [DetectedPattern] {
        var incorrect: [DetectedPattern] = []
        let userLowercased = userAttempt.lowercased()
        let correctLowercased = correctWord.text.lowercased()

        // Compare each pattern's position in the word
        for pattern in correctWord.patterns {
            let range = pattern.position
            guard range.lowerBound < correctLowercased.count,
                  range.upperBound <= correctLowercased.count else { continue }

            // Get the correct substring
            let correctStart = correctLowercased.index(correctLowercased.startIndex, offsetBy: range.lowerBound)
            let correctEnd = correctLowercased.index(correctLowercased.startIndex, offsetBy: range.upperBound)
            let correctSubstring = String(correctLowercased[correctStart..<correctEnd])

            // Get the user's attempt at the same position (if exists)
            if range.upperBound <= userLowercased.count {
                let userStart = userLowercased.index(userLowercased.startIndex, offsetBy: range.lowerBound)
                let userEnd = userLowercased.index(userLowercased.startIndex, offsetBy: range.upperBound)
                let userSubstring = String(userLowercased[userStart..<userEnd])

                // If they don't match, this pattern was spelled incorrectly
                if userSubstring != correctSubstring {
                    incorrect.append(pattern)
                }
            } else {
                // User's attempt is too short to include this pattern
                incorrect.append(pattern)
            }
        }

        return incorrect
    }

    // MARK: - Input Validation

    var canCheckSpelling: Bool {
        guard let word = currentWord else { return false }
        let requiredLength = Int(ceil(Double(word.text.count) * 0.7))
        return userInput.trimmingCharacters(in: .whitespacesAndNewlines).count >= requiredLength
    }

    // MARK: - Pattern Reinforcement with Multiple Choice

    func checkIfNeedsPatternReinforcement() -> Bool {
        // Only trigger pattern reinforcement if:
        // 1. User got the word wrong
        // 2. There's a clear pattern they're struggling with
        // 3. Haven't exceeded max attempts for this pattern
        guard !incorrectPatterns.isEmpty,
              patternReinforcementAttempts < maxPatternReinforcementAttempts else {
            return false
        }

        // Focus on the first incorrect pattern
        currentReinforcementPattern = incorrectPatterns.first
        return true
    }

    func generatePatternQuestion() {
        guard let pattern = currentReinforcementPattern,
              let word = currentWord else { return }

        // Call agent API to generate question using Claude Agent SDK
        Task {
            let question = await agentService.generatePatternQuestion(
                sessionId: currentSession.id.uuidString,
                incorrectWord: word.text,
                userAttempt: lastIncorrectAttempt,
                pattern: pattern.type.displayName,
                previousAttempts: patternReinforcementAttempts
            )

            await MainActor.run {
                if let question = question {
                    // Agent successfully generated question
                    currentMultipleChoiceQuestion = question
                    showMultipleChoice = true
                    patternReinforcementAttempts += 1
                } else {
                    // Fallback to local generation if agent fails
                    print("⚠️ Agent API unavailable, using local fallback")
                    let localQuestion = createLocalPatternQuestion(
                        pattern: pattern,
                        incorrectWord: word.text,
                        userAttempt: lastIncorrectAttempt
                    )
                    currentMultipleChoiceQuestion = localQuestion
                    showMultipleChoice = true
                    patternReinforcementAttempts += 1
                }
            }
        }
    }

    func handleMultipleChoiceAnswer(selectedAnswer: String, isCorrect: Bool) {
        if isCorrect {
            // Pattern mastered! Reset and continue
            print("✅ Pattern reinforcement successful after \(patternReinforcementAttempts) attempts")
            resetPatternReinforcement()
            showMultipleChoice = false

            // Continue to next word
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
                self?.nextWord()
            }
        } else {
            // Try again (up to max attempts)
            if patternReinforcementAttempts < maxPatternReinforcementAttempts {
                print("❌ Incorrect. Generating another question (attempt \(patternReinforcementAttempts + 1)/\(maxPatternReinforcementAttempts))")
                showMultipleChoice = false

                // Generate next question
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
                    self?.generatePatternQuestion()
                }
            } else {
                // Max attempts reached, move on
                print("⏭️  Max attempts reached. Moving to next word.")
                resetPatternReinforcement()
                showMultipleChoice = false

                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
                    self?.nextWord()
                }
            }
        }
    }

    private func resetPatternReinforcement() {
        patternReinforcementAttempts = 0
        currentReinforcementPattern = nil
        currentMultipleChoiceQuestion = nil
    }

    // MARK: - Local Pattern Question Generation
    // TODO: Replace with agent API calls in production

    private func createLocalPatternQuestion(
        pattern: DetectedPattern,
        incorrectWord: String,
        userAttempt: String
    ) -> MultipleChoiceQuestion {
        let patternType = pattern.type

        // Generate questions based on pattern type
        switch patternType {
        case .suffix_tion, .suffix_sion:
            return MultipleChoiceQuestion(
                question: "Which word is spelled INCORRECTLY?",
                options: ["a) nation", "b) vacation", "c) stashun", "d) mention"],
                correctAnswer: "c) stashun",
                explanation: "The '-tion' suffix makes the 'shun' sound. Station is spelled with -tion, not -shun!"
            )

        case .vowelTeam_ea:
            return MultipleChoiceQuestion(
                question: "Which word is spelled INCORRECTLY?",
                options: ["a) bead", "b) rech", "c) teach", "d) beach"],
                correctAnswer: "b) rech",
                explanation: "The 'ea' vowel team makes the long 'e' sound. Reach is spelled with 'ea', not just 'e'!"
            )

        case .vowelTeam_oo:
            return MultipleChoiceQuestion(
                question: "Which word is spelled INCORRECTLY?",
                options: ["a) moon", "b) soon", "c) aftirnoon", "d) spoon"],
                correctAnswer: "c) aftirnoon",
                explanation: "The 'oo' makes the long 'oo' sound. Afternoon has 'oo', and it's spelled a-f-t-e-r-n-o-o-n!"
            )

        case .silent_e:
            return MultipleChoiceQuestion(
                question: "Which word is spelled INCORRECTLY?",
                options: ["a) make", "b) hop", "c) take", "d) bike"],
                correctAnswer: "b) hop",
                explanation: "Words with silent 'e' at the end make the vowel say its name. Hope has silent 'e', hop doesn't!"
            )

        default:
            // Generic question for other patterns
            return MultipleChoiceQuestion(
                question: "Which word is spelled INCORRECTLY?",
                options: ["a) \(incorrectWord)", "b) \(userAttempt)", "c) cat", "d) dog"],
                correctAnswer: "b) \(userAttempt)",
                explanation: "The correct spelling is '\(incorrectWord)'. Remember the \(patternType.displayName) pattern!"
            )
        }
    }
}
