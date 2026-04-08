import React, { useState, useEffect } from 'react';
import BlockchainService from '../../services/BlockchainService';
import { useAuth } from '../auth/AuthProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faCheckCircle, faTimesCircle, faClock, faCube, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

export default function RecentActivities() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                if (!user?.id) return; // Ensure user and its id exist before fetching
                const response = await BlockchainService.getBlock(user.id);
                // Sort by timestamp descending and take the first 10
                const sortedActivities = (response.data || [])
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .slice(0, 10);
                setActivities(sortedActivities);
            } catch (error) {
                console.error('Error fetching recent activities:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) { // More robust check
            fetchActivities();
        }
    }, [user?.id]); // Update dependency array for robustness

    return (
        <div className="space-y-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Recent Activities</h2>
                    <p className="text-slate-500 font-medium mt-1">Real-time ledger of your blockchain operations</p>
                </div>
                <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 shadow-sm">
                    {activities.length} Events Logged
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-slate-500 font-bold animate-pulse">Synchronizing with blockchain...</p>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    {activities.length === 0 ? (
                        <div className="p-20 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <FontAwesomeIcon icon={faHistory} className="text-4xl" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No activities yet</h3>
                            <p className="text-slate-500 max-w-sm mx-auto font-medium">
                                Your blockchain journey starts here. Upload or share a file to see it recorded on the ledger!
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {activities.map((activity, index) => (
                                <div key={index} className="p-6 hover:bg-slate-50/50 transition-colors group">
                                    <div className="flex items-center space-x-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${
                                            activity.status === 'Success' 
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                                : 'bg-rose-50 text-rose-600 border border-rose-100'
                                        }`}>
                                            <FontAwesomeIcon icon={activity.status === 'Success' ? faCheckCircle : faTimesCircle} className="text-xl" />
                                        </div>
                                        
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center space-x-3 mb-1">
                                                <h4 className="text-lg font-bold text-slate-800 truncate">
                                                    {activity.action}
                                                </h4>
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                                    activity.status === 'Success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                    {activity.status}
                                                </span>
                                            </div>
                                            
                                            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                <div className="flex items-center space-x-2">
                                                    <FontAwesomeIcon icon={faClock} className="text-slate-300" />
                                                    <span>{new Date(activity.timestamp).toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <FontAwesomeIcon icon={faCube} className="text-slate-300" />
                                                    <span className="text-slate-500">Block #{activity.block_number}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 truncate max-w-[200px] lg:max-w-none">
                                                    <span className="text-slate-300">TX:</span>
                                                    <span className="font-mono text-[10px] lowercase">{activity.transaction_hash}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button className="p-3 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all active:scale-95" title="View on Block Explorer">
                                            <FontAwesomeIcon icon={faExternalLinkAlt} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}