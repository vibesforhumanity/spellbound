import json
import os
from openai import OpenAI
import time

# Configuration
INPUT_FILE = "Spellbound/Spellbound/wordlist.json"
API_KEY = os.environ.get("OPENAI_API_KEY")

def generate_tip(client, word):
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant for a children's spelling app."},
                {"role": "user", "content": f"Write a very short, catchy mnemonic or spelling tip for the word '{word}' to help a child remember how to spell it. Focus on the difficult part. Keep it under 15 words."}
            ]
        )
        return response.choices[0].message.content.strip().replace('"', '')
    except Exception as e:
        print(f"Error generating tip for {word}: {e}")
        return None

def main():
    if not API_KEY:
        print("Please set OPENAI_API_KEY environment variable.")
        return

    client = OpenAI(api_key=API_KEY)

    try:
        with open(INPUT_FILE, 'r') as f:
            words = json.load(f)
    except FileNotFoundError:
        print(f"Error: Could not find {INPUT_FILE}")
        return

    changed = False
    print(f"Processing {len(words)} words...")

    for i, entry in enumerate(words):
        # Skip if tip already exists and is not empty
        if "tip" in entry and entry["tip"]:
            continue
        
        print(f"Generating tip for: {entry['text']} ({i+1}/{len(words)})")
        tip = generate_tip(client, entry['text'])
        
        if tip:
            entry["tip"] = tip
            changed = True
            
            # Save periodically (every 20 words) to prevent data loss
            if i % 20 == 0:
                with open(INPUT_FILE, 'w') as f:
                    json.dump(words, f, indent=2)
    
    # Final save
    if changed:
        with open(INPUT_FILE, 'w') as f:
            json.dump(words, f, indent=2)
        print(f"Successfully updated {INPUT_FILE} with spelling tips.")
    else:
        print("No updates needed.")

if __name__ == "__main__":
    main()
