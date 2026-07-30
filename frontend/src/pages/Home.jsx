import useAuthStore from "../store/authStore";
import { useState, useRef, useEffect } from "react";
import Dashboard from "./Dashboard";
import "../styles/Home.css";
import gsap from "gsap";
import AuthScreen from "./AuthScreen";
import Profile from "./Profile";
import { FaUserCircle } from "react-icons/fa";

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

    // State for left and right text areas
    const [leftText, setLeftText] = useState('');
    const [rightText, setRightText] = useState('');
    const leftRef = useRef(null);
    const rightRef = useRef(null);

    // States for page turn animation
    const [view, setView] = useState('entry');
    const [transitioning, setTransitioning] = useState(false);
    const [direction, setDirection] = useState(null);
    const turningPageRef = useRef(null);
    const restLeftPageRef = useRef(null);
    const [loggingOut, setLoggingOut] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [profileTransitioning, setProfileTransitioning] = useState(false);
    const [profileDirection, setProfileDirection] = useState(null);
    const profileTurnRef = useRef(null);

    const handleToggle = () => {
        setDirection(view === 'entry' ? 'forward' : 'backward');
        setTransitioning(true);
    };

    useEffect(() => {
        if (!transitioning) return;
        const target = turningPageRef.current;
        if (!target) return;
        const tl = gsap.timeline({
            onComplete: () => {
                setView(v => (v === 'entry' ? 'dashboard' : 'entry'));
                setTransitioning(false);
            }
        });
        tl.to(target, {
            rotateY: direction === 'forward' ? -180 : 180,
            duration: 0.6,
            ease: "power2.inOut",
        });
        return () => {
            tl.kill();
        };
    }, [transitioning, direction]);

    const underView = transitioning ? (view === 'entry' ? 'dashboard' : 'entry') : view;

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

    const handleLogoutClick = () => {
        setLoggingOut(true);
    };

    useEffect(() => {
        if (!loggingOut) return;
        const target = restLeftPageRef.current;
        if (!target) return;
        const tl = gsap.timeline({
            onComplete: () => {
                logout();
            }
        });
        tl.to(target, {
            rotateY: 180,
            duration: 0.6,
            ease: "power2.inOut",
        });
        return () => {
            tl.kill();
        };
    }, [loggingOut]);

    const handleOpenProfile = () => {
        setProfileDirection('opening');
        setProfileTransitioning(true);
    };

    const handleCloseProfile = () => {
        setProfileDirection('closing');
        setProfileTransitioning(true);
    };

    useEffect(() => {
        if (!profileTransitioning) return;
        const target = profileTurnRef.current;
        if (!target) return;
        const tl = gsap.timeline({
            onComplete: () => {
                if (profileDirection === 'opening') {
                    setShowProfile(true);
                } else {
                    setShowProfile(false);
                }
                setProfileTransitioning(false);
            }
        });
        tl.to(target, {
            rotateY: profileDirection === 'opening' ? 180 : -180,
            duration: 0.6,
            ease: "power2.inOut",
        });
        return () => {
            tl.kill();
        };
    }, [profileTransitioning, profileDirection]);

    const setLeftPageRefs = (el) => {
        restLeftPageRef.current = el;
        if (profileDirection === 'opening') {
            profileTurnRef.current = el;
        }
    };

    return (
        <div className="home-root">
            <button 
                className="profile-btn" 
                onClick={handleOpenProfile}
            >
                <FaUserCircle />
            </button>
            <button 
                className="logout-btn" 
                onClick={handleLogoutClick}
            >
                Logout</button>
            <button 
                className={`toggle-entry-btn ${view === 'dashboard' ? 'toggle-entry-btn-left' : ''}`}
                onClick={handleToggle}
                style={{ visibility: transitioning ? 'hidden' : 'visible' }}
            >
                    {view === 'entry' ? 'Journals' : 'Entry'}
            </button>
            <div className="home-container">
                <div className="profile-wrapper">
                    {(showProfile || (profileTransitioning && profileDirection === 'closing')) && (
                        <div className={profileTransitioning ? "profile-layer-top" : "profile-layer-solo"}>
                            <Profile ref={profileDirection === 'closing' ? profileTurnRef : null} onClose={handleCloseProfile} />
                        </div>
                    )}
                    <div className="profile-layer-under" style={{ visibility: showProfile && !profileTransitioning ? 'hidden' : 'visible' }}>
                        <div className="spread-wrapper">
                            {loggingOut && (
                                <div className="spread-layer-under">
                                    <AuthScreen />
                                </div>
                            )}
                            <div className="spread-layer-under">
                                {underView === 'entry' ? (
                                    <div className="entry-container">
                                        <div className="home-left-page" ref={setLeftPageRefs}>
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
                                    <Dashboard ref={setLeftPageRefs} />
                                )}
                            </div>
                            {transitioning && (
                                <div className="spread-layer-top">
                                    {view === 'entry' ? (
                                        <div className="entry-container">
                                            <div className="home-left-page">
                                                <div className="title-row">
                                                    <input
                                                        type="text"
                                                        placeholder="Title your thoughts..."
                                                        value={title}
                                                        readOnly
                                                    />
                                                </div>
                                                <div className="book-text-left">{leftText}</div>
                                            </div>
                                            <div className="home-right-page" ref={turningPageRef}>
                                                <div className="book-text-right">{rightText}</div>
                                                <button className="submit-btn">Submit</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Dashboard ref={setLeftPageRefs} />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}