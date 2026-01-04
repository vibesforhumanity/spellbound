# Spellbound - Adaptive Spelling Practice App (MVP)

An iOS spelling practice app for kids that uses gamification to make learning fun!

## Features

- 🔊 **Text-to-Speech**: Hear words spoken aloud
- ⌨️ **Simple Input**: Large, kid-friendly text entry
- 💎 **Gemstone Rewards**: Earn 1 gem for every 10 correct words
- 🎁 **Redeem Rewards**:
  - 5 gems = 30 min Minecraft with Dad
  - 10 gems = Movie Night
- ✅ **Wrong Word Retry**: Words spelled incorrectly are practiced again at the end
- 📊 **Session Stats**: Track progress after each practice session

## Getting Started

### 1. Open the Project

```bash
cd Spellbound
open Spellbound.xcodeproj
```

### 2. Add Your Word List

The app includes a sample word list at `words/wordlist.txt`. You can:
- Replace it with your own list
- Add more words (one word per line)
- Remove the `#` comments if desired

### 3. Build and Run

1. Select a simulator (iPhone 14 or iPad recommended)
2. Press **Cmd + R** to build and run
3. The app will load the word list automatically

## Project Structure

```
Spellbound-src/
├── Models/              # Data models (Word, Session, Reward, PracticeViewModel)
├── Services/            # Business logic (WordService, TTSService, StorageService)
├── Views/              # SwiftUI views
│   ├── PracticeView.swift
│   ├── ResultsView.swift
│   ├── RewardsView.swift
│   └── Components/     # Reusable components
└── words/              # Word lists
    └── wordlist.txt
```

## How It Works

1. **Start Practice**: App loads 10 random words from the word list
2. **Listen**: Tap the speaker button to hear the word
3. **Type**: Enter the spelling in the large text field
4. **Check**: Tap "Check Spelling" to verify
5. **Feedback**: See if you got it right!
6. **Retry**: Words spelled wrong come back at the end
7. **Earn Gems**: Get 1 gem for every 10 correct words
8. **Redeem**: Use gems to unlock rewards!

## Customization

### Adding Words

Edit `words/wordlist.txt`:
```
# Your words here
phone
elephant
friend
because
```

### Changing Rewards

Edit `Spellbound/Models/Reward.swift`:
```swift
static let presets: [Reward] = [
    Reward(title: "Your Custom Reward", gemCost: 5, icon: "star.fill"),
    // Add more rewards...
]
```

### Adjusting Words Per Session

Edit `Spellbound/ViewModels/PracticeViewModel.swift`:
```swift
private let wordsPerSession = 10  // Change this number
```

## Future Enhancements (v2)

- SM-2 spaced repetition algorithm
- Error pattern analysis (digraph detection, vowel teams)
- Adaptive word selection based on mistakes
- Progressive hints system
- Analytics dashboard
- Word preprocessing with pattern detection

## Requirements

- iOS 16.0+
- Xcode 15.0+
- Swift 5.9+

## License

Created for personal use. Modify as needed!

## Enjoy!

Have fun learning to spell! 🎉📚✨
