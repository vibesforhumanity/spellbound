import Foundation

struct Reward: Identifiable {
    let id: UUID
    let title: String
    let gemCost: Int
    let icon: String

    static let presets: [Reward] = [
        Reward(
            id: UUID(),
            title: "30 min Minecraft with Dad",
            gemCost: 5,
            icon: "gamecontroller.fill"
        ),
        Reward(
            id: UUID(),
            title: "Movie Night",
            gemCost: 10,
            icon: "film.fill"
        )
    ]
}
