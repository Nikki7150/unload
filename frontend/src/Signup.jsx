// User fills signup form
// Frontend sends POST /signup
// If success → immediately send POST /login with same credentials
// Receive token
// Store token in sessionStorage
// Switch app mode to "app"
// User sees journals
// No extra login step.

// Signup.jsx
// Collect email + password
// Call /signup
// Auto call /login
// Store token
// Call onAuthSuccess(token)
// No global logic here.
// Just auth logic.