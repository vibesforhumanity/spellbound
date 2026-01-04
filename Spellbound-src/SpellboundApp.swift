import SwiftUI

@main
struct SpellboundApp: App {
    @StateObject private var wordService = WordService()
    @StateObject private var ttsService = TTSService()
    @StateObject private var storageService = StorageService()

    init() {
        // Load words on app launch
        DispatchQueue.main.async {
            wordService.loadWords()
        }
    }

    var body: some Scene {
        WindowGroup {
            NavigationView {
                if wordService.words.isEmpty {
                    VStack(spacing: 20) {
                        ProgressView()
                            .scaleEffect(1.5)

                        Text("Loading words...")
                            .font(.title2)
                            .foregroundColor(.secondary)
                    }
                } else {
                    PracticeView(
                        viewModel: PracticeViewModel(
                            wordService: wordService,
                            ttsService: ttsService,
                            storageService: storageService
                        ),
                        storageService: storageService
                    )
                    .navigationBarTitleDisplayMode(.inline)
                    .toolbar {
                        ToolbarItem(placement: .navigationBarTrailing) {
                            NavigationLink(destination: RewardsView()) {
                                Image(systemName: "gift.fill")
                                    .foregroundColor(.purple)
                                    .font(.title2)
                            }
                        }
                    }
                }
            }
        }
    }
}
