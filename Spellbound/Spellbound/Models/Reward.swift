import Foundation

struct Reward: Identifiable {
    let id: UUID
    let title: String
    let gemCost: Int
    let icon: String

    static let presets: [Reward] = [
        Reward(
            id: UUID(),
            title: "Minecraft with Dad",
            gemCost: 2,
            icon: "gamecontroller.fill"
        ),
        Reward(
            id: UUID(),
            title: "TV (30 min)",
            gemCost: 2,
            icon: "tv.fill"
        ),
        Reward(
            id: UUID(),
            title: "Movie Night",
            gemCost: 5,
            icon: "film.fill"
        ),
        Reward(
            id: UUID(),
            title: "Skyzone",
            gemCost: 8,
            icon: "figure.jumprope"
        ),
        Reward(
            id: UUID(),
            title: "Build-a-Bear (accessories - $30)",
            gemCost: 10,
            icon: "teddybear.fill"
        ),
        Reward(
            id: UUID(),
            title: "Billy Beez",
            gemCost: 12,
            icon: "sparkles"
        ),
        Reward(
            id: UUID(),
            title: "Lego (max $70 value)",
            gemCost: 15,
            icon: "cube.fill"
        )
    ]
}
