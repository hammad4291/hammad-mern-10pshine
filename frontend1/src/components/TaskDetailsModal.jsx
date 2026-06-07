import { useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteModelTask } from '../features/tasks/services/taskApi';

export default function TaskDetailsModal({ task, currentUserId, onClose, onDeleteSuccess }) {
    const [deleting, setDeleting] = useState(false);

    if (!task) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const assignerName = task.createdByUserId === currentUserId || task.createdByUser?.id === currentUserId
        ? 'You'
        : (task.createdByUser?.username || 'Admin');

    const handleDeleteClick = async () => {
        if (window.confirm("Are you sure you want to remove this task?")) {
            try {
                setDeleting(true);
                await deleteModelTask(task.id);
                onClose(); // Close the modal layout view frame
                if (onDeleteSuccess) onDeleteSuccess(); // Notify parent components to reload state
            } catch (err) {
                console.error(err);
                alert("Failed to delete the task framework entry securely.");
            } finally {
                setDeleting(false);
            }
        }
    };

    return (
        <div className="modal-overlay-backdrop" onClick={onClose}>
            <div className="modal-details-container" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-corner" onClick={onClose}>×</button>
                
                <div className="modal-header-block">
                    <span className={`modal-badge-priority priority-${String(task.priority).toLowerCase()}`}>
                        {task.priority} Priority
                    </span>
                    <h2 className="modal-task-title">{task.title}</h2>
                    <p className="modal-task-category">Category: <span>{task.category?.name || 'General'}</span></p>
                </div>

                <div className="modal-body-content">
                    <label className="modal-section-label">Description</label>
                    <p className="modal-task-description">
                        {task.description || "No description provided for this task."}
                    </p>

                    <div className="modal-meta-grid">
                        <div className="meta-grid-item">
                            <span className="meta-grid-label">Assigned By</span>
                            <span className="meta-grid-value">{assignerName}</span>
                        </div>
                        <div className="meta-grid-item">
                            <span className="meta-grid-label">Status</span>
                            <span className={`meta-grid-value status-text-${String(task.status).toLowerCase()}`}>
                                {task.status}
                            </span>
                        </div>
                        <div className="meta-grid-item">
                            <span className="meta-grid-label">Created Date</span>
                            <span className="meta-grid-value">{formatDate(task.createdAt)}</span>
                        </div>
                        <div className="meta-grid-item">
                            <span className="meta-grid-label">Due Date</span>
                            <span className="meta-grid-value due-date-accent">{formatDate(task.dueDate)}</span>
                        </div>
                    </div>
                </div>

                <div className="modal-footer-actions" onClick={(e) => e.stopPropagation()}>
                    <Link 
                        to={`/tasks/edit/${task.id}`} 
                        state={{ task }}
                        className="modal-action-btn edit-btn-tint"
                    >
                        ✏️ Edit Task
                    </Link>
                    <button 
                        onClick={handleDeleteClick} 
                        disabled={deleting}
                        className="modal-action-btn delete-btn-tint"
                    >
                        {deleting ? '🗑️ Deleting...' : '🗑️ Delete Task'}
                    </button>
                </div>
            </div>
        </div>
    );
}