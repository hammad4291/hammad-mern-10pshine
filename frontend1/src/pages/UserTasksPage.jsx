import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyTasks, fetchCategories } from '../features/tasks/services/taskApi';
import TaskDetailsModal from '../components/TaskDetailsModal';
import '../styles/tasksPage.css'; // Dedicated stylesheet for the tasks listing page

// Ensure the explicit function naming rule matches your AppRoutes import path!
export default function UserTasksPage() {
    const [tasks, setTasks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const decoded = JSON.parse(atob(base64));
                const userId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decoded.nameid;
                if (userId) setCurrentUserId(parseInt(userId, 10));
            }
        } catch (e) {
            console.error("Token decode error:", e);
        }
    }, []);

    const loadPageData = async () => {
        try {
            setLoading(true);
            const [tasksRes, catsRes] = await Promise.all([fetchMyTasks(), fetchCategories()]);
            setTasks((tasksRes.data || []).filter(t => !t.isDeleted));
            setCategories(catsRes.data || []);
            setError(''); // Clear out any connection recovery errors
        } catch (err) {
            setError('Failed to load active workspace tasks listing matrix.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadPageData(); }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); 
    };

    const filteredTasks = tasks.filter(task => {
        const title = (task.title || '').toLowerCase();
        const catName = (task.category?.name || 'General').toLowerCase();
        const status = (task.status || '').toLowerCase();
        const priority = (task.priority || '').toLowerCase();
        const query = searchQuery.toLowerCase();

        const matchesQuery = title.includes(query) || 
                             catName.includes(query) || 
                             status.includes(query) || 
                             priority.includes(query);

        const matchesStatus = !statusFilter || status === statusFilter.toLowerCase();
        const matchesPriority = !priorityFilter || priority === priorityFilter.toLowerCase();
        const matchesCategory = !categoryFilter || String(task.categoryId) === String(categoryFilter);

        return matchesQuery && matchesStatus && matchesPriority && matchesCategory;
    });

    if (loading) return <div className="tasks-page-status">Loading tasks panel...</div>;
    
    // Custom fallback layout view if your backend server is offline
    if (error) {
        return (
            <div className="tasks-page-status tasks-error">
                <p>{error}</p>
                <button className="tasks-create-btn" onClick={loadPageData} style={{marginTop: '10px'}}>
                    🔄 Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="tasks-page-wrapper">
            <header className="tasks-page-header">
                <div className="header-text-block">
                    <h1 className="tasks-main-title">Tasks</h1>
                    <p className="tasks-main-subtitle">Browse, filter, and manage your tasks.</p>
                </div>
                <Link to="/tasks/new" className="tasks-create-btn">
                    <span>+</span> New task
                </Link>
            </header>

            <div className="tasks-filter-bar">
                <div className="search-input-container">
                    <span className="search-icon">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search tasks..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="tasks-search-input"
                    />
                </div>

                <div className="dropdowns-filter-group">
                    <select 
                        value={categoryFilter} 
                        onChange={(e) => setCategoryFilter(e.target.value)} 
                        className="tasks-filter-select"
                    >
                        <option value="">All categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)} 
                        className="tasks-filter-select"
                    >
                        <option value="">All statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="InProgress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>

                    <select 
                        value={priorityFilter} 
                        onChange={(e) => setPriorityFilter(e.target.value)} 
                        className="tasks-filter-select"
                    >
                        <option value="">All priorities</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>
            </div>

            <div className="tasks-list-container">
                {filteredTasks.length === 0 ? (
                    <div className="tasks-empty-state">No matching tasks found matching your filter options.</div>
                ) : (
                    filteredTasks.map(task => (
                        <div 
                            key={task.id} 
                            className="task-row-card" 
                            onClick={() => setSelectedTask(task)}
                        >
                            <div className="task-row-meta">
                                <h3 className="task-row-title">{task.title}</h3>
                                <p className="task-row-subtext">
                                    {task.category?.name || 'General'} • Due {formatDate(task.dueDate)}
                                </p>
                            </div>
                            <div className="task-row-badges" onClick={(e) => e.stopPropagation()}>
                                <span className={`task-badge prio-${String(task.priority).toLowerCase()}`}>
                                    {task.priority}
                                </span>
                                <span className={`task-badge stat-${String(task.status).toLowerCase()}`}>
                                    {task.status === 'InProgress' ? 'In progress' : task.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <TaskDetailsModal 
                task={selectedTask}
                currentUserId={currentUserId}
                onClose={() => setSelectedTask(null)}
                onDeleteSuccess={loadPageData}
            />
        </div>
    );
}