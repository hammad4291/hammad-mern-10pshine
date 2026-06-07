import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchAssignableUsers, updateTask, fetchMyTasks, fetchCategories } from '../features/tasks/services/taskApi';
import '../styles/editTask.css';

export default function EditTaskPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [role, setRole] = useState('User');
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]); // Dynamic categories tracking state container
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'Pending',
        priority: 'Medium',
        dueDate: '',
        categoryId: '',
        assignedToUserId: ''
    });

    useEffect(() => {
        const cachedRole = localStorage.getItem('userRole') || 'User';
        setRole(cachedRole);

        const buildTaskForm = async () => {
            try {
                setLoading(true);

                // 1. Fetch categories from the new dynamic backend lookup route
                const categoriesResponse = await fetchCategories();
                setCategories(categoriesResponse.data || []);
                console.log ("Fetched categories for dropdown:", categoriesResponse.data); // Debug log for category data structure

                // 2. Fetch system users via custom API endpoint if Admin role matches
                if (cachedRole === 'Admin') {
                    const usersResponse = await fetchAssignableUsers();
                    setUsers(usersResponse.data || []);
                }

                let targetedTask = null;

                // 3. Check if the task payload state was passed along with Link routing
                if (location.state?.task && location.state.task.id === parseInt(id, 10)) {
                    targetedTask = location.state.task;
                } else {
                    // Fallback matching query to fetch all tasks if page was directly refreshed
                    const tasksResponse = await fetchMyTasks();
                    targetedTask = (tasksResponse.data || []).find(t => t.id === parseInt(id, 10));
                }

                if (!targetedTask) {
                    setError('Requested task entry was not found in active data logs.');
                    return;
                }

                const cleanDate = targetedTask.dueDate ? targetedTask.dueDate.split('T')[0] : '';

                setFormData({
                    title: targetedTask.title || '',
                    description: targetedTask.description || '',
                    status: targetedTask.status || 'Pending',
                    priority: targetedTask.priority || 'Medium',
                    dueDate: cleanDate,
                    categoryId: targetedTask.categoryId || '',
                    assignedToUserId: targetedTask.assignedToUserId || ''
                });

            } catch (err) {
                console.error("Initialization errors:", err);
                setError('Failed to download required task information parameters.');
            } finally {
                setLoading(false);
            }
        };

        buildTaskForm();
    }, [id, location.state]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'categoryId' || name === 'assignedToUserId' ? (value ? parseInt(value, 10) : '') : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);

            const payload = {
                title: formData.title,
                description: formData.description,
                status: formData.status,
                priority: formData.priority,
                dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
                categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : null,
                assignedToUserId: role === 'Admin' && formData.assignedToUserId ? parseInt(formData.assignedToUserId, 10) : null
            };

            await updateTask(id, payload);
            alert('Task updated successfully.');
            navigate(role === 'Admin' ? '/admin/dashboard' : '/dashboard');
        } catch (err) {
            console.error(err);
            alert('Failed to execute task update action logs securely.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="edit-status-msg">Loading component configurations...</div>;
    if (error) return <div className="edit-status-msg error-text">{error}</div>;

    return (
        <div className="edit-task-view-container">
            <div className="edit-task-card-frame">
                <button type="button" className="back-nav-link" onClick={() => navigate(-1)}>
                    ← Back to tasks
                </button>
                
                <h2 className="edit-view-heading">Edit task</h2>
                
                <form onSubmit={handleSubmit} className="edit-task-form-layout">
                    <div className="form-input-wrapper full-width-span">
                        <label className="input-field-label">Title</label>
                        <input 
                            type="text" 
                            name="title"
                            value={formData.title} 
                            onChange={handleInputChange}
                            className="form-text-input" 
                            required 
                        />
                    </div>

                    <div className="form-input-wrapper full-width-span">
                        <label className="input-field-label">Description</label>
                        <textarea 
                            name="description"
                            value={formData.description} 
                            onChange={handleInputChange}
                            className="form-textarea-input" 
                            rows="4"
                        />
                    </div>

                    <div className="form-input-wrapper">
                        <label className="input-field-label">Status</label>
                        <select name="status" value={formData.status} onChange={handleInputChange} className="form-select-dropdown">
                            <option value="Pending">Pending</option>
                            <option value="InProgress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div className="form-input-wrapper">
                        <label className="input-field-label">Priority</label>
                        <select name="priority" value={formData.priority} onChange={handleInputChange} className="form-select-dropdown">
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>

                    {/* DYNAMIC CATEGORY RENDER DROPDOWN BLOCK */}
                    <div className="form-input-wrapper">
                        <label className="input-field-label">Category</label>
                        <select 
                            name="categoryId" 
                            value={formData.categoryId} 
                            onChange={handleInputChange} 
                            className="form-select-dropdown" 
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-input-wrapper">
                        <label className="input-field-label">Due date</label>
                        <input 
                            type="date" 
                            name="dueDate"
                            value={formData.dueDate} 
                            onChange={handleInputChange}
                            className="form-text-input date-picker-input" 
                            required
                        />
                    </div>

                    {role === 'Admin' && (
                        <div className="form-input-wrapper full-width-span admin-select-highlight">
                            <label className="input-field-label">Assigned To User</label>
                            <select 
                                name="assignedToUserId" 
                                value={formData.assignedToUserId} 
                                onChange={handleInputChange} 
                                className="form-select-dropdown"
                                required
                            >
                                <option value="">Select target user assignee</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="form-actions-footer-row full-width-span">
                        <button type="submit" disabled={submitting} className="action-save-btn">
                            {submitting ? 'Saving items...' : 'Save changes'}
                        </button>
                        <button type="button" className="action-cancel-btn" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}