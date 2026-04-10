import axios from "axios";
import { BASE_API } from "./Config";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CONTRACT_ABI = [
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "name": "id", "type": "uint256" },
        { "indexed": true, "name": "sender", "type": "address" },
        { "indexed": true, "name": "recipient", "type": "address" },
        { "indexed": false, "name": "fileHash", "type": "string" },
        { "indexed": false, "name": "timestamp", "type": "uint256" }
      ],
      "name": "FileShared",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "name": "id", "type": "uint256" },
        { "indexed": true, "name": "sender", "type": "address" },
        { "indexed": true, "name": "recipient", "type": "address" },
        { "indexed": false, "name": "fileHash", "type": "string" }
      ],
      "name": "AccessRevoked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "name": "id", "type": "uint256" },
        { "indexed": true, "name": "uploader", "type": "address" },
        { "indexed": false, "name": "fileHash", "type": "string" },
        { "indexed": false, "name": "fileName", "type": "string" },
        { "indexed": false, "name": "fileSize", "type": "uint256" },
        { "indexed": false, "name": "timestamp", "type": "uint256" }
      ],
      "name": "FileUploaded",
      "type": "event"
    },
    {
      "inputs": [{ "name": "", "type": "uint256" }],
      "name": "accessRecords",
      "outputs": [
        { "name": "sender", "type": "address" },
        { "name": "recipient", "type": "address" },
        { "name": "fileHash", "type": "string" },
        { "name": "shared", "type": "bool" },
        { "name": "revoked", "type": "bool" },
        { "name": "timestamp", "type": "uint256" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "accessRecordsCount",
      "outputs": [{ "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "name": "", "type": "uint256" }],
      "name": "fileUploads",
      "outputs": [
        { "name": "uploader", "type": "address" },
        { "name": "fileHash", "type": "string" },
        { "name": "fileName", "type": "string" },
        { "name": "fileSize", "type": "uint256" },
        { "name": "uploaded", "type": "bool" },
        { "name": "timestamp", "type": "uint256" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "fileUploadsCount",
      "outputs": [{ "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "name": "_id", "type": "uint256" }
      ],
      "name": "revokeAccess",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "name": "_recipient", "type": "address" },
        { "name": "_fileHash", "type": "string" }
      ],
      "name": "revokeAccessByHash",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "name": "_recipient", "type": "address" },
        { "name": "_fileHash", "type": "string" }
      ],
      "name": "shareFile",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "name": "_fileHash", "type": "string" },
        { "name": "_fileName", "type": "string" },
        { "name": "_fileSize", "type": "uint256" }
      ],
      "name": "uploadFile",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "name": "_user", "type": "address" },
        { "name": "_fileHash", "type": "string" }
      ],
      "name": "hasActiveAccess",
      "outputs": [{ "name": "", "type": "bool" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "name": "_user", "type": "address" }
      ],
      "name": "getUserUploads",
      "outputs": [{ "name": "", "type": "uint256[]" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "name": "_user", "type": "address" }
      ],
      "name": "getUserSharedFiles",
      "outputs": [{ "name": "", "type": "uint256[]" }],
      "stateMutability": "view",
      "type": "function"
    }
];

const BlockchainService = {

    // Helper function to add delay between retries
    delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    // Helper function to retry failed RPC calls
    retryWithBackoff: async (fn, maxRetries = 3, baseDelay = 1000) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                if (error.code === 'UNKNOWN_ERROR' && attempt < maxRetries) {
                    console.warn(`RPC call failed (attempt ${attempt}/${maxRetries}), retrying in ${baseDelay}ms...`);
                    await BlockchainService.delay(baseDelay * attempt);
                    continue;
                }
                throw error;
            }
        }
    },

    getBlock: async (userId) => {
        try {
            const response = await axios.get(`${BASE_API}/api/getBlockChainData/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching block:', error);
            throw new Error('Failed to fetch block');
        }
    },

    uploadFile: async (ipfsHash, fileName = "Unknown", fileSize = 0) => {
        if (!window.ethereum) throw new Error("MetaMask not installed");
        
        return await BlockchainService.retryWithBackoff(async () => {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            
            const tx = await contract.uploadFile(ipfsHash, fileName, fileSize);
            const receipt = await tx.wait();
            return receipt;
        });
    },

    shareFile: async (recipientAddress, ipfsHash) => {
        if (!window.ethereum) throw new Error("MetaMask not installed");
        
        return await BlockchainService.retryWithBackoff(async () => {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            
            const tx = await contract.shareFile(recipientAddress, ipfsHash);
            const receipt = await tx.wait();
            
            // Extract the ID from the FileShared event
            const event = receipt.logs.find(log => {
                try {
                    const parsed = contract.interface.parseLog(log);
                    return parsed.name === 'FileShared';
                } catch (e) {
                    return false;
                }
            });
            
            let blockchainAccessId = null;
            if (event) {
                const parsedLog = contract.interface.parseLog(event);
                blockchainAccessId = parsedLog.args[0].toString();
            }
            
            return { receipt, blockchainAccessId };
        });
    },

    revokeAccess: async (blockchainAccessId) => {
        if (!window.ethereum) throw new Error("MetaMask not installed");
        
        return await BlockchainService.retryWithBackoff(async () => {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            
            const tx = await contract.revokeAccess(blockchainAccessId);
            const receipt = await tx.wait();
            return receipt;
        });
    },

    // Revoke access by recipient address and file hash (for old shares without ID)
    revokeAccessByHash: async (recipientAddress, fileHash) => {
        if (!window.ethereum) throw new Error("MetaMask not installed");
        
        return await BlockchainService.retryWithBackoff(async () => {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            
            const tx = await contract.revokeAccessByHash(recipientAddress, fileHash);
            const receipt = await tx.wait();
            return receipt;
        });
    },

    recordTransaction: async (userId, ipfsHash, txHash, userAddress) => {
        try {
            const response = await axios.post(`${BASE_API}/api/record-transaction`, {
                userId,
                ipfs_hash: ipfsHash,
                tx_hash: txHash,
                userAddress
            });
            return response.data;
        } catch (error) {
            console.error('Error recording transaction:', error);
            throw new Error('Failed to record transaction in DB');
        }
    },

    // Listen to FileUploaded events
    listenToUploadEvents: (callback) => {
        if (!window.ethereum) throw new Error("MetaMask not installed");
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        contract.on("FileUploaded", (id, uploader, fileHash, fileName, fileSize, timestamp, event) => {
            callback({
                type: 'upload',
                id: id.toString(),
                uploader,
                fileHash,
                fileName,
                fileSize: fileSize.toString(),
                timestamp: timestamp.toString(),
                transactionHash: event.log.transactionHash
            });
        });
    },

    // Listen to FileShared events
    listenToShareEvents: (callback) => {
        if (!window.ethereum) throw new Error("MetaMask not installed");
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        contract.on("FileShared", (id, sender, recipient, fileHash, timestamp, event) => {
            callback({
                type: 'share',
                id: id.toString(),
                sender,
                recipient,
                fileHash,
                timestamp: timestamp.toString(),
                transactionHash: event.log.transactionHash
            });
        });
    },

    // Check if user has active access to a file
    checkAccess: async (userAddress, fileHash) => {
        if (!window.ethereum) throw new Error("MetaMask not installed");
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        const hasAccess = await contract.hasActiveAccess(userAddress, fileHash);
        return hasAccess;
    },

    // Get all uploads by a user
    getUserUploads: async (userAddress) => {
        if (!window.ethereum) throw new Error("MetaMask not installed");
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        const uploadIds = await contract.getUserUploads(userAddress);
        return uploadIds;
    },

    // Get all files shared with a user
    getUserSharedFiles: async (userAddress) => {
        if (!window.ethereum) throw new Error("MetaMask not installed");
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        const sharedIds = await contract.getUserSharedFiles(userAddress);
        return sharedIds;
    }

}

export default BlockchainService;