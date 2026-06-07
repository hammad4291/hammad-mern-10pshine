import API from '../../../api/axios';

/**
 * Fetch all tasks assigned to the currently logged-in user.
 * Endpoint: GET /api/tasks/my-tasks
 */
export const fetchMyTasks = async () => {
    return await API.get('/tasks/my-tasks');
};

/**
 * Create a brand new task.
 * Endpoint: POST /api/tasks/create
 */
export const createTask = async (taskData) => {
    return await API.post('/tasks/create', taskData);
};

/**
 * Update an existing task's fields, status, or priority configuration.
 * Endpoint: PUT /api/tasks/{id}
 */
export const updateTask = async (id, updateData) => {
    return await API.put(`/tasks/${id}`, updateData);
};

/**
 * Soft delete a task from the workspace view logs without purging database rows.
 * Endpoint: DELETE /api/tasks/{id}
 */
export const deleteModelTask = async (id) => {
    return await API.delete(`/tasks/${id}`);
};

/**
 * Fetch assignable team members. Exclusive to Admin accounts.
 * Endpoint: GET /api/tasks/assignable-users
 */
export const fetchAssignableUsers = async () => {
    return await API.get('/tasks/assignable-users');
};

export const fetchCategories = async () => {
    return await API.get('/tasks/categories');
};