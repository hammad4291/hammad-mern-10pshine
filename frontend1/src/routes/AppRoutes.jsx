import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';

// Simple temporary placeholders for your other screens
const DashboardPlaceholder = () => <div style={{ padding: '20px' }}><h2>Dashboard (Protected Route)</h2></div>;

// 🛡️ Route Guard: Redirects users back to login if they lack a token
const ProtectedRoute = () => {
    const isAuthenticated = !!localStorage.getItem('accessToken'); // Checks if token exists
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default function AppRoutes() {
    return (
        <Routes>
            {/* 🔓 Public Entry Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Default fallback redirects home or login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* 🛡️ Guarded Dashboard Routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPlaceholder />} />
                {/* Add your tasks, profile, and admin routes here later */}
            </Route>

            {/* 404 Page Not Found Catch */}
            <Route path="*" element={<div style={{ padding: '20px' }}><h2>404 Page Not Found</h2></div>} />
        </Routes>
    );
}