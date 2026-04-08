import axios from 'axios';
import { BASE_API } from './Config';

const UserService = {


    getUser: async () => {
        try {
            const response = await axios.get(`${BASE_API}/api/getUser`); 
            return response.data; 
        } catch (error) {
            console.error('Error fetching user:', error);
            throw new Error('Failed to fetch user'); // You can customize the error handling
        }
    },

    updateUserAddress: async (userId, address) => {
        try {
            const response = await axios.post(`${BASE_API}/api/updateUserAddress`, {
                userId,
                address
            });
            return response.data;
        } catch (error) {
            console.error('Error updating user address:', error);
            throw new Error('Failed to update user address');
        }
    },

};

export default UserService;
