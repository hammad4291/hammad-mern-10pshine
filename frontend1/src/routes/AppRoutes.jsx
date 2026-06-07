import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import EditTaskPage from '../pages/EditTaskPage';
import NewTaskPage from '../pages/NewTaskPage';
import UserTasksPage from '../pages/UserTasksPage'; // Explicitly named for standard user profiles
import DashboardLayout from '../layouts/DashboardLayout';
import ProfilePage from '../pages/ProfilePage';
import AdminTasksPage from '../pages/AdminTasksPage'; // Future Admin target route placeholder

const RoleProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('userRole');

    if (!token) return <Navigate to="/login" replace />;
    
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to={role === 'Admin' ? "/admin/dashboard" : "/dashboard"} replace />;
    }

    return (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    );
};

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route element={<RoleProtectedRoute allowedRoles={['User']} />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/tasks" element={<UserTasksPage />} />
            </Route>

            <Route element={<RoleProtectedRoute allowedRoles={['User', 'Admin']} />}>
                <Route path="/tasks/new" element={<NewTaskPage />} />
                <Route path="/tasks/edit/:id" element={<EditTaskPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route element={<RoleProtectedRoute allowedRoles={['Admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/tasks" element={<AdminTasksPage />} /> {/* Future Admin target route placeholder */}
                {/* Future Admin target route could look like: 
                <Route path="/admin/tasks" element={<AdminTasksPage />} /> */}
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}