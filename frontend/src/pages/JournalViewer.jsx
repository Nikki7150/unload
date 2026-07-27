import "./../styles/Dashboard.css";
import { FaTimes, FaEdit } from "react-icons/fa";
import { useState } from "react";
import useAuthStore from "../store/authStore";
import { timeAgo } from "../utils/timeAgo";

export default function JournalViewer({ note, onBack, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editJournal, setEditJournal] = useState('');
    const token = useAuthStore((state) => state.token);
    const [isSubmitting, setIsSubmitting] = useState(false);
    if(!note) return null;

    const startEditing = () => {
        setIsEditing(true);
        setEditTitle(note.title);
        setEditJournal(note.journal);
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`http://127.0.0.1:8000/notes/${note.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: editTitle,
                    journal: editJournal
                })
            });
            if (!response.ok) {
                throw new Error('Failed to update note');
            }
            const updatedNote = await response.json();
            onUpdate(updatedNote);
            setIsEditing(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="journal-viewer">
            <div className="journal-viewer-header">
                <button className="back-button" onClick={onBack}>
                    <FaTimes />
                </button>
                <p><em>{note.topic}</em></p>
                <p>{new Date(note.created_at).toLocaleDateString()}</p>
            </div>
            {isEditing ? (
                <div className="journal-edit-form">
                    <input
                        className="journal-viewer-title-input"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <textarea
                        className="journal-viewer-journal-input"
                        value={editJournal}
                        onChange={(e) => setEditJournal(e.target.value)}
                    />
                    <div className="journal-edit-buttons">
                        <button onClick={handleSave} disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                </div>
            ) : (
                <div className="journal-content">
                    <div className="journal-viewer-title-container">
                        <h2 className="journal-viewer-title">{note.title}</h2>
                        <button onClick={startEditing} className="edit-button"><FaEdit /></button>
                    </div>
                    <p className="journal-timeago">{note.updated_at ? `Edited ${timeAgo(note.updated_at)}` : null}</p>
                    <p className="journal-viewer-journal">{note.journal}</p>
                </div>
            )}
        </div>
    );
}