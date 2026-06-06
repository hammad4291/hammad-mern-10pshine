import { useState } from 'react';
import LoginForm from '../features/auth/components/LoginForm';
import RegisterForm from '../features/auth/components/RegisterForm';
import '../styles/authPage.css';

export default function LoginPage() {
    const [isSignUp, setIsSignUp] = useState(false);

    return (
        <div className="auth-container">
            {/* Left Column: Branding Panel */}
            <div className="auth-sidebar">
                <div className="sidebar-top">
                    <div className="brand-logo">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="24" height="24" rx="6" fill="#00a3a4"/>
                            <path d="M17 9L10 16L7 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <span className="brand-name">TaskFlow</span>
                </div>
                
                <div className="sidebar-center">
                    <h1>Plan, assign, and ship work with clarity.</h1>
                    <p>Track tasks by status and priority, assign work to your team, and get an admin overview of everything in one place.</p>
                </div>

                <div className="sidebar-footer">
                    Roles • Priorities • Categories • Due dates
                </div>
            </div>

            {/* Right Column: Interaction Form Panel */}
            <div className="auth-content">
                <div className="form-box">
                    <h2>{isSignUp ? 'Create account' : 'Sign in'}</h2>
                    <p className="form-subtitle">
                        {isSignUp ? 'Sign up to start managing tasks.' : 'Enter your credentials to access your dashboard.'}
                    </p>

                    {/* Toggle Navigation Segment Control */}
                    <div className="segment-control">
                        <button 
                            className={`segment-btn ${!isSignUp ? 'active' : ''}`} 
                            onClick={() => setIsSignUp(false)}
                        >
                            Log in
                        </button>
                        <button 
                            className={`segment-btn ${isSignUp ? 'active' : ''}`} 
                            onClick={() => setIsSignUp(true)}
                        >
                            Sign up
                        </button>
                    </div>

                    {/* Conditional Component Rendering */}
                    {isSignUp ? <RegisterForm /> : <LoginForm />}

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <button className="google-btn">
                        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.91c1.7-1.56 2.69-3.86 2.69-6.62Z" fill="#4285F4"/>
                            <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.8.54-1.83.86-3.05.86-2.34 0-4.33-1.58-5.03-3.7H.95v2.33A9 9 0 0 0 9 18Z" fill="#34A853"/>
                            <path d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.95a9 9 0 0 0 0 8.1l3.02-2.33Z" fill="#FBBC05"/>
                            <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15.02 2A9 9 0 0 0 .95 4.95l3.02 2.33c.7-2.12 2.69-3.7 5.03-3.7Z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                    </button>
                </div>
            </div>
        </div>
    );
}