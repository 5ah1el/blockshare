import React, { useState } from 'react';
import UserService from '../../services/UserService';
import { useAuth } from '../auth/AuthProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faWallet, faUser, faBell, faLock, faShieldAlt, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export default function Setting() {
    const { user, ethereumAddress, setEthereumAddress } = useAuth();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleUpdateAddress = async () => {
        if (!window.ethereum) {
            alert('MetaMask not installed');
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const newAddress = accounts[0];
            
            if (!user?.id) {
                setStatus({ type: 'error', message: 'User not logged in. Please log in again.' });
                return;
            }

            await UserService.updateUserAddress(user.id, newAddress); // Safely access user.id
            setEthereumAddress(newAddress);
            localStorage.setItem('ethereum_address', newAddress);
            
            setStatus({ type: 'success', message: 'Blockchain address synchronized successfully!' });
        } catch (error) {
            console.error('Error updating address:', error);
            setStatus({ type: 'error', message: 'Failed to sync address: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 py-4">
            <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">System Settings</h2>
                <p className="text-slate-500 font-medium mt-1">Configure your account and blockchain preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 lg:p-10">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                <FontAwesomeIcon icon={faUser} className="text-xl" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Identity Details</h3>
                                <p className="text-slate-400 text-sm font-medium">Your platform profile information</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                                <div className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-bold">
                                    {user?.username || '---'}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-bold">
                                    {user?.email || '---'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 lg:p-10">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                                <FontAwesomeIcon icon={faWallet} className="text-xl" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Web3 Connectivity</h3>
                                <p className="text-slate-400 text-sm font-medium">Manage your Ethereum wallet integration</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative overflow-hidden">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">Active Wallet Address</label>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-mono font-bold text-slate-800 break-all pr-4">
                                        {ethereumAddress || 'No wallet connected'}
                                    </p>
                                    {ethereumAddress && (
                                        <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500 text-xl" />
                                    )}
                                </div>
                                {/* Abstract background shape */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-100/30 rounded-full"></div>
                            </div>

                            <button
                                onClick={handleUpdateAddress}
                                disabled={loading}
                                className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center space-x-3 shadow-xl ${
                                    loading 
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:scale-[1.02] active:scale-95 shadow-orange-500/20'
                                }`}
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-4 border-white/30 border-t-white"></div>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faWallet} />
                                        <span>{ethereumAddress ? 'Resync MetaMask Wallet' : 'Connect MetaMask Wallet'}</span>
                                    </>
                                )}
                            </button>

                            {status.message && (
                                <div className={`p-4 rounded-2xl text-sm font-bold flex items-center space-x-3 border ${
                                    status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                                }`}>
                                    <div className={`w-2 h-2 rounded-full ${status.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                    <span>{status.message}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                                <FontAwesomeIcon icon={faShieldAlt} className="text-xl text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Security Audit</h3>
                            <p className="text-slate-400 text-sm font-medium mb-6">Your data is secured using industry-standard AES-256 and RSA-4096 encryption.</p>
                            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all active:scale-95">
                                View Security Logs
                            </button>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                            <FontAwesomeIcon icon={faBell} className="mr-3 text-slate-400" />
                            Preferences
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Email Notifications', active: true },
                                { label: 'Transaction Alerts', active: true },
                                { label: 'Weekly Reports', active: false }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-600">{item.label}</span>
                                    <div className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${item.active ? 'bg-blue-600' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${item.active ? 'right-1' : 'left-1'}`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}