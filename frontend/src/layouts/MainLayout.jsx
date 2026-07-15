import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Printer, Settings } from 'lucide-react';

const MainLayout = () => {
  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Printer className="icon" size={28} />
          <span>PrinterMonitor</span>
        </div>

        <nav className="nav-menu">
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end
          >
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          
          <NavLink 
            to="/printers" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Printer size={20} />
            All Printers
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
