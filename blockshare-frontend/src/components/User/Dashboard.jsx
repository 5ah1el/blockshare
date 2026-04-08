import React from 'react'
import { useAuth } from '../auth/AuthProvider';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import Upload from './Upload';

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-grow relative">
        <Navbar />
        <main className="flex-grow p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-screen-2xl mx-auto">
            {/* Removed ErrorBoundary as it was for debugging */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
