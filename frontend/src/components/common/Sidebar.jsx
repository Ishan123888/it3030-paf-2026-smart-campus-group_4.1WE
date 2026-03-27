import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { name: 'Overview', path: '/dashboard', icon: '📊' },
    { name: 'Bookings', path: '/dashboard/bookings', icon: '📅' },
    { name: 'Incidents', path: '/dashboard/incidents', icon: '⚠️' },
    { name: 'Resources', path: '/dashboard/resources', icon: '📦' },
    { name: 'Notifications', path: '/dashboard/notifications', icon: '🔔' },
  ];

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen hidden md:block">
      <div className="p-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Main Menu</h2>
        <nav className="mt-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;