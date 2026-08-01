import { useState, useEffect, useRef, forwardRef } from "react";
import useAuthStore from "../store/authStore";
import "../styles/Profile.css";
import { authFetch } from '../utils/authFetch';

const Profile = forwardRef(function Profile(props, pageRef) {
    const token = useAuthStore((state) => state.token);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const [profilePicture, setProfilePicture] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await authFetch('http://127.0.0.1:8000/users/me', {
                    method: 'GET',
                    headers: {'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) {
                    throw new Error('Failed to load profile');
                }
                const data = await response.json();
                setProfile(data);
                setProfilePicture(data.profile_picture_url);
            } catch (err) {
                setError("Something went wrong loading your profile. Please try again later.");
            }
        };
        fetchProfile();
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await authFetch('http://127.0.0.1:8000/users/me/profile-picture', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });
            if (!response.ok) throw new Error('Upload failed');
            const data = await response.json();
            setProfilePicture(data.profile_picture_url);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="profile-screen">
            <div className="profile-left-page"></div>
            <div className="profile-right-page" ref={pageRef}>
                {!profile && !error && <p>Loading profile...</p>}
                {profile && (
                    <div className="profile-info">
                        <div className="profile-picture">
                            <input type="file" accept="image/*" className="upload-input" style={{ display: 'none' }} onChange={handleFileChange} />
                            {profilePicture ? (
                                <img 
                                    src={`http://127.0.1:8000${profilePicture}`} 
                                    alt="Profile" 
                                    className="profile-image"
                                    onClick={() => document.querySelector('.upload-input').click()}
                                />
                            ) : (
                                <p className="upload-prompt" onClick={() => document.querySelector('.upload-input').click()}>+</p>
                            )}
                        </div>
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