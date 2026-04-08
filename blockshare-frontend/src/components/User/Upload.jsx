import React, { useState } from 'react';
import FileService from '../../services/FileService';
import BlockchainService from '../../services/BlockchainService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faShieldAlt, faWallet, faHistory } from '@fortawesome/free-solid-svg-icons';

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [status, setStatus] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    const ethereumAddress = localStorage.getItem('ethereum_address');
    if (!ethereumAddress) {
      alert('Please connect your MetaMask wallet first!');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setStatus('Uploading to IPFS...');

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
     
      if (!userData || !userData.id) {
        throw new Error('User information not found.');
      }

      // 1. Upload to Backend -> Local IPFS
      const uploadResponse = await FileService.uploadFile(selectedFile, userData.id, ethereumAddress);
      const ipfsHash = uploadResponse.ipfs_hash;
      
      // 2. Trigger Blockchain Transaction via MetaMask
      setStatus('Please confirm transaction in MetaMask...');
      const receipt = await BlockchainService.uploadFile(ipfsHash);
      console.log('Blockchain receipt:', receipt);
      
      // 3. Record Transaction in Backend DB
      setStatus('Recording transaction...');
      await BlockchainService.recordTransaction(
        userData.id, 
        ipfsHash, 
        receipt.hash, 
        ethereumAddress
      );

      setStatus('');
      alert(`File "${selectedFile.name}" uploaded and recorded on blockchain!`);
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload process failed:', error);
      setUploadError(error.message || 'Error during upload process. Please try again.');
      setStatus('');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    setSelectedFile(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Upload to Blockchain</h2>
        <p className="text-slate-500 font-medium">Your files are encrypted before leaving your browser</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-500/5 border border-slate-100 p-8 lg:p-12">
        <div 
          className={`relative group cursor-pointer transition-all duration-300 rounded-[2rem] border-4 border-dashed flex flex-col items-center justify-center min-h-[300px] p-10 ${
            selectedFile 
              ? 'border-blue-500 bg-blue-50/30' 
              : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/20'
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
          />
          
          <div className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center transition-all duration-300 ${
            selectedFile ? 'bg-blue-500 text-white scale-110 shadow-lg' : 'bg-white text-slate-400 group-hover:text-blue-500 shadow-md'
          }`}>
            <FontAwesomeIcon icon={selectedFile ? faCloudUploadAlt : faCloudUploadAlt} className="text-3xl" />
          </div>

          {selectedFile ? (
            <div className="text-center space-y-2">
              <p className="text-xl font-bold text-slate-800">{selectedFile.name}</p>
              <p className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full inline-block">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-slate-400 text-sm font-medium pt-4">Click to change file</p>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-xl font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                Drag & drop your file here
              </p>
              <p className="text-slate-400 font-medium">or click to browse from your device</p>
            </div>
          )}

          {/* Decorative corners */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-slate-200 rounded-tl-lg group-hover:border-blue-300 transition-colors"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-slate-200 rounded-tr-lg group-hover:border-blue-300 transition-colors"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-slate-200 rounded-bl-lg group-hover:border-blue-300 transition-colors"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-slate-200 rounded-br-lg group-hover:border-blue-300 transition-colors"></div>
        </div>

        <div className="mt-10 space-y-6">
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center space-x-3 shadow-xl ${
              uploading || !selectedFile 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-[1.02] active:scale-95 shadow-blue-500/25'
            }`}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-4 border-white/30 border-t-white"></div>
                <span>Processing Transaction...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faShieldAlt} />
                <span>Secure Upload to Blockchain</span>
              </>
            )}
          </button>

          {status && (
            <div className="flex items-center justify-center space-x-3 p-4 bg-blue-50 rounded-2xl text-blue-700 font-bold text-sm animate-pulse border border-blue-100">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>{status}</span>
            </div>
          )}

          {uploadError && (
            <div className="p-4 bg-red-50 rounded-2xl text-red-600 font-bold text-sm border border-red-100 flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: faShieldAlt, title: 'AES-256 Encryption', desc: 'End-to-end encrypted storage' },
          { icon: faWallet, title: 'Web3 Verified', desc: 'Immutable ownership records' },
          { icon: faHistory, title: 'Real-time Sync', desc: 'Instant blockchain indexing' }
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
              <FontAwesomeIcon icon={item.icon} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
              <p className="text-slate-500 text-xs font-medium">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Upload;
