'use client';
import { useState, useEffect } from 'react';

// menuItems array stays the same as before...

export default function Sidebar({ user, activeSection, setActiveSection, sidebarOpen, setSidebarOpen, onNotify }) {
  const [isMobile, setIsMobile] = useState(false);
  
  // profileColor logic: uses the real user ID or a default[cite: 4]
  const profileColor = 'bg-purple-400'; 

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the session
    window.location.href = '/login';   // Send back to login
  };

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          {/* w-12 h-12: Width and Height (48px). flex-shrink-0: Prevents the circle from squishing */}
          <div className={`w-12 h-12 rounded-full ${profileColor} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            {/* text-gray-900: Dark text. font-semibold: Boldness level 600 */}
            <p className="font-semibold text-gray-900 text-sm truncate">{user?.name || 'Loading...'}</p>
            <p className="text-xs text-gray-500">ID: #{user?.patientId || '00000'}</p>
          </div>
        </div>
      </div>
      {/* Navigation Menu code remains the same... */}
    </>
  );
}
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white flex-col border-r border-gray-200 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      {isMobile && sidebarOpen && (
        <aside className="fixed left-0 top-0 w-64 h-screen bg-white flex flex-col z-50 lg:hidden shadow-lg">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Menu</h3>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sidebarContent}
          </div>
        </aside>
      )}
    </>
  );
