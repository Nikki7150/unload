def detect_topic(title: str, content: str) -> str:
    text = f"{title} {content}".lower()

    # Family-related
    if any(word in text for word in ["mother", "father", "mom", "dad", "family", "parents"]):
        return "family"
    
    # School-related
    if any(word in text for word in ["exam", "test", "score", "school", "homework", "math", "class", "teacher"]):
        return "school"

    # Mental Health
    if any(word in text for word in ["stress", "anxiety", "overwhelmed", "panic", "sad", "depressed", "overthinking"]):
        return "mental health"
    
    # Coding / projects
    if any(word in text for word in ["code", "bug", "project", "programming", "github"]):
        return "coding"
    
    return "general"