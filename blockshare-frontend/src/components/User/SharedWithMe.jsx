import React, { useState, useEffect } from 'react';
import FileService from '../../services/FileService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faDownload, faUserFriends, faHistory, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import FileDisplayModal from './Modals/FileDisplayModal';
import { Link } from 'react-router-dom';

const SharedWithMe = () => {
  const [sharedFiles, setSharedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isFileDisplayModalOpen, setFileDisplayModalOpen] = useState(false);
  const userData = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchSharedWithMe = async () => {
      try {
        if (!userData?.id) {
          setLoading(false);
          return;
        }
        setLoading(true);
        const response = await FileService.getSharedWithMe(userData.id);
        // Check if response has data array or error
        if (response && response.data && Array.isArray(response.data)) {
          setSharedFiles(response.data);
        } else {
          // If API returns error message, set empty array
          setSharedFiles([]);
        }
      } catch (error) {
        console.error('Error fetching files shared with me:', error);
        // Set empty array on error instead of crashing
        setSharedFiles([]);
        setError('Error fetching shared files');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedWithMe();
  }, [userData?.id]);

  const handleFileClick = (file) => {
    setSelectedFile(file);
    setFileDisplayModalOpen(true);
  };

  const handleDownload = (file) => {
    try {
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
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (e) {
        console.error("Download failed:", e);
        alert("Failed to download file");
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Shared With Me</h2>
          <p className="text-slate-500 font-medium mt-1">Access files shared with your wallet address</p>
        </div>
        <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 shadow-sm">
          {sharedFiles?.length || 0} Files
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-500 font-bold animate-pulse">Retrieving shared access...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-100 p-8 rounded-[2rem] text-center">
            <p className="text-rose-600 font-bold">{error}</p>
        </div>
      ) : !sharedFiles || sharedFiles.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-16 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                <FontAwesomeIcon icon={faUserFriends} className="text-4xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No shared files yet</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium">
                When someone shares a file with you on the blockchain, it will automatically appear here.
            </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sharedFiles.map((file, index) => (
            <div key={index} className="group bg-white border border-slate-200 rounded-[2rem] p-5 card-hover relative overflow-hidden flex flex-col h-full">
              {/* Preview Area */}
              <div className="aspect-video w-full bg-slate-50 rounded-2xl mb-4 overflow-hidden relative group-hover:shadow-inner transition-shadow">
                <embed src={`data:${file.file_type};base64,${file.content}`} className="w-full h-full object-cover pointer-events-none" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors pointer-events-none"></div>
                
                {/* Quick Actions Overlay */}
                <div className="absolute top-3 right-3 flex flex-col space-y-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                  {file.access_level === 'download' && (
                    <button 
                      onClick={() => handleDownload(file)}
                      className="w-10 h-10 bg-white shadow-lg rounded-xl flex items-center justify-center text-slate-600 hover:text-blue-600 hover:scale-110 transition-all"
                      title="Download"
                    >
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                  )}
                </div>
              </div>

              {/* Info Area */}
              <div className="flex-grow">
                <h3 className="text-lg font-bold text-slate-800 truncate mb-1" title={file.filename}>
                  {file.filename}
                </h3>
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md">{file.file_type?.split('/')[1] || 'FILE'}</span>
                  <span>•</span>
                  <span>{file.access_level} Access</span>
                </div>
                <div className="mt-4 flex items-center text-[10px] font-bold text-slate-500">
                    <FontAwesomeIcon icon={faHistory} className="mr-2 text-slate-300" />
                    Shared by {file.owner_username}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleFileClick(file)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors flex items-center justify-center space-x-2"
                >
                  <FontAwesomeIcon icon={faEye} className="text-xs" />
                  <span>View Content</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <FileDisplayModal isOpen={isFileDisplayModalOpen} onClose={() => setFileDisplayModalOpen(false)} selectedFile={selectedFile} />
    </div>
  );
};

export default SharedWithMe;
