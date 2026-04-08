import React, { useState, useEffect } from 'react';
import FileService from '../../services/FileService';
import BlockchainService from '../../services/BlockchainService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faShare, faInfoCircle, faEye, faImages, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

import ShareModal from './Modals/ShareModal';

const Photos = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [sharingFileId, setSharingFileId] = useState(null); // State to store the fileId for sharing
    const [selectedImage, setSelectedImage] = useState(null);
    const [isImageModalOpen, setImageModalOpen] = useState(false);
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

    }, [userData?.id]); // Update dependency array for robustness

    const handleShareIconClick = (fileId) => {
        setShowModal(true);
        setSharingFileId(fileId); // Store the fileId for sharing
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

    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
        setImageModalOpen(true);
    };

    return (
        <div className="space-y-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">My Photo Vault</h2>
                    <p className="text-slate-500 font-medium mt-1">Blockchain-secured memories and media</p>
                </div>
                <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 shadow-sm">
                    {files?.filter(f => f.file_type.startsWith('image/')).length || 0} Photos
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-slate-500 font-bold animate-pulse">Loading your gallery...</p>
                </div>
            ) : (
                <>
                    {!files || files.filter(f => f.file_type.startsWith('image/')).length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-16 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <FontAwesomeIcon icon={faImages} className="text-4xl" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No photos available</h3>
                            <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium">
                                Start building your decentralized gallery by uploading your first image!
                            </p>
                            <Link to="/app/dashboard/upload" className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg active:scale-95">
                                <FontAwesomeIcon icon={faPlus} />
                                <span>Upload Photo</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {files.map((file, index) => {
                                if (file.file_type.startsWith('image/')) {
                                    return (
                                        <div key={index} className="group bg-white border border-slate-200 rounded-[2rem] p-4 card-hover relative overflow-hidden flex flex-col h-full">
                                            {/* Image Preview */}
                                            <div className="aspect-square w-full bg-slate-50 rounded-2xl mb-4 overflow-hidden relative group-hover:shadow-lg transition-all duration-300">
                                                <img 
                                                    src={`data:image/jpeg;base64,${file.content}`} 
                                                    alt={file.name}
                                                    className="w-full h-full object-cover cursor-zoom-in group-hover:scale-110 transition-transform duration-500" 
                                                    onClick={() => handleImageClick(`data:image/jpeg;base64,${file.content}`)} 
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                
                                                {/* Actions Overlay */}
                                                <div className="absolute bottom-3 left-3 right-3 flex justify-center space-x-2 translate-y-12 group-hover:translate-y-0 transition-transform duration-300">
                                                    <button onClick={() => handleShareIconClick(file.hash)} className="w-10 h-10 bg-white/90 backdrop-blur-md shadow-lg rounded-xl flex items-center justify-center text-slate-700 hover:text-blue-600 hover:scale-110 transition-all">
                                                        <FontAwesomeIcon icon={faShare} />
                                                    </button>
                                                    <button className="w-10 h-10 bg-white/90 backdrop-blur-md shadow-lg rounded-xl flex items-center justify-center text-slate-700 hover:text-green-600 hover:scale-110 transition-all">
                                                        <FontAwesomeIcon icon={faDownload} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="px-1">
                                                <h3 className="text-sm font-bold text-slate-800 truncate mb-1">{file.name}</h3>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    IPFS: {file.hash.slice(0, 10)}...
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    )}
                    {isImageModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                            <div className="relative max-w-5xl w-full max-h-[90vh] bg-white rounded-[2.5rem] p-4 shadow-2xl overflow-hidden flex flex-col">
                                <div className="flex-grow overflow-auto custom-scrollbar flex items-center justify-center">
                                    <img src={selectedImage} alt="" className="max-w-full max-h-full rounded-2xl object-contain shadow-sm" />
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button 
                                        onClick={() => setImageModalOpen(false)} 
                                        className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-all active:scale-95"
                                    >
                                        Close Preview
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    <ShareModal isOpen={showModal} onClose={handleCloseModal} onShare={handleShareFile} senderId={userData.id} />
                </>
            )}
        </div>
    );
};

export default Photos;
