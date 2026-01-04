import json
import os
import pathlib
import argparse
from openai import OpenAI

# Configuration
INPUT_FILE = "Spellbound/Spellbound/wordlist.json"
AUDIO_DIR = "Spellbound/Spellbound/Audio"
API_KEY = os.environ.get("OPENAI_API_KEY")

def ensure_dir(path):
    pathlib.Path(path).mkdir(parents=True, exist_ok=True)

def generate_audio(client, text, filepath):
    if os.path.exists(filepath):
        # print(f"Skipping (exists): {filepath}")
        return

    print(f"Generating: {filepath}...")
    try:
        response = client.audio.speech.create(
            model="tts-1",
            voice="alloy", # Options: alloy, echo, fable, onyx, nova, shimmer
            input=text
        )
        response.stream_to_file(filepath)
    except Exception as e:
        print(f"Error generating {filepath}: {e}")

def main():
    parser = argparse.ArgumentParser(description="Generate natural TTS audio files for Spellbound.")
    parser.add_argument("--words", action="store_true", help="Generate word audio")
    parser.add_argument("--sentences", action="store_true", help="Generate sentence audio")
    parser.add_argument("--definitions", action="store_true", help="Generate definition audio")
    parser.add_argument("--all", action="store_true", help="Generate all audio types")
    
    args = parser.parse_args()

    if not API_KEY:
        print("Please set OPENAI_API_KEY environment variable.")
        return

    # Default to words if nothing specified
    if not (args.words or args.sentences or args.definitions or args.all):
        args.words = True

    client = OpenAI(api_key=API_KEY)
    ensure_dir(AUDIO_DIR)

    with open(INPUT_FILE, 'r') as f:
        words = json.load(f)

    print(f"Found {len(words)} words. Starting generation...")

    for word_data in words:
        word_text = word_data['text']
        
        # 1. Word Audio
        if args.words or args.all:
            word_filename = f"word_{word_text}.mp3"
            word_path = os.path.join(AUDIO_DIR, word_filename)
            generate_audio(client, word_text, word_path)

        # 2. Sentence Audio
        if args.sentences or args.all:
            sentence_filename = f"sentence_{word_text}.mp3"
            sentence_path = os.path.join(AUDIO_DIR, sentence_filename)
            generate_audio(client, word_data['sentence'], sentence_path)

        # 3. Definition Audio
        if args.definitions or args.all:
            definition_filename = f"definition_{word_text}.mp3"
            definition_path = os.path.join(AUDIO_DIR, definition_filename)
            generate_audio(client, word_data['definition'], definition_path)
        
    print("Done!")

if __name__ == "__main__":
    main()