import SwiftUI

struct LearningProgressView: View {
    @ObservedObject var storageService: StorageService
    @ObservedObject var wordService: WordService

    private var sessions: [Session] {
        storageService.loadSessions()
    }

    private var patternStats: [PhonicsPatternType: PatternPerformance] {
        storageService.loadPatternStats()
    }

    private var masteredPatterns: [PhonicsPatternType] {
        patternStats.values
            .filter { $0.accuracy >= 0.8 && $0.totalAttempts >= 3 }
            .map { $0.patternType }
            .sorted { $0.displayName < $1.displayName }
    }

    private var workingOnPatterns: [PhonicsPatternType] {
        patternStats.values
            .filter { $0.accuracy < 0.8 && $0.accuracy >= 0.5 && $0.totalAttempts >= 2 }
            .map { $0.patternType }
            .sorted { $0.displayName < $1.displayName }
    }

    private var upcomingPatterns: [PhonicsPatternType] {
        let practicedPatterns = Set(patternStats.keys)
        return PhonicsPatternType.allCases
            .filter { !practicedPatterns.contains($0) }
            .prefix(10)
            .sorted { $0.displayName < $1.displayName }
    }

    private var uniqueWordsReviewed: Int {
        let allWords = sessions.flatMap { $0.wordsAttempted.map { $0.word.lowercased() } }
        return Set(allWords).count
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 8) {
                    Text("Learning Progress")
                        .font(.system(size: 36, weight: .bold, design: .rounded))
                        .foregroundColor(.primary)

                    Text("Track your spelling journey")
                        .font(.system(size: 16, weight: .medium, design: .rounded))
                        .foregroundColor(.secondary)
                }
                .padding(.top, 20)

                // Overall Stats Cards
                HStack(spacing: 16) {
                    StatCard(
                        icon: "book.fill",
                        value: "\(uniqueWordsReviewed)",
                        label: "Words\nReviewed",
                        color: .blue
                    )

                    StatCard(
                        icon: "checkmark.circle.fill",
                        value: "\(storageService.totalCorrect)",
                        label: "Correct\nAnswers",
                        color: .green
                    )

                    StatCard(
                        icon: "chart.line.uptrend.xyaxis",
                        value: "\(Int(accuracy * 100))%",
                        label: "Overall\nAccuracy",
                        color: .purple
                    )
                }
                .padding(.horizontal, 20)

                // Patterns Mastered Section
                if !masteredPatterns.isEmpty {
                    PatternSection(
                        title: "Patterns Mastered",
                        icon: "star.fill",
                        iconColor: .yellow,
                        backgroundColor: Color.green.opacity(0.1),
                        patterns: masteredPatterns,
                        patternStats: patternStats
                    )
                }

                // Working On Section
                if !workingOnPatterns.isEmpty {
                    PatternSection(
                        title: "Patterns You're Working On",
                        icon: "flame.fill",
                        iconColor: .orange,
                        backgroundColor: Color.orange.opacity(0.1),
                        patterns: workingOnPatterns,
                        patternStats: patternStats
                    )
                }

                // Upcoming Patterns Section
                if !upcomingPatterns.isEmpty {
                    VStack(alignment: .leading, spacing: 16) {
                        HStack(spacing: 8) {
                            Image(systemName: "sparkles")
                                .font(.system(size: 20))
                                .foregroundColor(.blue)

                            Text("Upcoming Patterns")
                                .font(.system(size: 24, weight: .bold, design: .rounded))
                                .foregroundColor(.primary)

                            Spacer()
                        }

                        VStack(spacing: 8) {
                            ForEach(upcomingPatterns, id: \.self) { pattern in
                                HStack {
                                    Circle()
                                        .fill(Color.gray.opacity(0.3))
                                        .frame(width: 8, height: 8)

                                    Text(pattern.displayName)
                                        .font(.system(size: 16, weight: .medium, design: .rounded))
                                        .foregroundColor(.secondary)

                                    Spacer()
                                }
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                            }
                        }
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(12)
                    }
                    .padding(.horizontal, 20)
                }

                // Recent Sessions Section
                if !sessions.isEmpty {
                    RecentSessionsSection(sessions: Array(sessions.suffix(5).reversed()))
                }

                Spacer(minLength: 40)
            }
        }
        .background(
            LinearGradient(
                colors: [
                    Color(red: 0.95, green: 0.97, blue: 1.0),
                    Color(red: 0.98, green: 0.95, blue: 1.0)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
        )
    }

    private var accuracy: Double {
        guard storageService.totalPracticed > 0 else { return 0 }
        return Double(storageService.totalCorrect) / Double(storageService.totalPracticed)
    }
}

// MARK: - Stat Card Component

struct StatCard: View {
    let icon: String
    let value: String
    let label: String
    let color: Color

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 28))
                .foregroundColor(color)

            Text(value)
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundColor(.primary)

            Text(label)
                .font(.system(size: 12, weight: .medium, design: .rounded))
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .lineLimit(2)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 8, y: 4)
    }
}

// MARK: - Pattern Section Component

struct PatternSection: View {
    let title: String
    let icon: String
    let iconColor: Color
    let backgroundColor: Color
    let patterns: [PhonicsPatternType]
    let patternStats: [PhonicsPatternType: PatternPerformance]

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(iconColor)

                Text(title)
                    .font(.system(size: 24, weight: .bold, design: .rounded))
                    .foregroundColor(.primary)

                Spacer()

                Text("\(patterns.count)")
                    .font(.system(size: 18, weight: .bold, design: .rounded))
                    .foregroundColor(.secondary)
            }

            VStack(spacing: 8) {
                ForEach(patterns, id: \.self) { pattern in
                    if let stats = patternStats[pattern] {
                        PatternRow(pattern: pattern, stats: stats)
                    }
                }
            }
            .background(backgroundColor)
            .cornerRadius(12)
        }
        .padding(.horizontal, 20)
    }
}

// MARK: - Pattern Row Component

struct PatternRow: View {
    let pattern: PhonicsPatternType
    let stats: PatternPerformance

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(pattern.displayName)
                    .font(.system(size: 16, weight: .semibold, design: .rounded))
                    .foregroundColor(.primary)

                Text("\(stats.timesCorrect)/\(stats.totalAttempts) correct")
                    .font(.system(size: 13, weight: .medium, design: .rounded))
                    .foregroundColor(.secondary)
            }

            Spacer()

            // Accuracy badge
            Text("\(Int(stats.accuracy * 100))%")
                .font(.system(size: 14, weight: .bold, design: .rounded))
                .foregroundColor(accuracyColor)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(accuracyColor.opacity(0.15))
                .cornerRadius(8)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }

    private var accuracyColor: Color {
        if stats.accuracy >= 0.8 {
            return .green
        } else if stats.accuracy >= 0.6 {
            return .orange
        } else {
            return .red
        }
    }
}

// MARK: - Recent Sessions Component

struct RecentSessionsSection: View {
    let sessions: [Session]

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 8) {
                Image(systemName: "clock.fill")
                    .font(.system(size: 20))
                    .foregroundColor(.purple)

                Text("Recent Sessions")
                    .font(.system(size: 24, weight: .bold, design: .rounded))
                    .foregroundColor(.primary)

                Spacer()
            }

            VStack(spacing: 12) {
                ForEach(sessions.indices, id: \.self) { index in
                    SessionRow(session: sessions[index])
                }
            }
            .padding(16)
            .background(Color.white)
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.05), radius: 8, y: 4)
        }
        .padding(.horizontal, 20)
    }
}

// MARK: - Session Row Component

struct SessionRow: View {
    let session: Session

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(dateFormatter.string(from: session.date))
                    .font(.system(size: 15, weight: .semibold, design: .rounded))
                    .foregroundColor(.primary)

                Text("\(session.correctCount)/\(session.totalCount) correct • \(session.gemsEarned) gems")
                    .font(.system(size: 13, weight: .medium, design: .rounded))
                    .foregroundColor(.secondary)
            }

            Spacer()

            // Accuracy circle
            ZStack {
                Circle()
                    .stroke(Color.gray.opacity(0.2), lineWidth: 3)

                Circle()
                    .trim(from: 0, to: CGFloat(session.accuracy))
                    .stroke(accuracyColor, lineWidth: 3)
                    .rotationEffect(.degrees(-90))

                Text("\(Int(session.accuracy * 100))%")
                    .font(.system(size: 11, weight: .bold, design: .rounded))
                    .foregroundColor(accuracyColor)
            }
            .frame(width: 50, height: 50)
        }
        .padding(.vertical, 4)
    }

    private var accuracyColor: Color {
        if session.accuracy >= 0.8 {
            return .green
        } else if session.accuracy >= 0.6 {
            return .orange
        } else {
            return .red
        }
    }

    private var dateFormatter: DateFormatter {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter
    }
}
