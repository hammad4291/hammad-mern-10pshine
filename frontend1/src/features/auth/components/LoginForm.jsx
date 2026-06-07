import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../api/axios';
import { loginUser } from '../services/authApi';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // 🚀 Call your exported service function directly
            const response = await loginUser(email, password);
            const { accessToken, refreshToken, role, username } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('userRole', role);
            localStorage.setItem('username', username);
            localStorage.setItem('userEmail', email);

            if (role === 'Admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data || 'Invalid credentials.');
        }
    };
    return (
        <form onSubmit={handleSubmit} className="auth-form">
            {error && <div style={{ color: 'red', fontSize: '14px', marginBottom: '8px' }}>{error}</div>}
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
            <button type="submit" className="submit-btn">Sign in</button>
        </form>
    );
}