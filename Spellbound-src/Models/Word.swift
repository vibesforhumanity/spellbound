import Foundation

struct Word: Identifiable, Codable {
    let id: UUID
    let text: String
    var timesCorrect: Int = 0
    var timesIncorrect: Int = 0
    var lastPracticed: Date?

    init(id: UUID = UUID(), text: String) {
        self.id = id
        self.text = text
    }
}
