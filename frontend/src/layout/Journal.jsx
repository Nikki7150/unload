import { useState } from 'react'
import './Journal.css'
import AuthScreen from '../pages/AuthScreen'
import Home from '../pages/Home'
import useAuthStore from '../store/authStore'

function Journal() {
    const token = useAuthStore((state) => state.token);
    return (
        <div className="journal-container">
            <div className="journal-cover">
                <div className="journal">
                    {token ? <Home /> : <AuthScreen />}
                </div>
            </div>
        </div>
    )
}

export default Journal
