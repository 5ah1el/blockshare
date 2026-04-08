import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faWallet, faSignOutAlt, faBell, faUserCircle } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const { logout, user, ethereumAddress, connectMetaMask } = useAuth();

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
            />
          </div>
        </div>

        {/* Action Area */}
        <div className="flex items-center space-x-6 ml-8">
          {/* Notifications */}
          <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all">
            <FontAwesomeIcon icon={faBell} className="text-lg" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

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
              onClick={logout}
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
