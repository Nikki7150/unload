import { useState } from 'react'
import './App.css'
import AuthScreen from './pages/AuthScreen'
import Home from './pages/Home'
import useAuthStore from './store/authStore'

function App() {
  const token = useAuthStore((state) => state.token);
  return (
    <div className="App">
      {token ? <Home /> : <AuthScreen />}
    </div>
  )
}

export default App
