import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_NAME = "gemini-3.5-flash-lite"

def detect_topic(title: str, content: str) -> str:
    prompt = f"""
    Read this journal entry and respond with ONE short topic word or phrase (like "family", "school", "mental health", "coding", "relationships", "work") that best categorizes it. Respond with ONLY the topic, nothing else.
    Title: {title}
    Content: {content}
    """

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )

    topic = response.text.strip().lower()
    return topic