import SwiftUI

@main
struct SpellboundApp: App {
    @StateObject private var wordService = WordService()
    @StateObject private var ttsService = TTSService()
    @StateObject private var storageService = StorageService()

    var body: some Scene {
        WindowGroup {
            if wordService.words.isEmpty {
                VStack(spacing: 20) {
                    ProgressView()
                        .scaleEffect(1.5)

                    Text("Loading words...")
                        .font(.title2)
                        .foregroundColor(.secondary)
                }
                .onAppear {
                    wordService.loadWords()
                }
            } else {
                TabView {
                    NavigationView {
                        PracticeView(
                            viewModel: PracticeViewModel(
                                wordService: wordService,
                                ttsService: ttsService,
                                storageService: storageService
                            ),
                            storageService: storageService,
                            wordService: wordService
                        )
                        .navigationBarTitleDisplayMode(.inline)
                        .toolbar {
                            ToolbarItem(placement: .navigationBarTrailing) {
                                NavigationLink(destination: RewardsView()) {
                                    HStack(spacing: 4) {
                                        Text("💎")
                                            .font(.title3)
                                        Text("\(storageService.gemstones)")
                                            .font(.system(size: 18, weight: .bold, design: .rounded))
                                            .foregroundColor(.primary)
                                    }
                                }
                            }
                        }
                    }
                    .navigationViewStyle(.stack)
                    .tabItem {
                        Label("Practice", systemImage: "pencil")
                    }

                    NavigationView {
                        LearningProgressView(
                            storageService: storageService,
                            wordService: wordService
                        )
                        .navigationBarTitleDisplayMode(.inline)
                        .toolbar {
                            ToolbarItem(placement: .navigationBarTrailing) {
                                NavigationLink(destination: RewardsView()) {
                                    HStack(spacing: 4) {
                                        Text("💎")
                                            .font(.title3)
                                        Text("\(storageService.gemstones)")
                                            .font(.system(size: 18, weight: .bold, design: .rounded))
                                            .foregroundColor(.primary)
                                    }
                                }
                            }
                        }
                    }
                    .navigationViewStyle(.stack)
                    .tabItem {
                        Label("Progress", systemImage: "chart.bar.fill")
                    }
                }
            }
        }
    }
}
