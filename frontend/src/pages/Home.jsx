import useAuthStore from "../store/authStore";
import { useState, useRef } from "react";
import Dashboard from "./Dashboard";
import "../styles/Home.css";

export default function Home() {
    const token = useAuthStore((state) => state.token);
    const [ title, setTitle] = useState("");
    const [ journalEntry, setJournalEntry] = useState("");
    const [ error, setError] = useState(null);
    const [ success, setSuccess] = useState(null);
    const logout = useAuthStore((state) => state.logout);
    const [ lastTopic, setLastTopic ] = useState('');
    const [isEntry, setIsEntry] = useState(true);
    const bookTextRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        const journalEntry = bookTextRef.current.textContent;
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
            bookTextRef.current.textContent = '';
            setSuccess(true);
        } catch (error) {
            setError('Something went wrong. Please try again.');
        }
    };

    const lastValidContent = useRef('');

    const handleBookTextInput = () => {
        const el = bookTextRef.current;
        if (el.scrollHeight > el.clientHeight) {
            // this keystroke pushed it past the visible page — revert it
            el.innerHTML = lastValidContent.current;
            // move cursor to the end so typing doesn't jump somewhere weird
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(el);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        } else {
            lastValidContent.current = el.innerHTML;
        }
    };

    return (
        <div className="home-root">
            <button className="logout-button" onClick={logout}>Logout</button>
            <button className="toggle-entry-btn" onClick={() => setIsEntry(!isEntry)}>{isEntry ? 'Journals' : 'Entry'}</button>
            <div className="home-container">
                {isEntry ? (
                    <div className="entry-container">
                        <div className="title-row">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Title your thoughts..."
                            />
                        </div>
                        <div
                            className="book-text"
                            contentEditable="true"
                            ref={bookTextRef}
                            placeholder="Dump your thoughts here..."
                            onInput={handleBookTextInput}
                            suppressContentEditableWarning={true}
                        ></div>
                        <button className="submit-btn" onClick={handleSubmit}>Submit</button>
                        {error && <p className="error-message">{error}</p>}
                        {success && <p className="success-message">Entry saved!</p>}
                    </div>
                ) : (
                    <Dashboard />
                )}
            </div>
        </div>
    );
}