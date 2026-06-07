import { useState } from 'react';
import API from '../../../api/axios';
import { registerUser } from '../services/authApi';
export default function RegisterForm() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState({ text: '', isError: false });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', isError: false });
        try {
            await registerUser(username, email, password);
            setMessage({ text: 'Registration successful! You can now log in.', isError: false });
            setUsername('');
            setEmail('');
            setPassword('');
        } catch (err) {
            setMessage({ text: err.response?.data || 'Registration failed.', isError: true });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            {message.text && (
                <div style={{ color: message.isError ? 'red' : 'green', fontSize: '14px', marginBottom: '8px' }}>
                    {message.text}
                </div>
            )}
            <div className="input-group">
                <label>Username</label>
                <input type="text" placeholder="janedoe" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="input-group">
                <label>Email</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group password-group">
                <label>Password</label>
                <div className="password-wrapper">
                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? '👁️' : '🔒'}
                    </button>
                </div>
            </div>
            <button type="submit" className="submit-btn">Create account</button>
        </form>
    );
}