# Spellbound Setup Guide

All the Swift code has been generated! Follow these steps to create the Xcode project and run the app.

## Quick Setup (5 minutes)

### Step 1: Create New Xcode Project

1. Open **Xcode**
2. Select **File → New → Project**
3. Choose **iOS → App**
4. Click **Next**

### Step 2: Configure Project

Fill in these details:
- **Product Name**: `Spellbound`
- **Team**: (Leave as is or select your team)
- **Organization Identifier**: `com.spellbound` (or your own)
- **Interface**: **SwiftUI**
- **Language**: **Swift**
- **Storage**: None (uncheck Core Data)
- **Include Tests**: No (uncheck if you want)

Click **Next**, then save it in `/Users/ezakas/Spellbound` (**replace the existing Spellbound.xcodeproj**)

### Step 3: Delete Default Files

In the Project Navigator (left panel), delete these default files:
- `ContentView.swift` (we have our own views)
- Any test files if created

### Step 4: Add Our Files

**Drag and drop** these folders from Finder into your Xcode project:
1. `Spellbound/Models` → Drag into Spellbound group (includes PracticeViewModel)
2. `Spellbound/Services` → Drag into Spellbound group
3. `Spellbound/Views` → Drag into Spellbound group
4. `words` folder → Drag into root project

**Important**: When the dialog appears:
- ✅ Check "Copy items if needed"
- ✅ Check "Create groups"
- ✅ Select Spellbound target

### Step 5: Replace App File

1. In Xcode, open `SpellboundApp.swift` (the default one)
2. **Replace** its contents with the file at `/Users/ezakas/Spellbound/Spellbound/SpellboundApp.swift`
   - Or just delete the default one and drag in our version

### Step 6: Verify File Structure

Your project should look like this:
```
Spellbound (project)
├── Spellbound (target)
│   ├── SpellboundApp.swift
│   ├── Models/
│   │   ├── Word.swift
│   │   ├── Session.swift
│   │   ├── Reward.swift
│   │   └── PracticeViewModel.swift
│   ├── Services/
│   │   ├── WordService.swift
│   │   ├── TTSService.swift
│   │   └── StorageService.swift
│   ├── Views/
│   │   ├── PracticeView.swift
│   │   ├── ResultsView.swift
│   │   ├── RewardsView.swift
│   │   └── Components/
│   │       ├── WordInputView.swift
│   │       ├── FeedbackView.swift
│   │       └── GemCounterView.swift
│   └── Assets.xcassets
└── words/
    └── wordlist.txt
```

### Step 7: Build and Run!

1. Select a simulator (iPhone 15 or iPad)
2. Press **⌘ + R** (or click the Play button)
3. The app should build and run!

## Troubleshooting

### "No such file or directory" for wordlist.txt

The `words` folder needs to be added to the project:
1. Right-click on the project root in Xcode
2. Select "Add Files to Spellbound..."
3. Navigate to and select the `words` folder
4. Make sure "Create folder references" is selected (should show as blue folder)
5. Click **Add**

### Build Errors

If you get Swift errors:
1. Check that all files are added to the Spellbound target
2. Click each file in Project Navigator
3. In the right panel (File Inspector), check "Target Membership" includes Spellbound

### Word List Not Loading

1. In Xcode, click on `wordlist.txt`
2. Open **File Inspector** (right panel)
3. Under **Target Membership**, ensure **Spellbound** is checked

## Alternative: Simple Manual Setup

If the drag-and-drop doesn't work:

1. Create the project as described in Steps 1-2
2. Delete default `ContentView.swift`
3. For each Swift file, in Xcode: **File → New → File → Swift File**
4. Copy the contents from `/Users/ezakas/Spellbound/Spellbound/[path]`
5. Paste into your new file
6. Repeat for all 14 Swift files

## You're Done!

Once it builds successfully, tap the speaker button to hear a word, type it in, and start earning gems! 🎉

## Next Steps

- Add your own words to `words/wordlist.txt`
- Customize rewards in `Models/Reward.swift`
- Adjust session length in `ViewModels/PracticeViewModel.swift`

Happy Spelling! ✨
