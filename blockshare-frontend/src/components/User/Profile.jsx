import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faEnvelope, faShieldAlt, faCalendarAlt, faKey, faWallet, faCheckCircle, faSignOutAlt, faSpinner, faCube, faUpload, faShareAlt, faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import UserService from '../../services/UserService';
import BlockchainService from '../../services/BlockchainService';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../../context/ToastContext';

const Profile = () => {
    const { user, ethereumAddress, setEthereumAddress } = useAuth();
    const { success, error, warning } = useToast();
    const [loading, setLoading] = useState(false);
    const [blockchainStats, setBlockchainStats] = useState({ uploads: 0, shares: 0, total: 0 });
    
    // Retrieve user data from localStorage as fallback
    const userData = user || JSON.parse(localStorage.getItem('user'));
    
    // Fetch blockchain stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                if (!userData?.id) return;
                const response = await BlockchainService.getBlock(userData.id);
                const activities = response.data || [];
                
                const uploads = activities.filter(a => a.action.includes('uploaded')).length;
                const shares = activities.filter(a => a.action.includes('shared')).length;
                
                setBlockchainStats({
                    uploads,
                    shares,
                    total: activities.length
                });
            } catch (error) {
                console.error('Error fetching blockchain stats:', error);
            }
        };
        
        fetchStats();
    }, [userData?.id]);

    // Check if user data exists
    if (!userData || !userData.username || !userData.email) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6">
                    <FontAwesomeIcon icon={faShieldAlt} className="text-4xl" />
                </div>
                <h1 className="text-2xl font-black text-slate-800 mb-2">Session Expired</h1>
                <p className="text-slate-500 font-medium">Please log in again to access your profile.</p>
            </div>
        );
    }

    const { username, email } = userData;

    const handleConnectWallet = async () => {
        if (!window.ethereum) {
            error('MetaMask is not installed. Please install MetaMask extension.');
            return;
        }

        setLoading(true);

        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const newAddress = accounts[0];
            
            if (!userData?.id) {
                error('User not logged in. Please log in again.');
                return;
            }

            await UserService.updateUserAddress(userData.id, newAddress);
            setEthereumAddress(newAddress);
            localStorage.setItem('ethereum_address', newAddress);
            
            success('Wallet connected successfully!');
        } catch (err) {
            console.error('Error connecting wallet:', err);
            if (err.code === 4001) {
                warning('Wallet connection rejected by user.');
            } else {
                error('Failed to connect wallet: ' + (err.message || 'Unknown error'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnectWallet = async () => {
        setEthereumAddress(null);
        localStorage.removeItem('ethereum_address');
        success('Wallet disconnected successfully!');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-4">
            <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Profile</h2>
                <p className="text-slate-500 font-medium mt-1">Manage your profile and blockchain wallet</p>
            </div>

            <div className="relative px-8">
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 lg:p-12">
                    <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8 mb-12">
                        <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-slate-100 to-slate-200 p-1 shadow-lg relative group">
                            <div className="w-full h-full rounded-[1.8rem] bg-white flex items-center justify-center overflow-hidden">
                                <FontAwesomeIcon icon={faUserCircle} className="text-7xl text-slate-300 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <button className="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95">
                                <FontAwesomeIcon icon={faKey} className="text-xs" />
                            </button>
                        </div>
                        <div className="text-center md:text-left pb-2">
                            <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-2">{username}</h2>
                            <p className="text-slate-500 font-bold flex items-center justify-center md:justify-start">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                                Verified Web3 User
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center">
                                <FontAwesomeIcon icon={faShieldAlt} className="mr-3 text-blue-500" />
                                Account Details
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-blue-200 transition-colors">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</p>
                                    <div className="flex items-center space-x-3">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-slate-400" />
                                        <p className="font-bold text-slate-700">{email}</p>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-blue-200 transition-colors">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Member Since</p>
                                    <div className="flex items-center space-x-3">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="text-slate-400" />
                                        <p className="font-bold text-slate-700">April 2026</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center">
                                <FontAwesomeIcon icon={faWallet} className="mr-3 text-orange-500" />
                                Web3 Wallet
                            </h3>
                            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Connected Wallet</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-mono font-bold text-slate-700 break-all pr-2">
                                                    {ethereumAddress || 'No wallet connected'}
                                                </p>
                                                {ethereumAddress && (
                                                    <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500 text-lg flex-shrink-0" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={handleConnectWallet}
                                                disabled={loading || ethereumAddress}
                                                className={`py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg ${
                                                    loading || ethereumAddress
                                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:scale-[1.02] active:scale-95 shadow-emerald-500/20'
                                                }`}
                                            >
                                                {loading ? (
                                                    <div className="animate-spin rounded-full h-5 w-5 border-3 border-white/30 border-t-white"></div>
                                                ) : (
                                                    <>
                                                        <FontAwesomeIcon icon={faWallet} />
                                                        <span>Connect Wallet</span>
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                onClick={handleDisconnectWallet}
                                                disabled={!ethereumAddress}
                                                className={`py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg ${
                                                    !ethereumAddress
                                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                                        : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:scale-[1.02] active:scale-95 shadow-rose-500/20'
                                                }`}
                                            >
                                                <FontAwesomeIcon icon={faSignOutAlt} />
                                                <span>Disconnect</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-100/30 rounded-full blur-3xl"></div>
                            </div>
                        </div>
                    </div>

                    {/* Blockchain Network Stats */}
                    <div className="mt-8 p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center space-x-4 mb-8">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                    <FontAwesomeIcon icon={faNetworkWired} className="text-2xl" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight">Blockchain Activity</h3>
                                    <p className="text-slate-400 text-sm font-medium">Your on-chain footprint</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <FontAwesomeIcon icon={faCube} className="text-blue-400 text-xl" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total</span>
                                    </div>
                                    <p className="text-3xl font-black">{blockchainStats.total}</p>
                                    <p className="text-xs text-slate-400 font-medium mt-1">Transactions</p>
                                </div>
                                
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <FontAwesomeIcon icon={faUpload} className="text-emerald-400 text-xl" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Uploads</span>
                                    </div>
                                    <p className="text-3xl font-black">{blockchainStats.uploads}</p>
                                    <p className="text-xs text-slate-400 font-medium mt-1">Files Stored</p>
                                </div>
                                
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <FontAwesomeIcon icon={faShareAlt} className="text-purple-400 text-xl" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Shares</span>
                                    </div>
                                    <p className="text-3xl font-black">{blockchainStats.shares}</p>
                                    <p className="text-xs text-slate-400 font-medium mt-1">Shared Files</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-bold text-slate-300">Network Status</span>
                                </div>
                                <span className="text-xs font-mono font-bold text-emerald-400">Ganache Local Chain</span>
                            </div>
                        </div>
                        <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;