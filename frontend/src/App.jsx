import { useState } from "react";

function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    await fetch("http://127.0.0.1:8000/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title, content })
    });

    setTitle("");
    setContent("");
    alert("Unloaded.");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>UNLOAD</h1>

      <input
        placeholder="Title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <textarea
        placeholder="Type everything..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ width: "100%", height: 200 }}
      />

      <button onClick={handleSubmit} style={{ marginTop: 10 }}>
        Unload
      </button>
    </div>
  );
}

export default App;