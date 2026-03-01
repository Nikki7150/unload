def detect_topic(title: str, content: str) -> str:
    text = f"{title} {content}".lower()

    # Create a dictionary of topics
    # Each topic has a list of keywords
    # Count how many times keywords appear
    # Choose topic with highest score
    # If all scores = 0 → return "general"

    topics = {
        "family": ["mother", "father", "mom", "dad", "family", "parents"],
        "school": ["exam", "test", "school", "homework", "math", "class", "teacher"],
        "mental health": ["stress", "anxiety", "overwhelmed", "panic", "sad", "depressed"],
        "coding": ["code", "bug", "project", "programming", "github", "coding"]
    }

    scores = {}

    for topic, keywords in topics.items():
        score = 0
        for word in keywords:
            score += text.count(word)
        scores[topic] = score

    # find highest scoring topic
    best_topic = max(scores, key=scores.get)

    # if no keywords are found
    if scores[best_topic] == 0:
        return "general"
    
    return best_topic