import React, { useState, useEffect } from 'react';
import FileService from '../../services/FileService';
import BlockchainService from '../../services/BlockchainService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faShare, faInfoCircle, faEye, faRobot, faCloudArrowDown, faMessage, faTrash, faFolderOpen, faPlus } from '@fortawesome/free-solid-svg-icons';

import FileDisplayModal from './Modals/FileDisplayModal';
import ShareModal from './Modals/ShareModal';

const Files = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [sharingFileId, setSharingFileId] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const userData = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!userData?.id) return; // Ensure userData and its id exist before fetching
                const response = await FileService.getAllFiles(userData.id);
                setFiles(response.data);
            } catch (error) {
                console.error('Error fetching files:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userData?.id]);

    const handleShareIconClick = (fileId) => {
        setShowModal(true);
        setSharingFileId(fileId);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleShareFile = async (username, accessControl) => {
        console.log('Sharing file', sharingFileId, 'from user', userData.id, 'with username:', username, 'and access control:', accessControl);

        const senderAddress = localStorage.getItem('ethereum_address');
        if (!senderAddress) {
            alert('Please connect your MetaMask wallet first!');
            return;
        }

        try {
            // 1. Get recipient info from backend
            const shareInfo = await FileService.shareFile(sharingFileId, userData.id, username, accessControl);
            
            // 2. Trigger Blockchain Transaction via MetaMask
            console.log('Requesting MetaMask confirmation for sharing...');
            const { receipt, blockchainAccessId } = await BlockchainService.shareFile(shareInfo.recipient_address, sharingFileId);
            
            // 3. Record in Backend DB
            await FileService.recordShareTransaction(
                userData.id,
                sharingFileId,
                receipt.hash,
                senderAddress,
                shareInfo.recipient_address,
                shareInfo.recipient_id,
                shareInfo.file_id,
                accessControl,
                blockchainAccessId
            );

            alert('File shared successfully on blockchain!');
        } catch (error) {
            console.error('Error sharing file:', error.message);
            alert('File sharing failed: ' + error.message);
        }

        handleCloseModal();
    };

    const handleFileClick = (file) => {
        setSelectedFile(file);
        setShowModal(true);
    };

    const handleDeleteFile = async (file) => {
        if (window.confirm('Are you sure you want to delete this file?')) {
            try {
                await FileService.deleteFile(file.id);
                setFiles(prevFiles => prevFiles.filter(f => f.id !== file.id));
                alert('File deleted successfully');
            } catch (error) {
                console.error('Error deleting file:', error.message);
                alert('File deletion failed');
            }
        }
    };

    const handleDownloadFile = (file) => {
        // Convert base64 data to blob
        const byteCharacters = atob(file.content);
        const byteArrays = [];
    
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
    
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
    
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
    
        const blob = new Blob(byteArrays, { type: file.file_type });
    
        // Create a download link and trigger download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };
    


    return (
        <div className="space-y-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">My Secure Files</h2>
                    <p className="text-slate-500 font-medium mt-1">Manage and share your decentralized data</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 shadow-sm">
                        {files?.length || 0} Files
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-slate-500 font-bold animate-pulse">Decrypting your storage...</p>
                </div>
            ) : (
                <>
                    {!files || files.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-16 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <FontAwesomeIcon icon={faFolderOpen} className="text-4xl" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No files found</h3>
                            <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium">
                                Your secure vault is empty. Upload your first file to the blockchain to get started!
                            </p>
                            <Link to="/app/dashboard/upload" className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                                <FontAwesomeIcon icon={faPlus} />
                                <span>Upload Now</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {files.map((file, index) => (
                                <div key={index} className="group bg-white border border-slate-200 rounded-[2rem] p-5 card-hover relative overflow-hidden flex flex-col h-full">
                                    {/* Preview Area */}
                                    <div className="aspect-video w-full bg-slate-50 rounded-2xl mb-4 overflow-hidden relative group-hover:shadow-inner transition-shadow">
                                        <embed src={`data:${file.file_type};base64,${file.content}`} className="w-full h-full object-cover pointer-events-none" />
                                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors pointer-events-none"></div>
                                        
                                        {/* Quick Actions Overlay */}
                                        <div className="absolute top-3 right-3 flex flex-col space-y-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                            <button 
                                                onClick={() => handleDownloadFile(file)}
                                                className="w-10 h-10 bg-white shadow-lg rounded-xl flex items-center justify-center text-slate-600 hover:text-blue-600 hover:scale-110 transition-all"
                                                title="Download"
                                            >
                                                <FontAwesomeIcon icon={faCloudArrowDown} />
                                            </button>
                                            <button 
                                                onClick={() => handleShareIconClick(file.hash)}
                                                className="w-10 h-10 bg-white shadow-lg rounded-xl flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:scale-110 transition-all"
                                                title="Share"
                                            >
                                                <FontAwesomeIcon icon={faShare} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Info Area */}
                                    <div className="flex-grow">
                                        <h3 className="text-lg font-bold text-slate-800 truncate mb-1" title={file.name}>
                                            {file.name}
                                        </h3>
                                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            <span className="bg-slate-100 px-2 py-0.5 rounded-md">{file.file_type.split('/')[1] || 'FILE'}</span>
                                            <span>•</span>
                                            <span>Web3 Encrypted</span>
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                                        <button
                                            onClick={() => handleFileClick(file)}
                                            className="flex-grow py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors flex items-center justify-center space-x-2"
                                        >
                                            <FontAwesomeIcon icon={faEye} className="text-xs" />
                                            <span>Preview</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteFile(file)}
                                            className="w-11 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors flex items-center justify-center"
                                            title="Delete permanently"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
            <FileDisplayModal isOpen={showModal} onClose={handleCloseModal} selectedFile={selectedFile} />
            <ShareModal isOpen={showModal} onClose={handleCloseModal} onShare={handleShareFile} senderId={userData.id} />
        </div>
    );
};

export default Files;
