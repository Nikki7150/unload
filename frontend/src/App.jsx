// The brain of your frontend.

// App.jsx
// This is the brain.
// Responsibilities:
// Holds authentication state
// Checks token on load
// Decides what to render
// Handles logout
// Passes auth success handler to Signup/Login
// It should NOT:
// Contain journal UI
// Contain write form
// Contain layout logic
// App is the controller.

import { useState } from "react"

function Signup({ onAuthSuccess, switchToLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSignup = async (e) => {
    e.preventDefault()

    // 1️⃣ Signup
    const signupResponse = await fetch("http://127.0.0.1:8000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })

    if (!signupResponse.ok) {
      alert("Signup failed")
      return
    }

    // 2️⃣ Auto login
    const loginResponse = await fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        username: email,
        password: password
      })
    })

    const loginData = await loginResponse.json()

    if (loginResponse.ok) {
      onAuthSuccess(loginData.access_token)
    } else {
      alert("Auto login failed")
    }
  }

  return (
    <div>
      <h2>Sign Up</h2>

      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Sign Up</button>
      </form>

      <p>
        Already have an account?{" "}
        <button onClick={switchToLogin}>Login</button>
      </p>
    </div>
  )
}

export default Signup

// On load:
// Check sessionStorage.getItem("token")
// If exists → go to "app"
// If not → go to "signup"
// UI rendering:
// If mode === "signup" → render <Signup />
// If mode === "login" → render <Login />
// If mode === "app" → render your journals + write UI

// A state like isAuthenticated
// A function like handleAuthSuccess(token)
// When App loads, we must check:
// const token = sessionStorage.getItem("token")
// If token exists → setIsAuthenticated(true)
// If not → show signup/login screen

// State:
// isAuthenticated
// authMode ("signup" or "login")
// useEffect on mount:
// check for token
// update isAuthenticated

// Conditional render:
// If not authenticated:
// If authMode === "signup" → render Signup
// Else → render Login
// If authenticated:
// Render main app (journals + write)