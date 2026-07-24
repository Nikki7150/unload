import { useState } from 'react'
import './App.css'
import AuthScreen from './pages/AuthScreen'
import Entry from './pages/Entry'
import useAuthStore from './store/authStore'

function App() {
  const token = useAuthStore((state) => state.token);
  return (
    <div className="App">
      {token ? <Entry /> : <AuthScreen />}
    </div>
  )
}

export default App
