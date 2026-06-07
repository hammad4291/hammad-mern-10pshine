import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyTasks, fetchCategories } from '../features/tasks/services/taskApi'; // Hits your unified generic API endpoint
import API from '../api/axios'; // Direct import of your standardized API utility for custom endpoint calls
import TaskDetailsModal from '../components/TaskDetailsModal';
import '../styles/tasksPage.css';

export default function AdminTasksPage() {
    const [tasks, setTasks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [assignableUsers, setAssignableUsers] = useState([]); // 🚀 Added state for team directory
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [userFilter, setUserFilter] = useState(''); // 🚀 Added state for targeted user filter dropdown

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
            
            // 🚀 Concurrent load including your existing 'assignable-users' lookup service endpoint
            const [tasksRes, catsRes, usersRes] = await Promise.all([
                fetchMyTasks(), 
                fetchCategories(),
                API.get('/tasks/assignable-users')
            ]);
            
            setTasks((tasksRes.data || []).filter(t => !t.isDeleted));
            setCategories(catsRes.data || []);
            setAssignableUsers(usersRes.data || []);
            setError('');
        } catch (err) {
            setError('Failed to load administrator control task listing matrix.');
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
        const assignedUser = (task.assignedToUser?.username || 'Unassigned').toLowerCase(); // 🚀 Target name mapping
        const query = searchQuery.toLowerCase();

        // 🚀 Enhanced Search Criteria: Includes searching by the assigned user's name string
        const matchesQuery = title.includes(query) || 
                             catName.includes(query) || 
                             status.includes(query) || 
                             priority.includes(query) ||
                             assignedUser.includes(query);

        const matchesStatus = !statusFilter || status === statusFilter.toLowerCase();
        const matchesPriority = !priorityFilter || priority === priorityFilter.toLowerCase();
        const matchesCategory = !categoryFilter || String(task.categoryId) === String(categoryFilter);
        
        // 🚀 Dropdown Filter Logic: Isolate by specific explicit Assignee User ID
        const matchesUser = !userFilter || String(task.assignedToUserId) === String(userFilter);

        return matchesQuery && matchesStatus && matchesPriority && matchesCategory && matchesUser;
    });

    if (loading) return <div className="tasks-page-status">Loading Admin Tasks Dashboard...</div>;
    
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
                    <h1 className="tasks-main-title">Tasks Control</h1>
                    <p className="tasks-main-subtitle">Monitor, audit, and filter team assignments from a centralized matrix.</p>
                </div>
                <Link to="/tasks/new" className="tasks-create-btn">
                    <span>+</span> Create Task
                </Link>
            </header>

            {/* Filter controls layer group */}
            <div className="tasks-filter-bar" style={{ gap: '16px' }}>
                <div className="search-input-container" style={{ flex: '1' }}>
                    <span className="search-icon">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search by task, category, or assigned user..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="tasks-search-input"
                    />
                </div>

                <div className="dropdowns-filter-group" style={{ display: 'flex', wrap: 'wrap', gap: '8px' }}>
                    {/* 🚀 New Assignee Directory Dropdown */}
                    <select 
                        value={userFilter} 
                        onChange={(e) => setUserFilter(e.target.value)} 
                        className="tasks-filter-select"
                        style={{ borderColor: '#008080', fontWeight: '600' }}
                    >
                        <option value="">All Assignees</option>
                        {assignableUsers.map(user => (
                            <option key={user.id} value={user.id}>{user.username}</option>
                        ))}
                    </select>

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

            {/* Managed Tasks Payload Display Data Table */}
            <div className="tasks-list-container">
                {filteredTasks.length === 0 ? (
                    <div className="tasks-empty-state">No delegated tasks found matching your administrative filter parameters.</div>
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
                                    {task.category?.name || 'General'} • Due {formatDate(task.dueDate)} • Assigned to: <strong style={{ color: '#0f172a' }}>{task.assignedToUser?.username || 'Unassigned'}</strong>
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