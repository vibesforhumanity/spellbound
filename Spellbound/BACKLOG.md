# Spellbound - Product Backlog

## 🎯 High Priority Features

### Homophone Challenge Mode
**Description**: Add sentence completion exercises where users select the correct homophone based on context.

**User Story**: As a student, I want to practice choosing the correct homophone in context so that I can understand when to use "be" vs "bee", "their" vs "there" vs "they're", etc.

**Acceptance Criteria**:
- [ ] Create `Homophone` model with word pairs/groups and example sentences
- [ ] Build homophone database with common pairs:
  - be/bee, to/too/two, their/there/they're, your/you're
  - hear/here, knows/nose, sea/see, blue/blew
  - flower/flour, write/right, piece/peace, etc.
- [ ] Design new UI for sentence completion (show sentence with blank, present options as buttons)
- [ ] Track homophone-specific accuracy separately
- [ ] Provide contextual explanations when wrong option is selected
- [ ] Add homophone practice mode to main menu

**Technical Notes**:
- New file: `Models/Homophone.swift`
- New file: `Views/HomophoneView.swift`
- New file: `Services/HomophoneService.swift`
- Update `PracticeViewModel` to support homophone mode
- JSON file: `Resources/homophones.json`

**Estimated Effort**: 8-12 hours

---

## 📚 Medium Priority Features

### Progress Dashboard
**Description**: Visual dashboard showing learning progress across different phonics patterns.

**Features**:
- [ ] Chart showing accuracy trends over time
- [ ] Pattern mastery breakdown (digraphs, blends, vowel teams, etc.)
- [ ] Weak areas highlighted with recommendations
- [ ] Session history with detailed statistics
- [ ] Achievement badges for pattern mastery

**Estimated Effort**: 6-8 hours

---

### Custom Word Lists
**Description**: Allow users/parents to create custom word lists for targeted practice.

**Features**:
- [ ] UI to add/edit/delete custom words
- [ ] Organize words into custom categories (e.g., "Science Vocabulary", "Spelling Bee Words")
- [ ] Import words from CSV/text file
- [ ] Share word lists between devices
- [ ] Practice sessions can use custom lists

**Estimated Effort**: 10-14 hours

---

### Difficulty Levels
**Description**: Explicit difficulty settings (Easy/Medium/Hard) for different grade levels.

**Features**:
- [ ] Grade level presets (K-2, 3-5, 6-8)
- [ ] Filter words by difficulty score ranges
- [ ] Adaptive difficulty that auto-adjusts based on performance
- [ ] Parent/teacher controls to lock difficulty level

**Estimated Effort**: 4-6 hours

---

### Voice Recording & Playback
**Description**: Allow users to record themselves spelling words and play back for review.

**Features**:
- [ ] Record button to capture user saying the word
- [ ] Playback recordings in session review
- [ ] Save recordings for later review
- [ ] Speech-to-text verification (optional)

**Estimated Effort**: 8-10 hours

---

## 🌟 Low Priority / Nice-to-Have

### Multiplayer Mode
**Description**: Competitive spelling practice with friends or family.

**Features**:
- [ ] Local multiplayer (pass-and-play)
- [ ] Online multiplayer with matchmaking
- [ ] Leaderboards
- [ ] Timed challenges
- [ ] Head-to-head spelling battles

**Estimated Effort**: 20-30 hours

---

### Word Origins & Etymology
**Description**: Educational content about word origins and meanings.

**Features**:
- [ ] Show word etymology after correct spelling
- [ ] Language family tags (Latin, Greek, French, etc.)
- [ ] Fun facts about words
- [ ] Related words from same root

**Estimated Effort**: 12-16 hours (mostly content creation)

---

### Spelling Bee Mode
**Description**: Simulate a real spelling bee competition.

**Features**:
- [ ] Round-based elimination format
- [ ] Official spelling bee word lists
- [ ] Request definition, sentence, language of origin
- [ ] Timer option for competitive play
- [ ] Certificate generation for winners

**Estimated Effort**: 10-14 hours

---

### Accessibility Enhancements
**Description**: Improve app accessibility for diverse learners.

**Features**:
- [ ] Dyslexia-friendly font option (OpenDyslexic)
- [ ] High contrast mode
- [ ] Adjustable text size throughout app
- [ ] VoiceOver optimization
- [ ] Color-blind friendly indicators
- [ ] Option to disable animations

**Estimated Effort**: 6-8 hours

---

### Parent/Teacher Dashboard
**Description**: Separate interface for parents/teachers to monitor progress.

**Features**:
- [ ] Multi-student profiles
- [ ] Detailed progress reports
- [ ] Export data as PDF/CSV
- [ ] Assign specific word lists or patterns
- [ ] Set practice goals and reminders
- [ ] Weekly/monthly progress emails

**Estimated Effort**: 16-20 hours

---

### Gamification Enhancements
**Description**: Additional game mechanics to increase engagement.

**Features**:
- [ ] Daily streaks with bonus gems
- [ ] Achievement system (badges/trophies)
- [ ] Unlockable themes/avatars
- [ ] Power-ups (hints, time extensions)
- [ ] Mini-games for gem earning
- [ ] Seasonal events and challenges

**Estimated Effort**: 12-16 hours

---

### Offline Mode
**Description**: Full functionality without internet connection.

**Features**:
- [ ] Download all audio files for offline use
- [ ] Local progress sync
- [ ] Sync when online returns
- [ ] Offline indicator in UI

**Estimated Effort**: 4-6 hours

---

## 🐛 Known Issues / Technical Debt

### Pattern Detection Edge Cases
- [ ] Review pattern detection for compound words
- [ ] Handle hyphenated words better
- [ ] Improve detection of irregular spellings
- [ ] Add unit tests for pattern service

**Estimated Effort**: 4-6 hours

---

### Performance Optimization
- [ ] Cache pattern analysis results to disk
- [ ] Lazy load audio files
- [ ] Optimize session selection algorithm for very large word lists
- [ ] Add loading indicators for long operations

**Estimated Effort**: 3-4 hours

---

## 📋 Backlog Notes

**Priority Definitions**:
- **High**: Critical for user experience, high user demand
- **Medium**: Valuable features that enhance core experience
- **Low**: Nice-to-have features for long-term roadmap

**Next Sprint Candidates**:
1. Homophone Challenge Mode (high user value)
2. Progress Dashboard (requested by parents/teachers)
3. Accessibility Enhancements (important for inclusive learning)

**Last Updated**: 2026-01-02
