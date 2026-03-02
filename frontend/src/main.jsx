import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// This is the entry point of your React app.
// Finds the #root div in index.html
// Injects <App /> into it
// Boots the entire React application