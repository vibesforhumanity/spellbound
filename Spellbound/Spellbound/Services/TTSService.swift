import Foundation
import AVFoundation
import Combine

enum AudioType {
    case plain
    case word
    case sentence
    case definition
}

class TTSService: NSObject, ObservableObject {
    private let synthesizer = AVSpeechSynthesizer()
    private var audioPlayer: AVAudioPlayer?

    override init() {
        super.init()
        synthesizer.delegate = self
        
        // Configure audio session
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("Failed to set audio session: \(error)")
        }
    }

    func speak(_ text: String) {
        speak(text, type: .plain, word: nil)
    }

    func speak(_ text: String, type: AudioType, word: String?) {
        // Stop any current speech/playback
        stop()

        // Try to play file if context is provided
        if let word = word, type != .plain {
            if playAudioFile(for: word, type: type) {
                return
            }
        }

        // Fallback to synthesis
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
        utterance.rate = 0.4  // Slower for kids
        utterance.pitchMultiplier = 1.0
        utterance.volume = 1.0

        synthesizer.speak(utterance)
    }
    
    private func playAudioFile(for word: String, type: AudioType) -> Bool {
        let prefix: String
        switch type {
        case .word: prefix = "word"
        case .sentence: prefix = "sentence"
        case .definition: prefix = "definition"
        default: return false
        }
        
        let filename = "\(prefix)_\(word)"
        // Check main bundle
        guard let url = Bundle.main.url(forResource: filename, withExtension: "mp3", subdirectory: "Audio") ??
                        Bundle.main.url(forResource: filename, withExtension: "mp3") else {
            return false
        }
        
        do {
            audioPlayer = try AVAudioPlayer(contentsOf: url)
            audioPlayer?.play()
            return true
        } catch {
            print("Failed to play audio file: \(error)")
            return false
        }
    }

    func stop() {
        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }
        if let player = audioPlayer, player.isPlaying {
            player.stop()
        }
    }
}

extension TTSService: AVSpeechSynthesizerDelegate {
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        print("🔊 Finished speaking: \(utterance.speechString)")
    }
}
