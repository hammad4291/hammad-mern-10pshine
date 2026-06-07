import API from '../../../api/axios';

export const updateProfileName = async (fullName) => {
    const response = await API.put('/profile/update-name', { fullName });
    
    // Update local storage so the UI stays synchronized seamlessly
    localStorage.setItem('username', fullName); 
    
    return response.data;
};