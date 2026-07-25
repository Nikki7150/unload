export default function JournalViewer({ note, onBack }) {
    if(!note) return null;
    return (
        <div className="journal-viewer">
            <button className="back-button" onClick={onBack}>Back to Journals</button>
            <h1>{note.title}</h1>
            <p>{note.journal}</p>
            <p><em>{note.topic}</em></p>
            <p>{new Date(note.created_at).toLocaleDateString()}</p>
        </div>
    );
}