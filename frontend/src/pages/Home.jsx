import useAuthStore from "../store/authStore";
import { useState, useRef, useEffect } from "react";
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
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [leftText, setLeftText] = useState('');
    const [rightText, setRightText] = useState('');
    const leftRef = useRef(null);
    const rightRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setIsSubmitting(true);
        const journalEntry = leftRef.current.textContent + '\n' + rightRef.current.textContent;
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
            leftRef.current.textContent = '';
            rightRef.current.textContent = '';
            setSuccess(true);
        } catch (error) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const lastValidContent = useRef('');

    const handleBookTextInput = () => {
        const el = bookTextRef.current;
        if (el.scrollHeight > el.clientHeight) {
            el.innerHTML = lastValidContent.current;
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

    const findOverflowSplit = (fullText, referenceEl) => {
        const words = fullText.split(' ');
        const style = getComputedStyle(referenceEl);
        const tester = document.createElement('div');
        tester.style.position = 'absolute';
        tester.style.visibility = 'hidden';
        tester.style.width = style.width;
        tester.style.padding = style.padding;
        tester.style.fontFamily = style.fontFamily;
        tester.style.fontSize = style.fontSize;
        tester.style.lineHeight = style.lineHeight;
        tester.style.whiteSpace = 'pre-wrap';
        tester.style.wordWrap = 'break-word';
        document.body.appendChild(tester);
        let fitWords = [];
        let splitIndex = words.length;
        for (let i = 0; i < words.length; i++) {
            tester.innerText = words.slice(0, i + 1).join(' ');
            if (tester.scrollHeight > referenceEl.clientHeight) {
                splitIndex = i;
                break;
            }
            fitWords.push(words[i]);
        }
        document.body.removeChild(tester);
        const fits = words.slice(0, splitIndex).join(' ');
        const overflow = words.slice(splitIndex).join(' ');
        return { fits, overflow };
    };

    const handleLeftInput = (e) => {
        const el = leftRef.current;
        const currentText = el.innerText;
        if (el.scrollHeight > el.clientHeight) {
            const { fits, overflow } = findOverflowSplit(currentText, el);
            setLeftText(fits);
            el.innerText = fits;
            const newRightText = (overflow + ' ' + rightRef.current.innerText).trim();
            setRightText(newRightText);
            rightRef.current.innerText = newRightText;
            setTimeout(() => {
                rightRef.current.focus();
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(rightRef.current);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }, 0);
        } else {
            setLeftText(currentText);
        }
    };

    return (
        <div className="home-root">
            <button className="logout-button" onClick={logout}>Logout</button>
            <button className="toggle-entry-btn" onClick={() => setIsEntry(!isEntry)}>{isEntry ? 'Journals' : 'Entry'}</button>
            <div className="home-container">
                {isEntry ? (
                    <div className="entry-container">
                        <div className="home-left-page" >
                            <div className="title-row">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Title your thoughts..."
                                />
                            </div>
                            <div
                                className="book-text-left"
                                contentEditable="true"
                                ref={leftRef}
                                placeholder="Dump your thoughts here..."
                                onInput={handleLeftInput}
                                suppressContentEditableWarning={true}
                            ></div>
                        </div>
                        <div className="home-right-page" >
                            <div
                                className="book-text-right"
                                contentEditable="true"
                                ref={rightRef}
                                placeholder="Dump your thoughts here..."
                                suppressContentEditableWarning={true}
                            ></div>
                            <button className="submit-btn" onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Submit'}
                            </button>
                            {error && <p className="error-message">{error}</p>}
                            {success && <p className="success-message">Entry saved!</p>}
                        </div>
                    </div>
                ) : (
                    <Dashboard />
                )}
            </div>
        </div>
    );
}

import gsap from "gsap";

function TestBox() {
    const boxRef = useRef(null);
    useEffect(() => {
        gsap.to(boxRef.current, {
            rotateY: -180,
            duration: 1.5, 
            ease: 'power2.inOut'
        })
    }, [])
    return (
        <div style={{ perspective: 1200, margin: 50 }}>
            <div
                ref={boxRef}
                style={{
                    width: 150,
                    height: 200,
                    background: 'red',
                    transformOrigin: 'left center',
                    backfaceVisibility: 'hidden'
                }}
            ></div>
        </div>
    );
}

