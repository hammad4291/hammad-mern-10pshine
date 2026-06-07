import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfileName } from '../features/profile/services/profileApi'; // Adjust this path to match your folder structure
import '../styles/profilePage.css';

export default function ProfilePage() {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('User');
    const [submitting, setSubmitting] = useState(false);

    // Load initial info directly from localStorage on component mount
    useEffect(() => {
        setFullName(localStorage.getItem('username') || '');
        setEmail(localStorage.getItem('userEmail') || '');
        setRole(localStorage.getItem('userRole') || 'User');
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!fullName.trim()) {
            alert('Full name cannot be empty.');
            return;
        }

        try {
            setSubmitting(true);
            
            // 🚀 Utilizing your imported API service function
            await updateProfileName(fullName.trim());
            
            alert('Profile updated successfully.');
            
            // Triggers storage events across components if needed
            window.dispatchEvent(new Event('storage'));
        } catch (err) {
            console.error(err);
            alert(err.response?.data || 'Failed to update profile name.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogOut = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="profile-view-container">
            <header className="profile-header-section">
                <h1 className="profile-main-title">Profile</h1>
                <p className="profile-sub-title">Manage your account information.</p>
            </header>

            <div className="profile-card-layout">
                {/* User Info Header Group */}
                <div className="profile-user-row">
                    <div className="profile-avatar-box">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#008080" className="avatar-svg-icon">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                    </div>
                    <div className="profile-meta-details">
                        <h2 className="meta-name-display">{fullName || 'User Account'}</h2>
                        <p className="meta-email-display">{email}</p>
                        <span className="meta-badge-pill">
                            <svg className="badge-shield-icon" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944a11.954 11.954 0 007.834 3.056 12.012 12.012 0 01-1.183 7.35 11.967 11.967 0 01-5.353 5.393L10 18.228l-1.298-.529a11.967 11.967 0 01-5.353-5.393 12.01 12.01 0 01-1.183-7.35zm9.647 3.513a1 1 0 00-1.626-1.164L8.25 9.814l-1.025-1.025a1 1 0 10-1.414 1.414l1.75 1.75a1 1 0 001.52-.112l2.732-3.33z" clipRule="evenodd" />
                            </svg>
                            {role === 'Admin' ? 'Admin user' : 'Regular user'}
                        </span>
                    </div>
                </div>

                {/* Profile Form Details */}
                <form onSubmit={handleSave} className="profile-form-grid">
                    <div className="profile-field-group">
                        <label className="profile-field-label">Full name</label>
                        <input 
                            type="text" 
                            value={fullName} 
                            onChange={(e) => setFullName(e.target.value)}
                            className="profile-input-field" 
                            required 
                        />
                    </div>

                    <div className="profile-field-group">
                        <label className="profile-field-label">Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            className="profile-input-field field-read-only" 
                            disabled 
                        />
                    </div>

                    <div className="profile-field-group">
                        <label className="profile-field-label">Role</label>
                        <input 
                            type="text" 
                            value={role} 
                            className="profile-input-field field-read-only" 
                            disabled 
                        />
                    </div>

                    <div className="profile-action-buttons">
                        <button type="submit" disabled={submitting} className="profile-save-btn">
                            {submitting ? 'Saving changes...' : 'Save changes'}
                        </button>
                        <button type="button" onClick={handleLogOut} className="profile-logout-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="logout-icon-svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                            </svg>
                            Log out
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}