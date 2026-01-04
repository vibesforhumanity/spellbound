import SwiftUI

struct ResultsView: View {
    let session: Session
    let gemsEarned: Int
    let totalGems: Int
    let wordService: WordService
    let onDone: () -> Void

    private var incorrectWords: [String] {
        session.wordsAttempted
            .filter { !$0.correct }
            .map { $0.word }
    }

    private var patternAnalysis: (mastered: [PhonicsPatternType], challenging: [(pattern: PhonicsPatternType, missedWords: [String], examples: [String])]) {
        var patternResults: [PhonicsPatternType: (correct: Int, total: Int, missedWords: [String])] = [:]

        // Build word lookup
        let wordLookup = Dictionary(uniqueKeysWithValues: wordService.words.map { ($0.text.lowercased(), $0) })

        // Analyze each word attempted
        for attempt in session.wordsAttempted {
            guard let word = wordLookup[attempt.word.lowercased()] else { continue }

            for pattern in word.patterns {
                let current = patternResults[pattern.type] ?? (correct: 0, total: 0, missedWords: [])
                var updated = current

                if attempt.correct {
                    updated.correct += 1
                } else {
                    updated.missedWords.append(attempt.word)
                }
                updated.total += 1

                patternResults[pattern.type] = updated
            }
        }

        var mastered: [PhonicsPatternType] = []
        var challenging: [(pattern: PhonicsPatternType, missedWords: [String], examples: [String])] = []

        for (patternType, results) in patternResults {
            let accuracy = Double(results.correct) / Double(results.total)
            if accuracy >= 0.8 && results.total >= 2 {
                mastered.append(patternType)
            } else if accuracy < 0.6 && results.total >= 2 {
                // Find example words with this pattern (exclude missed words)
                let examples = wordService.words
                    .filter { word in
                        word.patterns.contains { $0.type == patternType } &&
                        !results.missedWords.contains(word.text)
                    }
                    .map { $0.text }
                    .shuffled()
                    .prefix(3)

                challenging.append((
                    pattern: patternType,
                    missedWords: results.missedWords,
                    examples: Array(examples)
                ))
            }
        }

        return (mastered.sorted { $0.displayName < $1.displayName },
                challenging.sorted { $0.pattern.displayName < $1.pattern.displayName })
    }

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [.purple.opacity(0.3), .blue.opacity(0.3)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 40) {
                Spacer()

                Text("Great Job!")
                    .font(.system(size: 48, weight: .bold, design: .rounded))
                    .foregroundColor(.primary)

                // Gems earned message
                if gemsEarned > 0 {
                    HStack(spacing: 8) {
                        Text("You've earned")
                        Text("\(gemsEarned)")
                            .fontWeight(.bold)
                        Text("gemstone\(gemsEarned == 1 ? "" : "s")")
                        Text("💎")
                            .font(.title)
                    }
                    .font(.system(size: 24, weight: .medium, design: .rounded))
                    .foregroundColor(.primary)
                    .padding(20)
                    .background(.ultraThinMaterial)
                    .cornerRadius(16)
                }

                // Pattern Analysis
                let analysis = patternAnalysis

                // Mastered patterns
                if !analysis.mastered.isEmpty {
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Text("🌟")
                                .font(.title2)
                            Text("Patterns Mastered:")
                                .font(.system(size: 20, weight: .semibold, design: .rounded))
                                .foregroundColor(.primary)
                            Spacer()
                        }

                        ForEach(analysis.mastered.prefix(5), id: \.self) { pattern in
                            HStack {
                                Text("✓")
                                    .foregroundColor(.green)
                                    .font(.system(size: 16, weight: .bold))
                                Text(pattern.displayName)
                                    .font(.system(size: 16, weight: .medium, design: .rounded))
                                Spacer()
                            }
                        }
                    }
                    .padding(20)
                    .background(Color.green.opacity(0.15))
                    .cornerRadius(16)
                    .padding(.horizontal, 30)
                }

                // Challenging patterns with missed words and examples
                if !analysis.challenging.isEmpty {
                    VStack(alignment: .leading, spacing: 15) {
                        HStack {
                            Text("💪")
                                .font(.title2)
                            Text("Patterns to Practice:")
                                .font(.system(size: 20, weight: .semibold, design: .rounded))
                                .foregroundColor(.primary)
                            Spacer()
                        }

                        ForEach(analysis.challenging.prefix(5), id: \.pattern) { item in
                            VStack(alignment: .leading, spacing: 8) {
                                Text(item.pattern.displayName)
                                    .font(.system(size: 17, weight: .semibold, design: .rounded))
                                    .foregroundColor(.orange)

                                // Missed words
                                if !item.missedWords.isEmpty {
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text("Missed:")
                                            .font(.system(size: 14, weight: .medium))
                                            .foregroundColor(.secondary)
                                        HStack {
                                            ForEach(item.missedWords, id: \.self) { word in
                                                Text(word)
                                                    .font(.system(size: 14, design: .rounded))
                                                    .padding(.horizontal, 8)
                                                    .padding(.vertical, 4)
                                                    .background(Color.red.opacity(0.2))
                                                    .cornerRadius(6)
                                            }
                                        }
                                    }
                                }

                                // Example words
                                if !item.examples.isEmpty {
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text("Practice with:")
                                            .font(.system(size: 14, weight: .medium))
                                            .foregroundColor(.secondary)
                                        HStack {
                                            ForEach(item.examples, id: \.self) { word in
                                                Text(word)
                                                    .font(.system(size: 14, design: .rounded))
                                                    .padding(.horizontal, 8)
                                                    .padding(.vertical, 4)
                                                    .background(Color.blue.opacity(0.2))
                                                    .cornerRadius(6)
                                            }
                                        }
                                    }
                                }
                            }
                            .padding(12)
                            .background(Color.white.opacity(0.5))
                            .cornerRadius(10)
                        }
                    }
                    .padding(20)
                    .background(Color.orange.opacity(0.15))
                    .cornerRadius(16)
                    .padding(.horizontal, 30)
                }

                Spacer()

                // Buttons
                VStack(spacing: 15) {
                    Button {
                        onDone()
                    } label: {
                        Text("Practice Again")
                            .font(.system(size: 24, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.green)
                            .cornerRadius(20)
                    }

                    NavigationLink(destination: RewardsView()) {
                        Text("View Rewards")
                            .font(.system(size: 24, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.purple)
                            .cornerRadius(20)
                    }
                }
                .padding(.horizontal, 40)

                Spacer()
            }
        }
    }
}
