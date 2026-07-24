import { useState } from "react";
import useAuthStore from "../store/authStore";

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const login = useAuthStore((state) => state.login);

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
            login(data.access_token);
        } catch (error) {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
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
    )
}

export function Signup() {
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
        <form onSubmit={handleSubmit}>
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
    )
}

export default function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    return (
        <div className="AuthScreen">
            {isLogin ? <Login /> : <Signup />}
            <button onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Don\'t have an account? Signup' : 'Already have an account? Login'}
            </button>
        </div>
    )
}