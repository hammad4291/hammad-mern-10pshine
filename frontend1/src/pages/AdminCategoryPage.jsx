import { useEffect, useState } from 'react';
import { fetchCategories, createCategory, updateCategory } from '../features/tasks/services/taskApi';
import '../styles/categoriesPage.css'; // Dedicated stylesheet for the categories management page
export default function AdminCategoryPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Create Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [modalError, setModalError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Inline Editing Trackers
    const [editStates, setEditStates] = useState({}); // Stores raw temporary text modifications by ID

    const loadPageData = async () => {
        try {
            setLoading(true);
            const res = await fetchCategories();
            setCategories(res.data || []);
            setError('');
        } catch (err) {
            setError('Failed to fetch global system categories pipeline matrix.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadPageData(); }, []);

    // Handle Inline State String Tracking
    const handleTextChange = (id, text) => {
        setEditStates(prev => ({ ...prev, [id]: text }));
    };

    // Commit Inline Modification Changes to backend DB
    const handleUpdateCategory = async (id, originalName) => {
        const updatedValue = editStates[id]?.trim();
        if (!updatedValue || updatedValue.toLowerCase() === originalName.toLowerCase()) return;

        try {
            await updateCategory(id, { name: updatedValue });
            // Refresh local row context arrays
            setCategories(prev => prev.map(c => c.id === id ? { ...c, name: updatedValue } : c));
            alert('Category updated successfully.');
        } catch (err) {
            alert(err.response?.data || 'Failed to update selected category row.');
        }
    };

    // Commit New Record Addition
    const handleCreateCategorySubmit = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        try {
            setSubmitting(true);
            setModalError('');
            await createCategory({ name: newCategoryName.trim() });
            
            setNewCategoryName('');
            setIsModalOpen(false);
            await loadPageData(); // Refresh list layout natively
        } catch (err) {
            setModalError(err.response?.data || 'Failed to create new category.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="dashboard-status-msg">Loading Categories Matrix Engine...</div>;
    if (error) return <div className="dashboard-status-msg error-text">{error}</div>;

    return (
        <div className="dashboard-content-wrapper">
            <header className="tasks-page-header">
                <div className="header-text-block">
                    <h1 className="welcome-title">Category Control</h1>
                    <p className="welcome-subtitle">Directly manage and update global task classification markers.</p>
                </div>
                <button className="tasks-create-btn" onClick={() => setIsModalOpen(true)}>
                    <span>+</span> New Category
                </button>
            </header>

            {/* Classification Editable Board Grid Layout */}
            <div className="category-list-stack">
                {categories.length === 0 ? (
                    <div className="empty-tasks-fallback">No classifications established inside backend DB.</div>
                ) : (
                    categories.map(cat => {
                        const currentInputValue = editStates[cat.id] !== undefined ? editStates[cat.id] : cat.name;
                        const isModified = currentInputValue.trim() !== '' && currentInputValue.trim().toLowerCase() !== cat.name.toLowerCase();

                        return (
                            <div key={cat.id} className="category-item-row-card">
                                <div className="category-input-group">
                                    <span className="category-marker-bullet">🏷️</span>
                                    <input
                                        type="text"
                                        className="category-inline-input"
                                        value={currentInputValue}
                                        onChange={(e) => handleTextChange(cat.id, e.target.value)}
                                        placeholder="Category Name"
                                    />
                                </div>
                                <button
                                    className="action-save-btn category-inline-update-btn"
                                    disabled={!isModified}
                                    onClick={() => handleUpdateCategory(cat.id, cat.name)}
                                >
                                    💾 Update
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Standard Pop Up Modal Integration Component */}
            {isModalOpen && (
                <div className="modal-overlay-backdrop" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-details-container" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-corner" onClick={() => setIsModalOpen(false)}>×</button>
                        
                        <div className="modal-header-block">
                            <h3 className="modal-task-title">Create Category</h3>
                            <p className="modal-task-category">Add a unique classification tag into your system.</p>
                        </div>

                        {modalError && <div className="category-modal-error">{modalError}</div>}

                        <form onSubmit={handleCreateCategorySubmit} className="edit-task-form-layout">
                            <div className="form-input-wrapper full-width-span">
                                <label className="input-field-label">Category Classification Name</label>
                                <input
                                    type="text"
                                    className="form-text-input"
                                    placeholder="e.g., Bug, Optimization, Research"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="form-actions-footer-row full-width-span">
                                <button type="submit" className="action-save-btn" disabled={submitting}>
                                    {submitting ? 'Creating...' : '➕ Add Category'}
                                </button>
                                <button type="button" className="action-cancel-btn" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}