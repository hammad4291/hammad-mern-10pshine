import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyTasks } from '../features/tasks/services/taskApi';
import TaskDetailsModal from '../components/TaskDetailsModal';
import '../styles/dashboard.css';

export default function DashboardPage() {
    const username = localStorage.getItem('username') || 'Muhammad';
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);

    const [metrics, setMetrics] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });

    useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
                );
                const decoded = JSON.parse(jsonPayload);
                const userId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decoded.nameid;
                if (userId) setCurrentUserId(parseInt(userId, 10));
            }
        } catch (e) {
            console.error("Failed to parse identity layout:", e);
        }
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetchMyTasks();
            const taskData = (response.data || []).filter(t => !t.isDeleted);
            setTasks(taskData);
            
            setMetrics({
                total: taskData.length,
                pending: taskData.filter(t => String(t.status).toLowerCase() === 'pending' || String(t.status).toLowerCase() === '0').length,
                inProgress: taskData.filter(t => String(t.status).toLowerCase() === 'inprogress' || String(t.status).toLowerCase() === '1').length,
                completed: taskData.filter(t => String(t.status).toLowerCase() === 'completed' || String(t.status).toLowerCase() === '2').length
            });
        } catch (err) {
            setError('Failed to fetch metrics summary logs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadDashboardData(); }, []);

    if (loading) return <div className="dashboard-status-msg">Loading Workspace Metrics...</div>;
    if (error) return <div className="dashboard-status-msg error-text">{error}</div>;

    const recentTasks = tasks
        .filter(t => String(t.status).toLowerCase() !== 'completed' && String(t.status).toLowerCase() !== '2')
        .slice(-3).reverse();

    return (
        <div className="dashboard-content-wrapper">
            <header className="dashboard-welcome-header">
                <h1 className="welcome-title">Welcome back, {username.split(' ')[0]}</h1>
                <p className="welcome-subtitle">Here’s an overview of your tasks.</p>
            </header>

            <section className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon-box total-bg">📋</div>
                    <div className="metric-info"><span className="metric-number">{metrics.total}</span><span className="metric-label">Total tasks</span></div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon-box pending-bg">🕒</div>
                    <div className="metric-info"><span className="metric-number">{metrics.pending}</span><span className="metric-label">Pending</span></div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon-box progress-bg">↻</div>
                    <div className="metric-info"><span className="metric-number">{metrics.inProgress}</span><span className="metric-label">In progress</span></div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon-box completed-bg">✓</div>
                    <div className="metric-info"><span className="metric-number">{metrics.completed}</span><span className="metric-label">Completed</span></div>
                </div>
            </section>

            <section className="tasks-feed-section">
                <div className="section-feed-header">
                    <h2 className="feed-title">Recent tasks</h2>
                    <Link to="/tasks" className="view-all-link">View all <span className="arrow-span">→</span></Link>
                </div>
                <div className="tasks-list-stack">
                    {recentTasks.length === 0 ? (
                        <div className="empty-tasks-fallback">Great work! No pending tasks.</div>
                    ) : (
                        recentTasks.map(task => (
                            <div key={task.id} className="task-item-row-card clickable-task-card" onClick={() => setSelectedTask(task)}>
                                <div className="task-main-details">
                                    <div className="task-title-group">
                                        <h4 className="task-item-title">{task.title}</h4>
                                        <span className="task-item-category">{task.category?.name || 'General'}</span>
                                    </div>
                                </div>
                                <div className="task-badges-container" onClick={(e) => e.stopPropagation()}>
                                    <span className={`badge-pill priority-${String(task.priority).toLowerCase()}`}>{task.priority}</span>
                                    <span className={`badge-pill status-${String(task.status).toLowerCase() === 'inprogress' ? 'inprogress' : 'pending'}`}>
                                        {String(task.status).toLowerCase() === 'inprogress' ? 'In progress' : 'Pending'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            <TaskDetailsModal 
                task={selectedTask}
                currentUserId={currentUserId}
                onClose={() => setSelectedTask(null)}
                onDeleteSuccess={loadDashboardData}
            />
        </div>
    );
}