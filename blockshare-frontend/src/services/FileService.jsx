import axios from 'axios';
import { BASE_API } from './Config';

const FileService = {
    uploadFile: async (file,userId,ethereum_address) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);
        formData.append('userAddress', ethereum_address);
  
        const response = await axios.post(`${BASE_API}/api/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        return response.data; // If needed, handle the response from the server
      } catch (error) {
        // Handle error responses or exceptions
        console.error('Error uploading file:', error);
        throw new Error('File upload failed'); // You can customize the error handling
      }
    },

    getAllFiles: async (userId) => {
        try {
            const response = await axios.get(`${BASE_API}/api/getfiles/${userId}`); // Pass userId in the URL
            console.log(response.data);
            return response.data; // Extract the file list from the response
        } catch (error) {
            console.error('Error fetching files:', error);
            throw new Error('Failed to fetch files'); // You can customize the error handling
        }
    },

    // Add a new function to share a file
    shareFile: async (file_hash, userId, recipientUsername, accessControl) => {
        try {
            const response = await axios.post(`${BASE_API}/api/sharefile`, {
                file_hash: file_hash,
                senderUserId: userId,
                recipientUsername: recipientUsername,
                accessLevel: accessControl
            });
    
            return response.data; // Return the data needed for frontend transaction
        } catch (error) {
            console.error('Error sharing file:', error);
            throw new Error(error.response?.data?.error || error.message || 'File sharing failed');
        }
    },

    recordShareTransaction: async (userId, fileHash, txHash, senderAddress, recipientAddress, recipientId, fileId, accessLevel, blockchainAccessId) => {
        try {
            const response = await axios.post(`${BASE_API}/api/record-share-transaction`, {
                userId,
                file_hash: fileHash,
                tx_hash: txHash,
                senderAddress,
                recipientAddress,
                recipientId,
                file_id: fileId,
                accessLevel,
                blockchainAccessId
            });
            return response.data;
        } catch (error) {
            console.error('Error recording share transaction:', error);
            throw new Error('Failed to record share transaction in DB');
        }
    },

    // Add a new function to get shared files
    getSharedFiles: async (userId) => {
        try {
            const response = await axios.get(`${BASE_API}/api/getsharedfiles/${userId}`); // Pass userId in the URL
            return response.data; // Extract the shared file list from the response
        } catch (error) {
            console.error('Error fetching shared files:', error);
            throw new Error('Failed to fetch shared files'); // You can customize the error handling
        }
    },

    getSharedWithMe: async (userId) => {
        try {
            const response = await axios.get(`${BASE_API}/api/sharedwithme/${userId}`); // Pass userId in the URL
            return response.data; // Extract the shared file list from the response
        } catch (error) {
            console.error('Error fetching shared files:', error);
            throw new Error('Failed to fetch shared files'); // You can customize the error handling
        }
    },

    // Function to revoke access for a file
    revokeAccess: async (fileId, recipient_username) => {
        try {
            const response = await axios.post(`${BASE_API}/api/revokeaccess`, {
                file_id: fileId,
                recipient_username: recipient_username
            });
            return response.data;
        } catch (error) {
            console.error('Error revoking access:', error);
            throw new Error(error.response?.data?.error || error.message || 'Failed to revoke access');
        }
    },

    recordRevokeTransaction: async (userId, fileId, txHash, senderAddress, recipientAddress, recipientId) => {
        try {
            const response = await axios.post(`${BASE_API}/api/record-revoke-transaction`, {
                userId,
                fileId,
                tx_hash: txHash,
                senderAddress,
                recipientAddress,
                recipientId
            });
            return response.data;
        } catch (error) {
            console.error('Error recording revoke transaction:', error);
            throw new Error('Failed to record revoke transaction in DB');
        }
    },

    recordRevokeTransactionLocal: async (userId, fileId, recipientId) => {
        try {
            const response = await axios.post(`${BASE_API}/api/record-revoke-transaction-local`, {
                userId,
                fileId,
                recipientId
            });
            return response.data;
        } catch (error) {
            console.error('Error recording local revoke:', error);
            throw new Error('Failed to record local revoke in DB');
        }
    },

      deleteFile: async (file_id) => {
        try {
           
            const response = await axios.delete(`${BASE_API}/api/deletefile/${file_id}`); // Pass fileId in the URL
           
            console.log('File deleted successfully:', response.data);
            // Optionally, you can update your component state or perform any necessary actions after deleting the file
        } catch (error) {
            console.error('Error deleting file:', error.response?.data || error.message);
            // Handle errors here
        }
    },



    

};    

export default FileService;
