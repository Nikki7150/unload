import { useState, useEffect, useRef, forwardRef } from "react";
import useAuthStore from "../store/authStore";
import "../styles/Profile.css";

const Profile = forwardRef(function Profile(props, pageRef) {
    const token = useAuthStore((state) => state.token);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/users/me', {
                    method: 'GET',
                    headers: {'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) {
                    throw new Error('Failed to load profile');
                }
                const data = await response.json();
                setProfile(data);
            } catch (err) {
                setError("Something went wrong loading your profile. Please try again later.");
            }
        };
        fetchProfile();
    }, []);

    return (
        <div className="profile-screen">
            <div className="profile-left-page">
                <div className="stickers">
                    <div className="sticker"> sticker 1</div>
                    <div className="sticker"> sticker 2</div>
                    <div className="sticker"> sticker 3</div>
                </div>
            </div>
            <div className="profile-right-page" ref={pageRef}>
                {!profile && !error && <p>Loading profile...</p>}
                {profile && (
                    <div className="profile-info">
                        <h1 className="profile-title">{profile.username}'s Journal</h1>
                        <p className="profile-email">{profile.email}</p>
                        <p className="profile-created-at">Journal Started: {new Date(profile.created_at).toLocaleDateString()}</p>
                    </div>
                )}
            </div>
        </div>
    );
});
export default Profile;