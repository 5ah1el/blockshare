import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faFolderOpen, faShieldAlt, faHistory, faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
    const { user } = useAuth();

    const features = [
        {
            title: 'Upload Files',
            desc: 'Securely upload files to our blockchain-based cloud storage with high-end encryption.',
            icon: faCloudUploadAlt,
            color: 'blue',
            link: '/app/dashboard/upload'
        },
        {
            title: 'Manage Storage',
            desc: 'Access and manage your uploaded files with ease and full transparency.',
            icon: faFolderOpen,
            color: 'indigo',
            link: '/app/dashboard/files'
        },
        {
            title: 'Web3 Security',
            desc: 'All actions are transparently recorded on the blockchain for immutable tracking.',
            icon: faShieldAlt,
            color: 'emerald',
            link: '/app/dashboard/transaction'
        },
        {
            title: 'Recent Activity',
            desc: 'Stay informed about recent activity related to your files and sharing status.',
            icon: faHistory,
            color: 'purple',
            link: '/app/dashboard/recent'
        }
    ];

    return (
        <div className="space-y-10 py-6">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 lg:p-16 text-white shadow-2xl shadow-blue-500/20">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl lg:text-6xl font-black mb-6 tracking-tight leading-tight">
                        Secure. Decentralized. <br/>
                        <span className="text-blue-200">Your Data, Your Control.</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-blue-50/80 mb-10 leading-relaxed font-medium">
                        Welcome back, <span className="text-white font-bold">{user?.username || 'User'}</span>. 
                        Experience the next generation of file sharing powered by Ethereum and IPFS.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link to="/app/dashboard/upload" className="px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-all flex items-center space-x-2 active:scale-95 shadow-lg">
                            <span>Get Started</span>
                            <FontAwesomeIcon icon={faArrowRight} />
                        </Link>
                        <Link to="/app/dashboard/files" className="px-8 py-4 bg-blue-500/20 text-white font-bold rounded-2xl border border-white/20 hover:bg-blue-500/30 transition-all backdrop-blur-md active:scale-95">
                            Browse Files
                        </Link>
                    </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, idx) => (
                    <Link key={idx} to={feature.link} className="group">
                        <div className="h-full p-8 bg-white border border-slate-200 rounded-[2rem] card-hover transition-all group-hover:border-blue-500/30">
                            <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center bg-${feature.color}-50 text-${feature.color}-600 group-hover:scale-110 transition-transform duration-300`}>
                                <FontAwesomeIcon icon={feature.icon} className="text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-slate-500 leading-relaxed text-sm font-medium">
                                {feature.desc}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Team Members Section */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-10 lg:p-12 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <p className="text-blue-400 font-black tracking-widest uppercase text-[10px] mb-3">The Minds Behind BlockShare</p>
                        <h2 className="text-3xl lg:text-4xl font-black mb-3 tracking-tight">
                            Meet Our Team
                        </h2>
                        <p className="text-slate-400 font-medium max-w-2xl mx-auto">
                            Group no. 33 - Innovating decentralized storage solutions for the future
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: 'Seemi', role: 'Team Member', color: 'from-blue-500 to-indigo-600' },
                            { name: 'Sahiel', role: 'Team Member', color: 'from-emerald-500 to-teal-600' },
                            { name: 'Jayesh', role: 'Team Member', color: 'from-purple-500 to-pink-600' },
                            { name: 'Aarati', role: 'Team Member', color: 'from-orange-500 to-red-600' }
                        ].map((member, idx) => (
                            <div key={idx} className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-1">
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                    <span className="text-2xl font-black text-white">
                                        {member.name.charAt(0)}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-center mb-1">{member.name}</h3>
                                <p className="text-sm text-slate-400 text-center font-medium">{member.role}</p>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-10 text-center">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            <span className="text-sm font-bold text-blue-300">Proudly presented by Group no. 33</span>
                        </div>
                    </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
}
