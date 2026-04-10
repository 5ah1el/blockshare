import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileUpload, faShareAlt, faDownload, faHistory, faFolder, faUserFriends, faHomeUser, faPlus, faImages, faUser, faUserEdit, faCloud, faReceipt } from '@fortawesome/free-solid-svg-icons';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/app/dashboard/home', icon: faHomeUser, label: 'Home' },
    { path: '/app/dashboard/files', icon: faFolder, label: 'My Files' },
    { path: '/app/dashboard/photos', icon: faImages, label: 'My Photos' },
    { path: '/app/dashboard/my-shared-files', icon: faShareAlt, label: 'Shared Files' },
    { path: '/app/dashboard/shared-with-me', icon: faUserFriends, label: 'Shared with Me' },
    { path: '/app/dashboard/recent', icon: faHistory, label: 'Recent' },
    { path: '/app/dashboard/transaction', icon: faReceipt, label: 'Transactions' },
    { path: '/app/dashboard/profile', icon: faUser, label: 'Profile' },
  ];

  return (
    <div className="bg-slate-900 h-screen w-64 flex-shrink-0 flex flex-col border-r border-slate-800 shadow-2xl z-20">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
          <FontAwesomeIcon icon={faCloud} className="text-white text-xl" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">BlockShare</h1>
      </div>

      <div className="px-4 mb-6">
        <Link to="/app/dashboard/upload">
          <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/40 active:scale-95 group">
            <FontAwesomeIcon icon={faPlus} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>New Upload</span>
          </button>
        </Link>
      </div>

      <nav className="flex-grow px-4 overflow-y-auto custom-scrollbar space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className="block">
              <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-400 font-semibold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}>
                <FontAwesomeIcon icon={item.icon} className={`text-lg transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-blue-500' : 'text-slate-500'
                }`} />
                <span className="text-sm">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 mt-auto">
        <div className="text-center text-xs text-slate-600 font-medium">
          <p>BlockShare v1.0</p>
          <p className="mt-1">Group no. 33</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
