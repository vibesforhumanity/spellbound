
import Foundation

class PhonicsPatternService {

    // MARK: - Pattern Detection

    func detectPatterns(in word: String) -> [DetectedPattern] {
        let lowercased = word.lowercased()
        var patterns: [DetectedPattern] = []

        // Detect in order of specificity (most specific first)
        patterns.append(contentsOf: detectTrigraphs(in: lowercased))
        patterns.append(contentsOf: detectDigraphs(in: lowercased))
        patterns.append(contentsOf: detectVowelTeams(in: lowercased))
        patterns.append(contentsOf: detectBlends(in: lowercased))
        patterns.append(contentsOf: detectRControlled(in: lowercased))
        patterns.append(contentsOf: detectSuffixes(in: lowercased))
        patterns.append(contentsOf: detectPrefixes(in: lowercased))
        patterns.append(contentsOf: detectSilentLetters(in: lowercased))
        patterns.append(contentsOf: detectSpecialPatterns(in: lowercased))

        // Remove overlapping patterns (keep more specific ones)
        return removeOverlaps(patterns)
    }

    private func detectDigraphs(in word: String) -> [DetectedPattern] {
        let digraphs: [(pattern: String, type: PhonicsPatternType)] = [
            ("sh", .digraph_sh), ("ch", .digraph_ch), ("th", .digraph_th),
            ("ph", .digraph_ph), ("wh", .digraph_wh), ("ck", .digraph_ck),
            ("ng", .digraph_ng)
        ]
        return findPatterns(digraphs, in: word)
    }

    private func detectTrigraphs(in word: String) -> [DetectedPattern] {
        let trigraphs: [(pattern: String, type: PhonicsPatternType)] = [
            ("tch", .trigraph_tch), ("dge", .trigraph_dge), ("sch", .trigraph_sch)
        ]
        return findPatterns(trigraphs, in: word)
    }

    private func detectVowelTeams(in word: String) -> [DetectedPattern] {
        let vowelTeams: [(pattern: String, type: PhonicsPatternType)] = [
            ("ai", .vowelTeam_ai), ("ay", .vowelTeam_ay), ("ea", .vowelTeam_ea),
            ("ee", .vowelTeam_ee), ("oa", .vowelTeam_oa), ("ow", .vowelTeam_ow),
            ("ou", .vowelTeam_ou), ("oi", .vowelTeam_oi), ("oy", .vowelTeam_oy),
            ("au", .vowelTeam_au), ("aw", .vowelTeam_aw), ("oo", .vowelTeam_oo),
            ("ie", .vowelTeam_ie), ("ue", .vowelTeam_ue), ("ui", .vowelTeam_ui)
        ]
        return findPatterns(vowelTeams, in: word)
    }

    private func detectBlends(in word: String) -> [DetectedPattern] {
        var results: [DetectedPattern] = []

        // Initial blends (start of word)
        let initialBlends: [(pattern: String, type: PhonicsPatternType)] = [
            ("bl", .blend_bl), ("br", .blend_br), ("cl", .blend_cl),
            ("cr", .blend_cr), ("dr", .blend_dr), ("fl", .blend_fl),
            ("fr", .blend_fr), ("gl", .blend_gl), ("gr", .blend_gr),
            ("pl", .blend_pl), ("pr", .blend_pr), ("sc", .blend_sc),
            ("sk", .blend_sk), ("sl", .blend_sl), ("sm", .blend_sm),
            ("sn", .blend_sn), ("sp", .blend_sp), ("st", .blend_st),
            ("sw", .blend_sw), ("tr", .blend_tr), ("tw", .blend_tw)
        ]

        for (pattern, type) in initialBlends {
            if word.hasPrefix(pattern) {
                results.append(DetectedPattern(
                    type: type,
                    position: 0..<pattern.count,
                    spelling: pattern
                ))
            }
        }

        // Final blends (end of word)
        let finalBlends: [(pattern: String, type: PhonicsPatternType)] = [
            ("ct", .blend_ct), ("ft", .blend_ft), ("ld", .blend_ld),
            ("lf", .blend_lf), ("lk", .blend_lk), ("lp", .blend_lp),
            ("lt", .blend_lt), ("mp", .blend_mp), ("nd", .blend_nd),
            ("nk", .blend_nk), ("nt", .blend_nt), ("pt", .blend_pt)
        ]

        for (pattern, type) in finalBlends {
            if word.hasSuffix(pattern) {
                let start = word.count - pattern.count
                results.append(DetectedPattern(
                    type: type,
                    position: start..<word.count,
                    spelling: pattern
                ))
            }
        }

        return results
    }

    private func detectRControlled(in word: String) -> [DetectedPattern] {
        let rControlled: [(pattern: String, type: PhonicsPatternType)] = [
            ("ar", .rControlled_ar), ("er", .rControlled_er),
            ("ir", .rControlled_ir), ("or", .rControlled_or),
            ("ur", .rControlled_ur)
        ]
        return findPatterns(rControlled, in: word)
    }

    private func detectSuffixes(in word: String) -> [DetectedPattern] {
        // Check longer suffixes first
        let suffixes: [(pattern: String, type: PhonicsPatternType)] = [
            ("tion", .suffix_tion), ("sion", .suffix_sion),
            ("able", .suffix_able), ("ible", .suffix_ible),
            ("ness", .suffix_ness), ("less", .suffix_less),
            ("ful", .suffix_ful), ("ous", .suffix_ous),
            ("ing", .suffix_ing), ("est", .suffix_est),
            ("ed", .suffix_ed), ("er", .suffix_er),
            ("ly", .suffix_ly), ("al", .suffix_al)
        ]

        for (pattern, type) in suffixes {
            if word.hasSuffix(pattern) && word.count > pattern.count {
                let start = word.count - pattern.count
                return [DetectedPattern(
                    type: type,
                    position: start..<word.count,
                    spelling: pattern
                )]
            }
        }
        return []
    }

    private func detectPrefixes(in word: String) -> [DetectedPattern] {
        // Check longer prefixes first
        let prefixes: [(pattern: String, type: PhonicsPatternType)] = [
            ("over", .prefix_over), ("under", .prefix_under),
            ("un", .prefix_un), ("re", .prefix_re), ("pre", .prefix_pre),
            ("dis", .prefix_dis), ("mis", .prefix_mis), ("non", .prefix_non),
            ("in", .prefix_in), ("im", .prefix_im)
        ]

        for (pattern, type) in prefixes {
            if word.hasPrefix(pattern) && word.count > pattern.count {
                return [DetectedPattern(
                    type: type,
                    position: 0..<pattern.count,
                    spelling: pattern
                )]
            }
        }
        return []
    }

    private func detectSilentLetters(in word: String) -> [DetectedPattern] {
        var results: [DetectedPattern] = []
        let chars = Array(word)

        // Silent E (magic E)
        if word.hasSuffix("e") && word.count > 2 {
            let vowels = "aeiou"
            let prevIndex = word.count - 2
            if prevIndex > 0 && !vowels.contains(chars[prevIndex]) {
                results.append(DetectedPattern(
                    type: .silent_e,
                    position: (word.count - 1)..<word.count,
                    spelling: "e"
                ))
            }
        }

        // Silent K (kn-)
        if word.hasPrefix("kn") {
            results.append(DetectedPattern(
                type: .silent_k,
                position: 0..<1,
                spelling: "k"
            ))
        }

        // Silent W (wr-)
        if word.hasPrefix("wr") {
            results.append(DetectedPattern(
                type: .silent_w,
                position: 0..<1,
                spelling: "w"
            ))
        }

        // Silent B (mb at end)
        if word.hasSuffix("mb") {
            results.append(DetectedPattern(
                type: .silent_b,
                position: (word.count - 1)..<word.count,
                spelling: "b"
            ))
        }

        return results
    }

    private func detectSpecialPatterns(in word: String) -> [DetectedPattern] {
        var results: [DetectedPattern] = []

        // Contractions (apostrophe)
        if word.contains("'") {
            if let range = word.range(of: "'") {
                let index = word.distance(from: word.startIndex, to: range.lowerBound)
                results.append(DetectedPattern(
                    type: .contractionApostrophe,
                    position: index..<(index + 1),
                    spelling: "'"
                ))
            }
        }

        // Double consonants
        let consonants = "bcdfghjklmnpqrstvwxyz"
        let chars = Array(word)
        for i in 0..<(chars.count - 1) {
            if consonants.contains(chars[i]) && chars[i] == chars[i + 1] {
                results.append(DetectedPattern(
                    type: .doubleConsonant,
                    position: i..<(i + 2),
                    spelling: String(chars[i...i+1])
                ))
                break // Only detect first occurrence
            }
        }

        return results
    }

    // MARK: - Helper Methods

    private func findPatterns(_ patterns: [(pattern: String, type: PhonicsPatternType)],
                              in word: String) -> [DetectedPattern] {
        var results: [DetectedPattern] = []

        for (pattern, type) in patterns {
            var searchRange = word.startIndex..<word.endIndex

            while let range = word.range(of: pattern, range: searchRange) {
                let lowerBound = word.distance(from: word.startIndex, to: range.lowerBound)
                let upperBound = word.distance(from: word.startIndex, to: range.upperBound)

                results.append(DetectedPattern(
                    type: type,
                    position: lowerBound..<upperBound,
                    spelling: pattern
                ))

                searchRange = range.upperBound..<word.endIndex
            }
        }

        return results
    }

    private func removeOverlaps(_ patterns: [DetectedPattern]) -> [DetectedPattern] {
        var sorted = patterns.sorted { $0.position.lowerBound < $1.position.lowerBound }
        var result: [DetectedPattern] = []

        for pattern in sorted {
            let overlaps = result.contains { existing in
                !(pattern.position.upperBound <= existing.position.lowerBound ||
                  pattern.position.lowerBound >= existing.position.upperBound)
            }

            if !overlaps {
                result.append(pattern)
            }
        }

        return result
    }

    // MARK: - Difficulty Calculation

    func calculateDifficulty(for word: String, patterns: [DetectedPattern]) -> Double {
        var score = 0.0

        // Base difficulty on word length
        score += Double(word.count) * 0.5

        // Add difficulty for each pattern type
        let patternWeights: [PhonicsPatternType: Double] = [
            // Simple patterns (lower weight)
            .digraph_sh: 1.0, .digraph_ch: 1.0, .blend_st: 1.0,
            .suffix_ed: 0.5, .suffix_ing: 0.5,

            // Medium patterns
            .vowelTeam_ea: 2.0, .vowelTeam_oa: 2.0,
            .rControlled_ar: 1.5, .silent_e: 1.5,

            // Complex patterns (higher weight)
            .trigraph_tch: 3.0, .trigraph_dge: 3.0,
            .suffix_tion: 2.5, .suffix_sion: 2.5,
            .silent_k: 2.0, .silent_w: 2.0
        ]

        for pattern in patterns {
            score += patternWeights[pattern.type] ?? 1.0
        }

        // Contractions and special cases
        if word.contains("'") { score += 1.5 }

        // Normalize to 0-100 scale
        return min(100, score * 5)
    }
}
