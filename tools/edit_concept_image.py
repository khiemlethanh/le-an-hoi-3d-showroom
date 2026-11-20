"""Edit an existing concept image with Gemini (keeps the scene, applies one change).

Usage: edit_concept_image.py <input.jpg> <output.jpg> "<edit instruction>"
The API key is read from GEMINI_API_KEY or the ClaudeKit skills .env file.
"""
import os
import sys
from pathlib import Path

from google import genai
from google.genai import types

MODEL = "gemini-3.1-flash-image-preview"
ENV_FILE = Path.home() / ".claude" / "skills" / ".env"


def load_api_key() -> str:
    key = os.environ.get("GEMINI_API_KEY")
    if key:
        return key
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            if line.startswith("GEMINI_API_KEY="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise SystemExit("GEMINI_API_KEY not found")


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit(__doc__)
    src, dst, instruction = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3]
    client = genai.Client(api_key=load_api_key())
    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=[
                types.Part.from_bytes(data=src.read_bytes(), mime_type="image/jpeg"),
                instruction,
            ],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE"],
                image_config=types.ImageConfig(aspect_ratio="16:9", image_size="2K"),
            ),
        )
    except Exception as err:  # surface API failures without a stack trace
        raise SystemExit(f"Gemini request failed: {err}")
    for part in response.candidates[0].content.parts:
        if part.inline_data:
            dst.write_bytes(part.inline_data.data)
            print(f"saved {dst}")
            return
    raise SystemExit("No image returned")


if __name__ == "__main__":
    main()
