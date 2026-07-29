import { useState, useRef, useEffect, forwardRef } from "react";
import useAuthStore from "../store/authStore";
import "../styles/AuthScreen.css";
import gsap from "gsap";
import Home from "./Home";

export const Login = forwardRef(function Login({ onAuthSuccess }, rightPageRef) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch('http://127.0.0.1:8000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) {
                throw new Error('Login failed');
            }
            const data = await response.json();
            onAuthSuccess(data.access_token);
        } catch (error) {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="login-screen">
            <div className="left-page">
                <div className="welcome-message">
                    <h1>Welcome Back!</h1>
                    <p>Login to continue</p>
                </div>
            </div>
            <div className="right-page" ref={rightPageRef}>
                <div className="login-form-container">
                    <h1>Login</h1>
                    <form className="login-form" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                        {error && <p>{error}</p>}
                        <button type="submit">Login</button>
                    </form>
                </div>
            </div>
        </div>
    )
})

export const Signup = forwardRef(function Signup({ onAuthSuccess }, rightPageRef) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState(null);
    const login = useAuthStore((state) => state.login);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const signupResponse = await fetch('http://127.0.0.1:8000/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, username }),
            });
            if (!signupResponse.ok) {
                throw new Error('Signup failed');
            }
            const loginResponse = await fetch('http://127.0.0.1:8000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!loginResponse.ok) {
                throw new Error('Login after signup failed');
            }
            const data = await loginResponse.json();
            login(data.access_token);
        } catch (error) {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="signup-screen">
            <div className="left-page">
                <div className="welcome-message">
                    <h1>Welcome!</h1>
                    <p>Create an account to get started</p>
                </div>
            </div>
            <div className="right-page" ref={rightPageRef}>
                <div className="signup-form-container">
                    <h1>Signup</h1>
                    <form className="signup-form" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                        />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            required
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                        {error && <p>{error}</p>}
                        <button type="submit">Signup</button>
                    </form>
                </div>
            </div>
        </div>
    )
})

export default function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [loggingIn, setLoggingIn] = useState(false);
    const [pendingToken, setPendingToken] = useState(null);
    const restRightPageRef = useRef(null);
    const login = useAuthStore((state) => state.login);

    const handleAuthSuccess = (token) => {
        setPendingToken(token);
        setLoggingIn(true);
    };

    useEffect(() => {
        if (!loggingIn) return;
        const target = restRightPageRef.current;
        if (!target) return;
        const tl = gsap.timeline({
            onComplete: () => {
                login(pendingToken);
            }
        });
        tl.to(target, { 
            duration: 0.5, 
            rotateY: -180, 
            ease: "power2.inOut" 
        });
        return () => {
            tl.kill();
        };
    }, [loggingIn]);

    return (
        <div className="spread-wrapper">
            {loggingIn && (
                <div className="spread-layer-under">
                    <Home />
                </div>
            )}
            <div className="spread-layer-under">
                <div className="AuthScreen">
                    {isLogin ? (
                        <Login ref={restRightPageRef} onAuthSuccess={handleAuthSuccess} />
                    ) : (
                        <Signup ref={restRightPageRef} onAuthSuccess={handleAuthSuccess} />
                    )}
                    <button className="toggle-auth-button" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? "Don't have an account? Signup" : "Already have an account? Login"}
                    </button>
                </div>
            </div>
        </div>
    )
}