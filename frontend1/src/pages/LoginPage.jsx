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

                </div>
            </div>
        </div>
    );
}