import { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";

export default function Dashboard() {
    const [notes, setNotes] = useState([]);
    const [error, setError] = useState(null);
    const token = useAuthStore((state) => state.token);
    const logout = useAuthStore((state) => state.logout);
    const [searchQuery, setSearchQuery] = useState('');

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

    useEffect(() => {
        fetchNotes();
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

    return (
        <div>
            <button onClick={logout}>Logout</button>

            <h1>My Journals</h1>
            {error && <p>{error}</p>}
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by topic..."
                />
                <button type="submit">Search</button>
            </form>
            {notes.length === 0 && <p>No notes found.</p>}
            <button onClick={fetchNotes}>Refresh</button>
            {notes.map((note) => (
                <div key={note.id}>
                    <button onClick={() => {
                        const isConfirmed = window.confirm('Are you sure you want to delete this note?');
                        if (isConfirmed) {
                            handleDelete(note.id);
                        }
                    }}>Delete</button>
                    <h3>{note.title}</h3>
                    <p>{note.journal}</p>
                    <p><em>{note.topic}</em></p>
                </div>
            ))}
        </div>
    )
}