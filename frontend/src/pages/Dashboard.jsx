import { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import "../styles/Dashboard.css";
import JournalViewer from "./JournalViewer";
import { FaTrash, FaSearch, FaTimes } from "react-icons/fa";

export default function Dashboard() {
    const [notes, setNotes] = useState([]);
    const [error, setError] = useState(null);
    const token = useAuthStore((state) => state.token);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNote, setSelectedNote] = useState(null);
    const [topics, setTopics] = useState([]);
    const [activeTopic, setActiveTopic] = useState(null);
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    const fetchNotes = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/notes', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch notes');
            }
            const data = await response.json();
            setNotes(data);
        } catch (error) {
            setError('Something went wrong. Please try again.');
        }
    };

    const fetchTopics = async () => {
        try {
            const response = await fetch('http://127.0.1:8000/notes/topics', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch topics');
            }
            const data = await response.json();
            setTopics(data);
        } catch (error) {
            setError('Something went wrong. Please try again.');
        }
    };

    useEffect(() => {
        fetchNotes();
        fetchTopics();
    }, []);

    const handleDelete = async (noteId) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/notes/${noteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to delete note');
            }
            setNotes(notes.filter(note => note.id !== noteId));
        } catch (error) {
            setError('Something went wrong. Please try again.');
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://127.0.0.1:8000/notes/search?q=${searchQuery}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Search failed');
            }
            const data = await response.json();
            setNotes(data);
        } catch (error) {
            setError('Something went wrong. Please try again.');
        }
    };

    const handleUpdate = (updatedNote) => {
        setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
        setSelectedNote(updatedNote);
    };

    const handleTopicClick = async (topic) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/notes/by-topics?topic=${topic}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to filter by topic');
            }
            const data = await response.json();
            setNotes(data);
            setActiveTopic(topic);
        } catch (error) {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="dashboard">
            <div className="journal-dashboard">
                <div className="left-page">
                    {error && <p>{error}</p>}
                    <div className="dashboard-header">
                        <h1 className="dashboard-title">My Journals</h1>
                        <form onSubmit={handleSearch} className="search-form">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="search-input"
                            />
                            <button type="submit" className="search-button">
                                <FaSearch />
                            </button>
                            <button onClick={() => {fetchNotes(); setSearchQuery('');}} className="refresh-button"><FaTimes /></button>
                        </form>
                    </div>
                    {notes.length === 0 && <p className="no-notes">No notes found.</p>}
                    <button className="topic-filters" onClick={() => setIsFilterVisible(!isFilterVisible)}>
                        {activeTopic ? `Filtered: ${activeTopic}` : 'Topic Filters'}
                    </button>
                    <div className="topic-filters-selection" style={{ display: isFilterVisible ? 'grid' : 'none' }}>
                        {topics.map((topic) => (
                            <button
                                key={topic}
                                onClick={() => handleTopicClick(topic)}
                                className={`topic-filter-button ${activeTopic === topic ? 'active' : ''}`}
                            >
                                {topic}
                            </button>
                        ))}
                        {activeTopic && (
                            <button onClick={() => {fetchNotes(); setActiveTopic(null);}} className="clear-filter-button">
                                Clear Filter
                            </button>
                        )}
                    </div>
                    <div className="notes-list">
                        {notes.map((note) => (
                            <div key={note.id} onClick={() => setSelectedNote(note)} className={`note-item ${selectedNote && selectedNote.id === note.id ? 'selected' : ''}`}>
                                <div className="note-header">
                                    <h3 className="note-title">{note.title}</h3>
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        const isConfirmed = window.confirm('Are you sure you want to delete this note?');
                                        if (isConfirmed) {
                                            handleDelete(note.id);
                                        }
                                    }} className="delete-button">
                                        <FaTrash />
                                    </button>
                                </div>
                                <p className="note-topic">
                                    <em>{note.topic}</em>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="right-page">
                    {selectedNote ? (
                        <JournalViewer note={selectedNote} onBack={() => setSelectedNote(null)} onUpdate={handleUpdate} />
                    ) : (
                        <p className="no-note-selected">Select a note to view it here.</p>
                    )}
                </div>
            </div>
        </div>
    )
}