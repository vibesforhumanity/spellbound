import Foundation

enum PhonicsPatternType: String, Codable, CaseIterable {
    // Digraphs
    case digraph_sh, digraph_ch, digraph_th, digraph_ph, digraph_wh
    case digraph_ck, digraph_ng

    // Vowel Teams
    case vowelTeam_ai, vowelTeam_ay, vowelTeam_ea, vowelTeam_ee
    case vowelTeam_oa, vowelTeam_ow, vowelTeam_ou, vowelTeam_oi
    case vowelTeam_oy, vowelTeam_au, vowelTeam_aw, vowelTeam_oo
    case vowelTeam_ie, vowelTeam_ue, vowelTeam_ui

    // Consonant Blends (Initial)
    case blend_bl, blend_br, blend_cl, blend_cr, blend_dr, blend_fl
    case blend_fr, blend_gl, blend_gr, blend_pl, blend_pr, blend_sc
    case blend_sk, blend_sl, blend_sm, blend_sn, blend_sp, blend_st
    case blend_sw, blend_tr, blend_tw

    // Consonant Blends (Final)
    case blend_ct, blend_ft, blend_ld, blend_lf, blend_lk, blend_lp
    case blend_lt, blend_mp, blend_nd, blend_nk, blend_nt, blend_pt
    case blend_sk_final, blend_sp_final, blend_st_final

    // Trigraphs
    case trigraph_tch, trigraph_dge, trigraph_sch

    // Suffixes
    case suffix_ing, suffix_ed, suffix_er, suffix_est, suffix_ly
    case suffix_ness, suffix_ful, suffix_less, suffix_tion, suffix_sion
    case suffix_able, suffix_ible, suffix_ous, suffix_al

    // Prefixes
    case prefix_un, prefix_re, prefix_pre, prefix_dis, prefix_mis
    case prefix_non, prefix_in, prefix_im, prefix_over, prefix_under

    // Silent Letters
    case silent_e, silent_k, silent_w, silent_b, silent_h, silent_l

    // R-Controlled Vowels
    case rControlled_ar, rControlled_er, rControlled_ir
    case rControlled_or, rControlled_ur

    // Special Patterns
    case doubleConsonant, contractionApostrophe
    case cSoft, gSoft // 'c' sounds like 's', 'g' sounds like 'j'

    var displayName: String {
        switch self {
        case .digraph_sh: return "SH Sound"
        case .digraph_ch: return "CH Sound"
        case .digraph_th: return "TH Sound"
        case .digraph_ph: return "PH Sound"
        case .digraph_wh: return "WH Sound"
        case .digraph_ck: return "CK Sound"
        case .digraph_ng: return "NG Sound"

        case .vowelTeam_ai: return "AI Vowel Team"
        case .vowelTeam_ay: return "AY Vowel Team"
        case .vowelTeam_ea: return "EA Vowel Team"
        case .vowelTeam_ee: return "EE Vowel Team"
        case .vowelTeam_oa: return "OA Vowel Team"
        case .vowelTeam_ow: return "OW Vowel Team"
        case .vowelTeam_ou: return "OU Vowel Team"
        case .vowelTeam_oi: return "OI Vowel Team"
        case .vowelTeam_oy: return "OY Vowel Team"
        case .vowelTeam_au: return "AU Vowel Team"
        case .vowelTeam_aw: return "AW Vowel Team"
        case .vowelTeam_oo: return "OO Vowel Team"
        case .vowelTeam_ie: return "IE Vowel Team"
        case .vowelTeam_ue: return "UE Vowel Team"
        case .vowelTeam_ui: return "UI Vowel Team"

        case .blend_bl, .blend_br, .blend_cl, .blend_cr, .blend_dr, .blend_fl,
             .blend_fr, .blend_gl, .blend_gr, .blend_pl, .blend_pr, .blend_sc,
             .blend_sk, .blend_sl, .blend_sm, .blend_sn, .blend_sp, .blend_st,
             .blend_sw, .blend_tr, .blend_tw:
            return rawValue.replacingOccurrences(of: "blend_", with: "").uppercased() + " Blend"

        case .blend_ct, .blend_ft, .blend_ld, .blend_lf, .blend_lk, .blend_lp,
             .blend_lt, .blend_mp, .blend_nd, .blend_nk, .blend_nt, .blend_pt,
             .blend_sk_final, .blend_sp_final, .blend_st_final:
            return rawValue.replacingOccurrences(of: "blend_", with: "").replacingOccurrences(of: "_final", with: "").uppercased() + " Ending Blend"

        case .trigraph_tch: return "TCH Sound"
        case .trigraph_dge: return "DGE Sound"
        case .trigraph_sch: return "SCH Sound"

        case .suffix_ing: return "-ING Suffix"
        case .suffix_ed: return "-ED Suffix"
        case .suffix_er: return "-ER Suffix"
        case .suffix_est: return "-EST Suffix"
        case .suffix_ly: return "-LY Suffix"
        case .suffix_ness: return "-NESS Suffix"
        case .suffix_ful: return "-FUL Suffix"
        case .suffix_less: return "-LESS Suffix"
        case .suffix_tion: return "-TION Suffix"
        case .suffix_sion: return "-SION Suffix"
        case .suffix_able: return "-ABLE Suffix"
        case .suffix_ible: return "-IBLE Suffix"
        case .suffix_ous: return "-OUS Suffix"
        case .suffix_al: return "-AL Suffix"

        case .prefix_un: return "UN- Prefix"
        case .prefix_re: return "RE- Prefix"
        case .prefix_pre: return "PRE- Prefix"
        case .prefix_dis: return "DIS- Prefix"
        case .prefix_mis: return "MIS- Prefix"
        case .prefix_non: return "NON- Prefix"
        case .prefix_in: return "IN- Prefix"
        case .prefix_im: return "IM- Prefix"
        case .prefix_over: return "OVER- Prefix"
        case .prefix_under: return "UNDER- Prefix"

        case .silent_e: return "Silent E"
        case .silent_k: return "Silent K"
        case .silent_w: return "Silent W"
        case .silent_b: return "Silent B"
        case .silent_h: return "Silent H"
        case .silent_l: return "Silent L"

        case .rControlled_ar: return "AR Sound"
        case .rControlled_er: return "ER Sound"
        case .rControlled_ir: return "IR Sound"
        case .rControlled_or: return "OR Sound"
        case .rControlled_ur: return "UR Sound"

        case .doubleConsonant: return "Double Consonant"
        case .contractionApostrophe: return "Contraction"
        case .cSoft: return "Soft C"
        case .gSoft: return "Soft G"
        }
    }

    var tipMessage: String {
        switch self {
        case .digraph_sh: return "The 'sh' sound is spelled with S-H together"
        case .digraph_ch: return "The 'ch' sound is spelled with C-H together"
        case .digraph_th: return "The 'th' sound is spelled with T-H together"
        case .digraph_ph: return "The 'f' sound can be spelled with P-H"
        case .digraph_wh: return "The 'wh' sound is spelled with W-H together"
        case .digraph_ck: return "The 'k' sound at the end is spelled C-K"
        case .digraph_ng: return "The 'ng' sound is spelled with N-G together"

        case .vowelTeam_ai: return "The letters A-I together make the long A sound"
        case .vowelTeam_ay: return "The letters A-Y together make the long A sound"
        case .vowelTeam_ea: return "The letters E-A together often make the long E sound"
        case .vowelTeam_ee: return "The letters E-E together make the long E sound"
        case .vowelTeam_oa: return "The letters O-A together make the long O sound"
        case .vowelTeam_ow: return "The letters O-W can make the long O sound"
        case .vowelTeam_ou: return "The letters O-U together make a special sound"
        case .vowelTeam_oi: return "The letters O-I together make the 'oy' sound"
        case .vowelTeam_oy: return "The letters O-Y together make the 'oy' sound"
        case .vowelTeam_au: return "The letters A-U together make the 'aw' sound"
        case .vowelTeam_aw: return "The letters A-W together make the 'aw' sound"
        case .vowelTeam_oo: return "The letters O-O together make the 'oo' sound"
        case .vowelTeam_ie: return "The letters I-E can make different sounds"
        case .vowelTeam_ue: return "The letters U-E together make a special sound"
        case .vowelTeam_ui: return "The letters U-I together make a special sound"

        case .blend_bl, .blend_br, .blend_cl, .blend_cr, .blend_dr, .blend_fl,
             .blend_fr, .blend_gl, .blend_gr, .blend_pl, .blend_pr, .blend_sc,
             .blend_sk, .blend_sl, .blend_sm, .blend_sn, .blend_sp, .blend_st,
             .blend_sw, .blend_tr, .blend_tw:
            let blend = rawValue.replacingOccurrences(of: "blend_", with: "").uppercased()
            return "Blend the sounds \(blend.first!)-\(blend.last!) together smoothly"

        case .blend_ct, .blend_ft, .blend_ld, .blend_lf, .blend_lk, .blend_lp,
             .blend_lt, .blend_mp, .blend_nd, .blend_nk, .blend_nt, .blend_pt,
             .blend_sk_final, .blend_sp_final, .blend_st_final:
            let blend = rawValue.replacingOccurrences(of: "blend_", with: "").replacingOccurrences(of: "_final", with: "").uppercased()
            return "This word ends with the \(blend) blend"

        case .trigraph_tch: return "The 'ch' sound can be spelled T-C-H after a short vowel"
        case .trigraph_dge: return "The 'j' sound can be spelled D-G-E after a short vowel"
        case .trigraph_sch: return "The 'sh' or 'sk' sound can be spelled S-C-H"

        case .suffix_ing: return "Words ending in the -ing sound use I-N-G"
        case .suffix_ed: return "Past tense words often end with E-D"
        case .suffix_er: return "Words comparing things often end with E-R"
        case .suffix_est: return "Words showing 'most' often end with E-S-T"
        case .suffix_ly: return "Words describing 'how' often end with L-Y"
        case .suffix_ness: return "Words for 'state of being' often end with N-E-S-S"
        case .suffix_ful: return "Words meaning 'full of' end with F-U-L"
        case .suffix_less: return "Words meaning 'without' end with L-E-S-S"
        case .suffix_tion: return "The 'shun' sound often uses T-I-O-N"
        case .suffix_sion: return "The 'shun' or 'zhun' sound can use S-I-O-N"
        case .suffix_able: return "Words meaning 'can be' often end with A-B-L-E"
        case .suffix_ible: return "Words meaning 'can be' sometimes end with I-B-L-E"
        case .suffix_ous: return "Words meaning 'full of' can end with O-U-S"
        case .suffix_al: return "Words related to something often end with A-L"

        case .prefix_un: return "UN- at the start means 'not' or 'opposite of'"
        case .prefix_re: return "RE- at the start means 'again'"
        case .prefix_pre: return "PRE- at the start means 'before'"
        case .prefix_dis: return "DIS- at the start means 'not' or 'opposite of'"
        case .prefix_mis: return "MIS- at the start means 'wrong' or 'badly'"
        case .prefix_non: return "NON- at the start means 'not'"
        case .prefix_in: return "IN- at the start can mean 'not' or 'into'"
        case .prefix_im: return "IM- at the start means 'not'"
        case .prefix_over: return "OVER- at the start means 'too much' or 'above'"
        case .prefix_under: return "UNDER- at the start means 'below' or 'too little'"

        case .silent_e: return "The silent E at the end makes the vowel say its name"
        case .silent_k: return "In words starting with KN-, the K is silent"
        case .silent_w: return "In words starting with WR-, the W is silent"
        case .silent_b: return "The B is silent in some words with MB"
        case .silent_h: return "The H is sometimes silent after certain letters"
        case .silent_l: return "The L is silent in some words like 'could'"

        case .rControlled_ar: return "When A comes before R, it makes the 'ar' sound"
        case .rControlled_er: return "When E comes before R, it makes the 'er' sound"
        case .rControlled_ir: return "When I comes before R, it makes the 'er' sound"
        case .rControlled_or: return "When O comes before R, it makes the 'or' sound"
        case .rControlled_ur: return "When U comes before R, it makes the 'er' sound"

        case .doubleConsonant: return "When two of the same consonants appear together, say the sound once"
        case .contractionApostrophe: return "The apostrophe shows where letters were removed to combine two words"
        case .cSoft: return "The letter C sounds like 'S' before E, I, or Y"
        case .gSoft: return "The letter G sounds like 'J' before E, I, or Y"
        }
    }
}

struct DetectedPattern: Codable, Equatable {
    let type: PhonicsPatternType
    let position: Range<Int>
    let spelling: String

    enum CodingKeys: String, CodingKey {
        case type, lowerBound, upperBound, spelling
    }

    init(type: PhonicsPatternType, position: Range<Int>, spelling: String) {
        self.type = type
        self.position = position
        self.spelling = spelling
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        type = try container.decode(PhonicsPatternType.self, forKey: .type)
        let lower = try container.decode(Int.self, forKey: .lowerBound)
        let upper = try container.decode(Int.self, forKey: .upperBound)
        position = lower..<upper
        spelling = try container.decode(String.self, forKey: .spelling)
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(type, forKey: .type)
        try container.encode(position.lowerBound, forKey: .lowerBound)
        try container.encode(position.upperBound, forKey: .upperBound)
        try container.encode(spelling, forKey: .spelling)
    }
}
