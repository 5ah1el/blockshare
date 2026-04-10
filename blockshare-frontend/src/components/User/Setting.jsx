import React, { useState } from 'react';
import UserService from '../../services/UserService';
import { useAuth } from '../auth/AuthProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faWallet, faUser, faBell, faLock, faShieldAlt, faCheckCircle, faUserCircle, faEnvelope, faCalendarAlt, faKey } from '@fortawesome/free-solid-svg-icons';

export default function Setting() {
    const { user, ethereumAddress, setEthereumAddress } = useAuth();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'settings'

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
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Settings</h2>
                <p className="text-slate-500 font-medium mt-1">Manage your profile and account preferences</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-fit">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                        activeTab === 'profile'
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                            : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <FontAwesomeIcon icon={faUserCircle} className="mr-2" />
                    Profile
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                        activeTab === 'settings'
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                            : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <FontAwesomeIcon icon={faGear} className="mr-2" />
                    Settings
                </button>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="max-w-4xl space-y-8">
                    {/* Profile Header Card */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-700">
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
                        </div>

                        <div className="relative -mt-24 px-8 pb-8">
                            <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8 mb-8">
                                <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-slate-100 to-slate-200 p-1 shadow-lg">
                                    <div className="w-full h-full rounded-[1.8rem] bg-white flex items-center justify-center overflow-hidden">
                                        <FontAwesomeIcon icon={faUserCircle} className="text-7xl text-slate-300" />
                                    </div>
                                </div>
                                <div className="text-center md:text-left pb-2">
                                    <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-2">{user?.username || 'User'}</h2>
                                    <p className="text-slate-500 font-bold flex items-center justify-center md:justify-start">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                                        Verified Web3 User
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</p>
                                    <div className="flex items-center space-x-3">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-slate-400" />
                                        <p className="font-bold text-slate-700">{user?.email || '---'}</p>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Member Since</p>
                                    <div className="flex items-center space-x-3">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="text-slate-400" />
                                        <p className="font-bold text-slate-700">April 2026</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Card */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 lg:p-10 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                    <FontAwesomeIcon icon={faShieldAlt} className="text-xl text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Platform Security</h3>
                                    <p className="text-slate-400 text-sm font-medium">Your data is protected</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 font-medium mb-6 leading-relaxed">
                                Your account is protected by decentralized identity protocols. No private keys are stored on our servers.
                            </p>
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30 text-[10px] font-black tracking-widest uppercase">
                                    AES-256
                                </div>
                                <div className="px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30 text-[10px] font-black tracking-widest uppercase">
                                    ECDSA
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
                    </div>
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Web3 Connectivity Card */}
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
            )}
        </div>
    );
}