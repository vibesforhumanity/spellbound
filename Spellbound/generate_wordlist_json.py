#!/usr/bin/env python3
"""
Generate wordlist.json with word-specific sentences and definitions.
Target audience: 7-year-old (grade 2-3)
"""

import json

# Read the current wordlist
with open('/Users/ezakas/Spellbound/Spellbound/Spellbound/wordlist.txt', 'r') as f:
    words = [line.strip() for line in f if line.strip()]

# Common word definitions (kid-friendly)
definitions = {
    # Basic words
    "a": "One single thing",
    "about": "Almost or near to something",
    "above": "Higher than something else",
    "across": "From one side to the other side",
    "after": "Later in time or following something",
    "again": "One more time",
    "all": "Every one or everything",
    "also": "In addition, too",
    "always": "Every time, all the time",
    "am": "A form of the word 'be' - I am happy",
    "an": "One single thing (used before vowels)",
    "and": "Plus, together with",
    "animal": "A living creature like a dog, cat, or bird",
    "any": "One or some of something",
    "are": "A form of the word 'be' - you are nice",
    "around": "On all sides, in a circle",
    "as": "The same way or while",
    "ask": "To say a question to someone",
    "at": "In a place or time",
    "away": "To a different place, not here",

    # More words
    "back": "The opposite direction, or the rear part",
    "be": "To exist or live",
    "because": "The reason why something happens",
    "been": "To have existed in the past",
    "before": "Earlier in time",
    "began": "Started in the past",
    "begin": "To start something",
    "being": "Living or existing",
    "below": "Lower than something",
    "between": "In the middle of two things",
    "big": "Large in size",
    "book": "Pages with words and stories bound together",
    "both": "The two together",
    "boy": "A young male child",
    "but": "However, except",
    "by": "Near to or next to something",

    # Common actions
    "call": "To speak loudly to get attention or use a phone",
    "came": "Arrived, moved toward (past tense)",
    "can": "Able to do something",
    "car": "A vehicle with four wheels that drives on roads",
    "change": "To make different or become different",
    "city": "A large town with many people and buildings",
    "come": "To move toward this place",
    "could": "Was able to do something",

    # More common words
    "day": "The time when the sun is up, 24 hours",
    "did": "Performed an action (past tense)",
    "different": "Not the same",
    "do": "To perform an action",
    "does": "Performs an action",
    "don't": "Do not",
    "down": "Toward a lower place",

    "each": "Every one separately",
    "earth": "The planet we live on",
    "eat": "To put food in your mouth and swallow",
    "end": "The last part or finish",
    "even": "Also, including",
    "every": "All of them, each one",
    "example": "Something that shows how things work",

    "family": "Parents, children, and relatives together",
    "far": "A long distance away",
    "father": "A male parent, dad",
    "feel": "To sense something or have an emotion",
    "few": "A small number of things",
    "find": "To discover or locate something",
    "first": "Before all others, number one",
    "follow": "To go after or come behind",
    "food": "Things we eat to stay alive",
    "for": "Meant to be given to or used by",
    "found": "Discovered something (past tense)",
    "four": "The number 4",
    "friend": "Someone you like and enjoy spending time with",
    "from": "Starting at a place or person",

    "get": "To receive or obtain something",
    "girl": "A young female child",
    "give": "To hand something to someone else",
    "go": "To move or travel somewhere",
    "good": "Pleasant, nice, or well-behaved",
    "got": "Received or obtained (past tense)",
    "great": "Very good or large",
    "group": "Several people or things together",

    "had": "Owned or possessed (past tense)",
    "hand": "The body part at the end of your arm",
    "has": "Owns or possesses",
    "have": "To own or possess something",
    "he": "A male person",
    "head": "The top part of your body with your brain",
    "hear": "To sense sounds with your ears",
    "help": "To make things easier for someone",
    "her": "Belongs to a female",
    "here": "In this place",
    "high": "Far up, tall",
    "him": "A male person (object)",
    "his": "Belongs to a male",
    "home": "The place where you live",
    "house": "A building where people live",
    "how": "In what way or manner",

    "I": "The person speaking (me)",
    "if": "In case that, supposing",
    "important": "Something that matters a lot",
    "in": "Inside of something",
    "into": "Moving to the inside of",
    "is": "A form of the word 'be' - it is fun",
    "it": "A thing or animal",
    "its": "Belongs to a thing",

    "just": "Only, simply, or exactly",

    "keep": "To continue having or doing",
    "kind": "Type or sort, also means nice",
    "know": "To have information about something",

    "land": "The ground or earth, not water",
    "large": "Big in size",
    "last": "The final one or most recent",
    "later": "After this time, not now",
    "learn": "To get new knowledge or skills",
    "leave": "To go away from a place",
    "left": "The opposite of right",
    "let": "To allow or permit",
    "letter": "A written message or a symbol like A, B, C",
    "life": "Being alive and living",
    "light": "Brightness that lets us see",
    "like": "Similar to, or to enjoy something",
    "line": "A long thin mark or a row of people",
    "little": "Small in size",
    "live": "To be alive and exist",
    "long": "A great distance or time",
    "look": "To use your eyes to see",
    "love": "A very strong feeling of caring",

    "made": "Created or built (past tense)",
    "make": "To create or build something",
    "man": "An adult male person",
    "many": "A large number of things",
    "may": "Might happen or is allowed",
    "me": "The person speaking (object)",
    "mean": "To signify or intend",
    "men": "More than one adult male",
    "might": "Could possibly happen",
    "more": "A greater amount",
    "most": "The greatest amount",
    "mother": "A female parent, mom",
    "move": "To change position or go somewhere",
    "much": "A large amount",
    "must": "Have to, required",
    "my": "Belongs to me",

    "name": "What someone or something is called",
    "near": "Close to something",
    "need": "To require something important",
    "never": "Not at any time",
    "new": "Recently made, not old",
    "next": "Coming right after",
    "night": "The time when it's dark and we sleep",
    "no": "Not any, the opposite of yes",
    "not": "The opposite, negative",
    "now": "At this moment",
    "number": "A counting word like 1, 2, 3",

    "of": "Belonging to or part of",
    "off": "Not on, away from",
    "often": "Happening many times",
    "oh": "An exclamation of surprise",
    "old": "Having existed for a long time",
    "on": "Touching the top of something",
    "once": "One time only",
    "one": "The number 1, a single thing",
    "only": "Just one, nothing more",
    "open": "Not closed",
    "or": "Gives a choice between things",
    "other": "Different one, not this one",
    "our": "Belongs to us",
    "out": "Outside, not in",
    "over": "Above or more than",
    "own": "Belonging to yourself",

    "page": "One side of a sheet of paper in a book",
    "part": "A piece of something bigger",
    "people": "Humans, more than one person",
    "place": "A location or spot",
    "play": "To have fun or perform music",
    "point": "A sharp end or a specific spot",
    "put": "To place or set something down",

    "read": "To look at words and understand them",
    "right": "Correct or the opposite of left",
    "run": "To move quickly on your feet",

    "said": "Spoke words (past tense)",
    "same": "Exactly alike, not different",
    "saw": "Looked at something (past tense)",
    "say": "To speak words",
    "school": "A place where children learn",
    "see": "To look at with your eyes",
    "she": "A female person",
    "should": "Ought to do something",
    "show": "To let someone see something",
    "small": "Little in size",
    "so": "Very or therefore",
    "some": "A certain amount, not all",
    "something": "A thing, not specific",
    "sound": "Noise that you hear",
    "spell": "To write or say the letters in a word",
    "still": "Not moving or continuing",
    "story": "A tale about events that happened",
    "such": "Of this kind",

    "take": "To grab and carry with you",
    "tell": "To give information with words",
    "than": "Compared to something else",
    "that": "Pointing to a specific thing",
    "the": "A specific thing or person",
    "their": "Belongs to them",
    "them": "Those people or things (object)",
    "then": "At that time or next",
    "there": "In that place",
    "these": "These things here (plural)",
    "they": "Those people or things",
    "thing": "An object or item",
    "think": "To use your mind, to have thoughts",
    "this": "This thing here",
    "those": "Those things there (plural)",
    "thought": "An idea or believed (past tense)",
    "three": "The number 3",
    "through": "From one end to the other",
    "time": "When something happens, minutes and hours",
    "to": "Toward a place or person",
    "together": "With each other, as a group",
    "too": "Also or more than needed",
    "took": "Grabbed and carried (past tense)",
    "tree": "A tall plant with a trunk and branches",
    "try": "To attempt to do something",
    "turn": "To rotate or change direction",
    "two": "The number 2",

    "under": "Below or beneath something",
    "until": "Up to a certain time",
    "up": "Toward a higher place",
    "us": "You and me together",
    "use": "To employ something for a purpose",

    "very": "Extremely or really",

    "walk": "To move by putting one foot in front of the other",
    "want": "To wish for or desire something",
    "was": "Existed in the past",
    "water": "The liquid we drink and that fills oceans",
    "way": "A path or method to do something",
    "we": "You and I, us",
    "well": "In a good manner or a deep hole for water",
    "went": "Moved somewhere (past tense)",
    "were": "Existed in the past (plural)",
    "what": "Asking about something",
    "when": "At what time",
    "where": "In what place",
    "which": "What one or ones",
    "while": "During the time that",
    "who": "What person",
    "why": "For what reason",
    "will": "Going to happen in the future",
    "with": "Together, alongside",
    "without": "Not having, lacking",
    "woman": "An adult female person",
    "word": "A unit of language with meaning",
    "work": "To do a job or task",
    "world": "The Earth and everything on it",
    "would": "Might happen or used to happen",
    "write": "To make letters and words on paper",

    "year": "Twelve months, 365 days",
    "yes": "The opposite of no, agreeing",
    "yet": "Up until now or still",
    "you": "The person being spoken to",
    "your": "Belongs to you",
}

def generate_sentence(word):
    """Generate a simple sentence using the word in context."""
    # Use custom definitions for common words
    word_lower = word.lower()

    # Simple sentence patterns
    sentences = {
        "run": "The dog can run very fast.",
        "jump": "I like to jump on the trampoline.",
        "play": "Let's play outside today!",
        "read": "I love to read books before bed.",
        "write": "Please write your name on the paper.",
        "book": "My favorite book has pictures of dinosaurs.",
        "cat": "Our cat likes to sleep in the sun.",
        "dog": "My dog wags its tail when happy.",
        "tree": "The tall tree has green leaves.",
        "sun": "The sun is bright and warm.",
        "moon": "We can see the moon at night.",
        "star": "I wish upon a star every night.",
        "friend": "My best friend lives next door.",
        "school": "I go to school to learn new things.",
        "home": "I feel safe and happy at home.",
        "mom": "Mom makes the best cookies.",
        "dad": "Dad reads me bedtime stories.",
        "happy": "The birthday party made me happy.",
        "sad": "I felt sad when my toy broke.",
        "big": "The elephant is a very big animal.",
        "small": "The ant is a small insect.",
        "fast": "The race car goes fast.",
        "slow": "The turtle moves slow and steady.",
    }

    if word_lower in sentences:
        return sentences[word_lower]

    # Default pattern
    return f"I can use the word {word} in my writing."

def generate_definition(word):
    """Generate a kid-friendly definition."""
    word_lower = word.lower()

    if word_lower in definitions:
        return definitions[word_lower]

    # Default definition
    return f"The word {word} is used in English."

# Generate the JSON data
wordlist_data = []
for word in words:
    wordlist_data.append({
        "text": word,
        "sentence": generate_sentence(word),
        "definition": generate_definition(word)
    })

# Write to JSON file
output_path = '/Users/ezakas/Spellbound/Spellbound/Spellbound/wordlist.json'
with open(output_path, 'w') as f:
    json.dump(wordlist_data, f, indent=2)

print(f"✅ Generated wordlist.json with {len(wordlist_data)} words")
print(f"📍 Saved to: {output_path}")
