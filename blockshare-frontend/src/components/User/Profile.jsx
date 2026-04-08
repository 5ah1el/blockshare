import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faEnvelope, faShieldAlt, faCalendarAlt, faKey } from '@fortawesome/free-solid-svg-icons';

const Profile = () => {
    // Retrieve user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user'));

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

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-4">
            <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] shadow-2xl shadow-blue-500/20 overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative -mt-24 px-8">
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
                                <FontAwesomeIcon icon={faShieldAlt} className="mr-3 text-indigo-500" />
                                Platform Security
                            </h3>
                            <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden h-full">
                                <div className="relative z-10">
                                    <p className="text-sm text-slate-400 font-medium mb-6 leading-relaxed">
                                        Your account is protected by decentralized identity protocols. No private keys are stored on our servers.
                                    </p>
                                    <div className="flex items-center space-x-3 mb-8">
                                        <div className="px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30 text-[10px] font-black tracking-widest uppercase">
                                            AES-256
                                        </div>
                                        <div className="px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30 text-[10px] font-black tracking-widest uppercase">
                                            ECDSA
                                        </div>
                                    </div>
                                    <button className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-2">
                                        <span>Manage Security Keys</span>
                                        <FontAwesomeIcon icon={faKey} className="text-xs" />
                                    </button>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;