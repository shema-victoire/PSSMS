import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth';

const Menubar = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <Link to={currentUser ? "/dashboard" : "/login"} className="font-bold text-xl">SmartPark</Link>
          </div>
          <div className="hidden md:flex space-x-4">
            {currentUser && (
              <>
                <Link to="/dashboard" className="px-3 py-2 hover:bg-blue-700 rounded">Dashboard</Link>
                <Link to="/cars" className="px-3 py-2 hover:bg-blue-700 rounded">Cars</Link>
                <div className="relative group">
                  <button className="px-3 py-2 hover:bg-blue-700 rounded">Parking</button>
                  <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                    <Link to="/parkingslots" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Slots</Link>
                    <Link to="/parkingrecords" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Records</Link>
                    <Link to="/pspayments" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Payments</Link>
                  </div>
                </div>
                <Link to="/reports" className="px-3 py-2 hover:bg-blue-700 rounded">Reports</Link>
                {isAdmin && (
                  <Link to="/admin" className="px-3 py-2 hover:bg-blue-700 rounded">Admin</Link>
                )}
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm">{currentUser.username}</span>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">Login</Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div className="md:hidden">
        {currentUser && (
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/dashboard" className="block px-3 py-2 text-white hover:bg-blue-700 rounded">Dashboard</Link>
            <Link to="/cars" className="block px-3 py-2 text-white hover:bg-blue-700 rounded">Cars</Link>
            <Link to="/parkingslots" className="block px-3 py-2 text-white hover:bg-blue-700 rounded">Parking Slots</Link>
            <Link to="/parkingrecords" className="block px-3 py-2 text-white hover:bg-blue-700 rounded">Parking Records</Link>
            <Link to="/pspayments" className="block px-3 py-2 text-white hover:bg-blue-700 rounded">Payments</Link>
            <Link to="/reports" className="block px-3 py-2 text-white hover:bg-blue-700 rounded">Reports</Link>
            {isAdmin && (
              <Link to="/admin" className="block px-3 py-2 text-white hover:bg-blue-700 rounded">Admin</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Menubar; 