import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileService from '../../services/FileService';
import BlockchainService from '../../services/BlockchainService';
import { useToast } from '../../context/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareAlt, faFolder, faUserFriends, faHistory, faTrash, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const MySharedFiles = () => {
  // State to store the list of shared files and loading status
  const [sharedFiles, setSharedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revokeStatus, setRevokeStatus] = useState({ type: '', message: '' });
  const { success, error, warning } = useToast();
  const userData = JSON.parse(localStorage.getItem('user'));
  
  // Helper to refresh notifications
  const refreshNotifications = () => {
    window.dispatchEvent(new Event('storage'));
  };

  useEffect(() => {
    const fetchSharedFiles = async () => {
      try {
        if (!userData?.id) {
          setLoading(false);
          return;
        }
        // Set loading to true when fetching data
        setLoading(true);
        // Fetch shared files for the current user
        const response = await FileService.getSharedFiles(userData.id);
        // Check if response has data array or error
        if (response && response.data && Array.isArray(response.data)) {
          setSharedFiles(response.data);
        } else {
          // If API returns error message, set empty array
          setSharedFiles([]);
        }
      } catch (error) {
        console.error('Error fetching shared files:', error);
        // Set empty array on error instead of crashing
        setSharedFiles([]);
      } finally {
        // Set loading to false when data fetching is complete
        setLoading(false);
      }
    };

    fetchSharedFiles();

  }, [userData?.id]); // Update dependency array for robustness

  // Function to handle revoking access for a file
  const revokeAccess = async (fileId, recipient_username) => {
    const senderAddress = localStorage.getItem('ethereum_address');
    if (!senderAddress) {
        error('Please connect your MetaMask wallet first!');
        return;
    }

    // Show confirmation via custom UI instead of window.confirm
    const confirmRevoke = window.confirm(`Are you sure you want to revoke access for ${recipient_username}?\n\nThis action will be recorded on the blockchain.`);
    if (!confirmRevoke) {
      return;
    }

    try {
      setRevokeStatus({ type: '', message: '' });
      
      // 1. Get revoke info from backend
      const revokeInfo = await FileService.revokeAccess(fileId, recipient_username);
      
      console.log('Revoke info:', revokeInfo);
      console.log('Blockchain access ID:', revokeInfo.blockchain_access_id);
      
      // 2. Trigger Blockchain Transaction via MetaMask
      let receipt;
      
      if (revokeInfo.blockchain_access_id !== null && revokeInfo.blockchain_access_id !== undefined) {
          // Method 1: Revoke using stored blockchain ID
          console.log('Revoking using blockchain access ID:', revokeInfo.blockchain_access_id);
          receipt = await BlockchainService.revokeAccess(revokeInfo.blockchain_access_id);
      } else {
          // Method 2: Revoke using file hash and recipient address (for old shares)
          console.log('No blockchain ID found. Using revokeAccessByHash method...');
          console.log('Recipient address:', revokeInfo.recipient_address);
          console.log('File ID to get hash:', fileId);
          
          // Get file hash from the file ID
          const fileData = sharedFiles.find(f => f.file_id === fileId);
          if (!fileData || !fileData.file_hash) {
              error('Could not find file hash for this share. Cannot revoke on blockchain.');
              return;
          }
          
          console.log('File hash:', fileData.file_hash);
          receipt = await BlockchainService.revokeAccessByHash(
              revokeInfo.recipient_address,
              fileData.file_hash
          );
      }
      
      // 3. Record in Backend DB
      await FileService.recordRevokeTransaction(
          userData.id,
          fileId,
          receipt.hash,
          senderAddress,
          revokeInfo.recipient_address,
          revokeInfo.recipient_id
      );
      
      setRevokeStatus({ 
        type: 'success', 
        message: `Access successfully revoked for ${recipient_username}! The transaction has been recorded on the blockchain.` 
      });
      success(`Access revoked for ${recipient_username} - Transaction recorded on blockchain!`);
      refreshNotifications(); // Refresh notifications

      // Remove from UI
      const updatedFiles = sharedFiles.filter(file => file.file_id !== fileId || file.recipient_username !== recipient_username);
      setSharedFiles(updatedFiles);
    } catch (error) {
      setRevokeStatus({ 
        type: 'error', 
        message: `Failed to revoke access: ${error.message}` 
      });
      error(`Failed to revoke access: ${error.message}`);
    }
  };

    return (
        <div className="space-y-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">My Shared Files</h2>
                    <p className="text-slate-500 font-medium mt-1">Files you've shared with others on the blockchain</p>
                </div>
                <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 shadow-sm">
                    {sharedFiles?.length || 0} Active Shares
                </div>
            </div>

            {/* Revoke Status Messages */}
            {revokeStatus.message && (
                <div className={`p-6 rounded-[2rem] text-sm font-bold flex items-center space-x-4 border animate-fade-in ${
                    revokeStatus.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                    <FontAwesomeIcon 
                        icon={revokeStatus.type === 'success' ? faCheckCircle : faExclamationCircle} 
                        className="text-xl" 
                    />
                    <span className="flex-1">{revokeStatus.message}</span>
                    <button 
                        onClick={() => setRevokeStatus({ type: '', message: '' })}
                        className="px-4 py-2 bg-white/50 hover:bg-white rounded-xl transition-all text-xs"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-slate-500 font-bold animate-pulse">Fetching share records...</p>
                </div>
            ) : (
                <>
                    {sharedFiles?.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-16 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <FontAwesomeIcon icon={faShareAlt} className="text-4xl" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No shared files</h3>
                            <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium">
                                You haven't shared any files yet. Go to "My Files" to start sharing securely!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {sharedFiles.map((file, index) => (
                                <div key={index} className="group bg-white border border-slate-200 rounded-[2.5rem] p-6 card-hover flex flex-col h-full overflow-hidden relative">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <FontAwesomeIcon icon={faFolder} className="text-2xl" />
                                        </div>
                                        <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            {file.access_level} Access
                                        </div>
                                    </div>

                                    <div className="space-y-4 flex-grow">
                                        <h3 className="text-xl font-bold text-slate-800 truncate" title={file.filename}>
                                            {file.filename}
                                        </h3>
                                        
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs">
                                                    <FontAwesomeIcon icon={faUserFriends} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Recipient</p>
                                                    <p className="text-sm font-bold text-slate-700 truncate">{file.recipient_username}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs">
                                                    <FontAwesomeIcon icon={faHistory} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Shared Date</p>
                                                    <p className="text-sm font-bold text-slate-700">
                                                        {file.shared_time}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-100">
                                        <button
                                            onClick={() => revokeAccess(file.file_id, file.recipient_username)}
                                            className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl transition-all flex items-center justify-center space-x-2 active:scale-95"
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="text-sm" />
                                            <span>Revoke Access</span>
                                        </button>
                                    </div>

                                    {/* Subtle background pattern */}
                                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MySharedFiles;
