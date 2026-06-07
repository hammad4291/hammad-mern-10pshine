// 🟢 IMPORT your custom configured instance instead of raw axios
import API from '../../../api/axios'; 

// 🔐 Authentication Endpoint Services
export const loginUser = async (email, password) => {
    // API already knows the BaseURL and has the '/api' suffix attached!
    return await API.post('/auth/login', { email, password });
};

export const registerUser = async (username, email, password) => {
    return await API.post('/auth/register', { 
        username, 
        email, 
        password, 
        roleId: 2 
    });
};

export const refreshSession = async (accessToken, refreshToken) => {
    return await API.post('/auth/refresh', { accessToken, refreshToken });
};