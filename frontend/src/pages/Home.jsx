import useAuthStore from "../store/authStore";
import { useState } from "react";
import Dashboard from "./Dashboard";

export default function Home() {
    const token = useAuthStore((state) => state.token);
    const [ title, setTitle] = useState("");
    const [ journalEntry, setJournalEntry] = useState("");
    const [ error, setError] = useState(null);
    const [ success, setSuccess] = useState(null);
    const logout = useAuthStore((state) => state.logout);
    const [ lastTopic, setLastTopic ] = useState('');
    const [isEntry, setIsEntry] = useState(true);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        try {
            const response = await fetch('http://127.0.0.1:8000/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, journal: journalEntry })
            });
            if (!response.ok) {
                throw new Error('Failed to submit entry');
            }
            const data = await response.json();
            setLastTopic(data.topic);
            setTitle('');
            setJournalEntry('');
            setSuccess(true);
        } catch (error) {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div>
            <button onClick={() => setIsEntry(!isEntry)}>{isEntry ? 'View Journals' : 'New Entry'}</button>
            {isEntry ? (
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Write your Journal Entry..."
                        value={journalEntry}
                        onChange={(e) => setJournalEntry(e.target.value)}
                    />
                    {error && <p>{error}</p>}
                    {success && <p>Entry saved!</p>}
                    {lastTopic && <p>Topic: {lastTopic}</p>}
                    <button type="submit">Submit</button>
                </form>
            ) : (
                <Dashboard />
            )}
        </div>
    );
}