import "./../styles/Dashboard.css";
import { FaTimes } from "react-icons/fa";

export default function JournalViewer({ note, onBack }) {
    if(!note) return null;
    return (
        <div className="journal-viewer">
            <div className="journal-viewer-header">
                <button className="back-button" onClick={onBack}>
                    <FaTimes />
                </button>
                <p><em>{note.topic}</em></p>
                <p>{new Date(note.created_at).toLocaleDateString()}</p>
            </div>
            <h1 className="journal-viewer-title">{note.title}</h1>
            <p className="journal-viewer-content">{note.journal}</p>
        </div>
    );
}