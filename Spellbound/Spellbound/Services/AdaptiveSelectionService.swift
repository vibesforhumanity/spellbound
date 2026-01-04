import Foundation

enum SelectionStrategy: String, Codable {
    case focusWeakPatterns
    case gradualDifficulty
    case balanced
}

class AdaptiveSelectionService {

    // MARK: - Main Selection Algorithm

    func selectWords(
        count: Int,
        from allWords: [Word],
        patternStats: [PhonicsPatternType: PatternPerformance],
        strategy: SelectionStrategy,
        sessionHistory: [Session]
    ) -> [Word] {
        switch strategy {
        case .focusWeakPatterns:
            return selectFocusedOnWeakPatterns(count: count, from: allWords, patternStats: patternStats)
        case .gradualDifficulty:
            return selectGradualDifficulty(count: count, from: allWords, sessionHistory: sessionHistory)
        case .balanced:
            return selectBalanced(count: count, from: allWords, patternStats: patternStats, sessionHistory: sessionHistory)
        }
    }

    // MARK: - Strategy 1: Focus on Weak Patterns

    private func selectFocusedOnWeakPatterns(
        count: Int,
        from allWords: [Word],
        patternStats: [PhonicsPatternType: PatternPerformance]
    ) -> [Word] {
        var selectedWords: [Word] = []
        var usedWordIDs = Set<UUID>()

        // Identify weak patterns (accuracy < 70%)
        let weakPatterns = patternStats.values
            .filter { $0.isWeak }
            .sorted { $0.accuracy < $1.accuracy } // Weakest first
            .prefix(5) // Top 5 weakest patterns

        // Select 2 words per weak pattern
        for patternPerf in weakPatterns {
            let wordsWithPattern = allWords.filter { word in
                !usedWordIDs.contains(word.id) &&
                word.patterns.contains { $0.type == patternPerf.patternType }
            }

            let selected = wordsWithPattern
                .sorted { $0.masteryLevel < $1.masteryLevel } // Least mastered first
                .prefix(2)

            for word in selected {
                selectedWords.append(word)
                usedWordIDs.insert(word.id)
            }

            if selectedWords.count >= count { break }
        }

        // Fill remaining slots with unmastered words
        if selectedWords.count < count {
            let remaining = allWords
                .filter { !usedWordIDs.contains($0.id) && $0.masteryLevel < 0.8 }
                .sorted { $0.masteryLevel < $1.masteryLevel }
                .prefix(count - selectedWords.count)

            selectedWords.append(contentsOf: remaining)
        }

        // Final fallback: if still not enough, add random unused words
        if selectedWords.count < count {
            let finalFallback = allWords
                .filter { !usedWordIDs.contains($0.id) }
                .shuffled()
                .prefix(count - selectedWords.count)

            selectedWords.append(contentsOf: finalFallback)
        }

        // Shuffle to avoid pattern clustering
        return selectedWords.shuffled()
    }

    // MARK: - Strategy 2: Gradual Difficulty

    private func selectGradualDifficulty(
        count: Int,
        from allWords: [Word],
        sessionHistory: [Session]
    ) -> [Word] {
        // Calculate user skill level from last 5 sessions
        let recentSessions = Array(sessionHistory.suffix(5))
        let averageAccuracy = calculateAverageAccuracy(from: recentSessions)

        // Map to target difficulty range
        let (minDifficulty, maxDifficulty) = difficultyRange(for: averageAccuracy)

        // Select words in target range, prioritize unmastered
        let selectedWords = allWords
            .filter { $0.difficultyScore >= minDifficulty && $0.difficultyScore <= maxDifficulty }
            .sorted { word1, word2 in
                // First sort by mastery level (unmastered first)
                if word1.masteryLevel != word2.masteryLevel {
                    return word1.masteryLevel < word2.masteryLevel
                }
                // Then by difficulty (easier first)
                return word1.difficultyScore < word2.difficultyScore
            }
            .prefix(count)

        var result = Array(selectedWords)

        // Fallback: if not enough words in range, expand range and add more
        if result.count < count {
            let usedIDs = Set(result.map { $0.id })
            let additionalWords = allWords
                .filter { !usedIDs.contains($0.id) }
                .sorted { $0.masteryLevel < $1.masteryLevel }
                .prefix(count - result.count)

            result.append(contentsOf: additionalWords)
        }

        // Don't shuffle - maintain difficulty progression
        return result
    }

    // MARK: - Strategy 3: Balanced (60% weak patterns + 40% gradual difficulty)

    private func selectBalanced(
        count: Int,
        from allWords: [Word],
        patternStats: [PhonicsPatternType: PatternPerformance],
        sessionHistory: [Session]
    ) -> [Word] {
        let weakPatternCount = Int(ceil(Double(count) * 0.6)) // 60%
        let gradualDifficultyCount = count - weakPatternCount // 40%

        // Get words from each strategy
        let weakPatternWords = selectFocusedOnWeakPatterns(
            count: weakPatternCount,
            from: allWords,
            patternStats: patternStats
        )

        let usedWordIDs = Set(weakPatternWords.map { $0.id })
        let remainingWords = allWords.filter { !usedWordIDs.contains($0.id) }

        let gradualWords = selectGradualDifficulty(
            count: gradualDifficultyCount,
            from: remainingWords,
            sessionHistory: sessionHistory
        )

        // Combine and shuffle
        let combined = weakPatternWords + gradualWords
        return combined.shuffled()
    }

    // MARK: - Helper Methods

    func calculatePatternStats(
        from allWords: [Word],
        sessions: [Session]
    ) -> [PhonicsPatternType: PatternPerformance] {
        var stats: [PhonicsPatternType: PatternPerformance] = [:]

        // Initialize all pattern types with zero stats
        for patternType in PhonicsPatternType.allCases {
            stats[patternType] = PatternPerformance(patternType: patternType)
        }

        // Create a word lookup dictionary
        let wordLookup = Dictionary(uniqueKeysWithValues: allWords.map { ($0.text.lowercased(), $0) })

        // Iterate through sessions and update pattern stats
        for session in sessions {
            for attempt in session.wordsAttempted {
                guard let word = wordLookup[attempt.word.lowercased()] else { continue }

                // Update stats for each pattern in the word
                for pattern in word.patterns {
                    var performance = stats[pattern.type] ?? PatternPerformance(patternType: pattern.type)

                    if attempt.correct {
                        performance.timesCorrect += 1
                    } else {
                        performance.timesIncorrect += 1
                    }
                    performance.lastPracticed = session.date

                    stats[pattern.type] = performance
                }
            }
        }

        return stats
    }

    private func calculateAverageAccuracy(from sessions: [Session]) -> Double {
        guard !sessions.isEmpty else { return 0.5 } // Default to 50% if no history

        var totalCorrect = 0
        var totalAttempts = 0

        for session in sessions {
            totalCorrect += session.correctCount
            totalAttempts += session.totalCount
        }

        guard totalAttempts > 0 else { return 0.5 }
        return Double(totalCorrect) / Double(totalAttempts)
    }

    private func difficultyRange(for accuracy: Double) -> (min: Double, max: Double) {
        switch accuracy {
        case ..<0.5:
            return (10, 40) // Easy words
        case 0.5..<0.7:
            return (30, 60) // Medium words
        case 0.7..<0.85:
            return (50, 80) // Medium-hard words
        default:
            return (70, 100) // Hard words
        }
    }
}
