import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCategories, fetchAssignableUsers, createTask } from '../features/tasks/services/taskApi';
import '../styles/editTask.css'; // Utilizing existing form design framework structures

export default function NewTaskPage() {
    const navigate = useNavigate();
    
    const [role, setRole] = useState('User');
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
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

        const initFormRequirements = async () => {
            try {
                setLoading(true);

                // 1. Fetch categories dynamically via central endpoint 
                const catResponse = await fetchCategories();
                setCategories(catResponse.data || []);

                // 2. Fetch assignable users if active user holds Admin authorization credentials
                if (cachedRole === 'Admin') {
                    const usersResponse = await fetchAssignableUsers();
                    setUsers(usersResponse.data || []);
                }
            } catch (err) {
                console.error("Initialization errors:", err);
                setError('Failed to download initialization parameters required for creating tasks.');
            } finally {
                setLoading(false);
            }
        };

        initFormRequirements();
    }, []);

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

            // Construct TaskCreateDto request body
            const payload = {
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
                dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
                categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : null,
                // Admin must specify a user, regular User leaves it null to auto-assign to self on backend
                assignedToUserId: role === 'Admin' ? (formData.assignedToUserId ? parseInt(formData.assignedToUserId, 10) : null) : null
            };

            await createTask(payload);
            alert('Task created successfully.');
            navigate(role === 'Admin' ? '/admin/dashboard' : '/dashboard');
        } catch (err) {
            console.error(err);
            alert('Failed to process task registration data safely.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="edit-status-msg">Loading input metrics...</div>;
    if (error) return <div className="edit-status-msg error-text">{error}</div>;

    return (
        <div className="edit-task-view-container">
            <div className="edit-task-card-frame">
                <button type="button" className="back-nav-link" onClick={() => navigate(-1)}>
                    ← Back to tasks
                </button>
                
                <h2 className="edit-view-heading">New task</h2>
                <p className="welcome-subtitle" style={{ marginBottom: '20px' }}>Fill in the details to create a task.</p>
                
                <form onSubmit={handleSubmit} className="edit-task-form-layout">
                    <div className="form-input-wrapper full-width-span">
                        <label className="input-field-label">Title</label>
                        <input 
                            type="text" 
                            name="title"
                            placeholder="e.g. Prepare release notes"
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
                            placeholder="Add details..."
                            value={formData.description} 
                            onChange={handleInputChange}
                            className="form-textarea-input" 
                            rows="4"
                        />
                    </div>

                    <div className="form-input-wrapper">
                        <label className="input-field-label">Status</label>
                        <select name="status" value={formData.status} onChange={handleInputChange} className="form-select-dropdown" disabled>
                            <option value="Pending">Pending</option>
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

                    {/* Conditional render block: Show user assignment dropdown if admin */}
                    {role === 'Admin' && (
                        <div className="form-input-wrapper full-width-span admin-select-highlight">
                            <label className="input-field-label">Assign To User (Required for Admin Accounts)</label>
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
                                        {u.username} (ID: {u.id})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="form-actions-footer-row full-width-span">
                        <button type="submit" disabled={submitting} className="action-save-btn">
                            {submitting ? 'Creating task...' : 'Create task'}
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