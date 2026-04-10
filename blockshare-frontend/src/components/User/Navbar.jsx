import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import BlockchainService from '../../services/BlockchainService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faWallet, faSignOutAlt, faBell, faUserCircle, faCheckCircle, faShare, faUpload, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const { logout, user, ethereumAddress, connectMetaMask, setEthereumAddress } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readStatus, setReadStatus] = useState({}); // Track read status by notification ID
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!user?.id) return;
        const response = await BlockchainService.getBlock(user.id);
        const activities = (response.data || [])
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5);
        
        const notifItems = activities.map(activity => ({
          id: activity.transaction_hash,
          message: activity.action,
          timestamp: activity.timestamp,
          type: activity.action.includes('uploaded') ? 'upload' : 
                 activity.action.includes('shared') ? 'share' :
                 activity.action.includes('revoked') ? 'revoke' : 'other',
        }));
        
        setNotifications(notifItems);
        
        // Load read status from localStorage
        const savedReadStatus = JSON.parse(localStorage.getItem(`notifications_read_${user.id}`) || '{}');
        
        // Clean up old read status that don't match current notifications
        const currentNotifIds = notifItems.map(n => n.id);
        const cleanedReadStatus = {};
        Object.keys(savedReadStatus).forEach(id => {
          if (currentNotifIds.includes(id)) {
            cleanedReadStatus[id] = savedReadStatus[id];
          }
        });
        
        setReadStatus(cleanedReadStatus);
        localStorage.setItem(`notifications_read_${user.id}`, JSON.stringify(cleanedReadStatus));
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    
    // Refresh every 10 seconds to reduce RPC load (was 5 seconds)
    const interval = setInterval(fetchNotifications, 10000);
    
    // Also listen for storage changes (when user performs actions)
    const handleStorageChange = () => {
      fetchNotifications();
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user?.id]);

  // Calculate unread count based on readStatus - Force recalculation
  const unreadCount = notifications.length > 0 
    ? notifications.filter(n => !readStatus[n.id]).length 
    : 0;

  const markAsRead = (id) => {
    const newReadStatus = { ...readStatus, [id]: true };
    setReadStatus(newReadStatus);
    // Save to localStorage
    localStorage.setItem(`notifications_read_${user.id}`, JSON.stringify(newReadStatus));
  };

  const markAllAsRead = () => {
    const newReadStatus = {};
    notifications.forEach(n => {
      newReadStatus[n.id] = true;
    });
    setReadStatus(newReadStatus);
    // Save to localStorage
    localStorage.setItem(`notifications_read_${user.id}`, JSON.stringify(newReadStatus));
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'upload': return faUpload;
      case 'share': return faShare;
      case 'revoke': return faTimesCircle;
      default: return faCheckCircle;
    }
  };

  const handleLogout = () => {
    success('Logging out... See you soon!');
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 500);
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case 'upload': return 'text-blue-500 bg-blue-50';
      case 'share': return 'text-emerald-500 bg-emerald-50';
      case 'revoke': return 'text-orange-500 bg-orange-50';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 py-3">
      <div className="max-w-screen-2xl mx-auto px-6 flex justify-between items-center">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </span>
            <input
              className="block w-full pl-11 pr-4 py-2.5 bg-slate-100 border-transparent rounded-2xl text-sm placeholder-slate-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all outline-none"
              type="text"
              placeholder="Search your secure files..."
              value={searchQuery}
              onChange={(e) => {
                const query = e.target.value;
                setSearchQuery(query);
                // Dispatch global search event
                window.dispatchEvent(new CustomEvent('globalSearch', { detail: query }));
              }}
            />
          </div>
        </div>

        {/* Action Area */}
        <div className="flex items-center space-x-6 ml-8">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all"
            >
              <FontAwesomeIcon icon={faBell} className="text-lg" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowNotifications(false)}
                />
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-20 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h3 className="font-bold text-slate-800">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <FontAwesomeIcon icon={faBell} className="text-3xl text-slate-300 mb-3" />
                        <p className="text-sm font-bold text-slate-500">No notifications yet</p>
                        <p className="text-xs text-slate-400 mt-1">Activity will appear here</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {notifications.map((notif) => (
                          <div 
                            key={notif.id}
                            onClick={() => markAsRead(notif.id)}
                            className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                              !readStatus[notif.id] ? 'bg-blue-50/30' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                getNotificationColor(notif.type)
                              }`}>
                                <FontAwesomeIcon icon={getNotificationIcon(notif.type)} className="text-sm" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 leading-tight mb-1">
                                  {notif.message}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {new Date(notif.timestamp).toLocaleString()}
                                </p>
                              </div>
                              {!readStatus[notif.id] && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Wallet Status */}
          <div className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-slate-100 rounded-2xl border border-slate-200/50">
            <FontAwesomeIcon icon={faWallet} className={ethereumAddress ? 'text-green-500' : 'text-slate-400'} />
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 leading-none mb-1">
                {ethereumAddress ? 'Network Active' : 'Web3 Status'}
              </p>
              {ethereumAddress ? (
                <p className="text-xs font-mono font-bold text-slate-800 leading-none">
                  {ethereumAddress.slice(0, 6)}...{ethereumAddress.slice(-4)}
                </p>
              ) : (
                <button
                  onClick={connectMetaMask}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 leading-none transition-colors"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3 border-l border-slate-200 pl-6">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-800 leading-none mb-1">{user?.username || 'User'}</p>
              <p className="text-xs text-slate-500 leading-none">{user?.email}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <FontAwesomeIcon icon={faUserCircle} className="text-xl" />
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Logout"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
