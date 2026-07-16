import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      {/* SideNavBar */}
      <aside className="w-[256px] h-full fixed left-0 top-0 border-r border-glass-border bg-background/40 backdrop-blur-xl shadow-[0_0_20px_rgba(173,199,255,0.05)] flex flex-col py-lg z-50">
        <div className="px-lg mb-xl">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center neon-glow-indigo">
              <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md text-primary tracking-tight leading-none">PrinterMonitor</h1>
              <p className="font-label-micro text-label-micro text-on-surface-variant uppercase tracking-widest mt-1">Vigilance System</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-md space-y-2">
          <NavLink 
            to="/" 
            end
            className={({isActive}) => `flex items-center gap-md px-md py-3 rounded-lg font-bold transition-all active:scale-95 ${isActive ? 'text-primary border-r-2 border-primary bg-glow-indigo' : 'text-on-surface-variant font-medium hover:bg-surface-container-highest/50 hover:-translate-y-0.5'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span className="font-body-base text-body-base">Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/printers" 
            className={({isActive}) => `flex items-center gap-md px-md py-3 rounded-lg font-bold transition-all active:scale-95 ${isActive ? 'text-primary border-r-2 border-primary bg-glow-indigo' : 'text-on-surface-variant font-medium hover:bg-surface-container-highest/50 hover:-translate-y-0.5'}`}
          >
            <span className="material-symbols-outlined">print</span>
            <span className="font-body-base text-body-base">All Printers</span>
          </NavLink>

          <NavLink 
            to="/scanner" 
            className={({isActive}) => `flex items-center gap-md px-md py-3 rounded-lg font-bold transition-all active:scale-95 ${isActive ? 'text-primary border-r-2 border-primary bg-glow-indigo' : 'text-on-surface-variant font-medium hover:bg-surface-container-highest/50 hover:-translate-y-0.5'}`}
          >
            <span className="material-symbols-outlined">settings_remote</span>
            <span className="font-body-base text-body-base">Network Scanner</span>
          </NavLink>
          
          <NavLink 
            to="/reports" 
            className={({isActive}) => `flex items-center gap-md px-md py-3 rounded-lg font-bold transition-all active:scale-95 ${isActive ? 'text-primary border-r-2 border-primary bg-glow-indigo' : 'text-on-surface-variant font-medium hover:bg-surface-container-highest/50 hover:-translate-y-0.5'}`}
          >
            <span className="material-symbols-outlined">monitoring</span>
            <span className="font-body-base text-body-base">Reports</span>
          </NavLink>
          
          <a className="flex items-center gap-md px-md py-3 rounded-lg text-on-surface-variant font-medium hover:bg-surface-container-highest/50 hover:-translate-y-0.5 transition-all active:scale-95 cursor-not-allowed opacity-50">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-base text-body-base">Settings</span>
          </a>
        </nav>
        
        <div className="px-md mt-auto pt-lg border-t border-glass-border">
          {/* Admin profile removed since there is no login system */}
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="ml-[256px] flex-1 flex flex-col min-h-screen relative overflow-hidden">
        {/* TopAppBar */}
        <header className="fixed top-0 right-0 left-[256px] h-16 bg-background/40 backdrop-blur-xl border-b border-glass-border flex items-center justify-between px-lg z-40">
          <div className="flex items-center gap-md">
            <h2 className="font-headline-md text-headline-md text-primary font-bold">Fleet Operations Hub</h2>
            <div className="h-4 w-px bg-glass-border"></div>
            <div className="flex items-center gap-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              <span className="font-label-mono text-label-mono uppercase tracking-widest">{new Date().toLocaleString('th-TH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-lg">
            <div className="relative group">
              <input className="bg-surface-container/50 border-none rounded-full py-1.5 pl-10 pr-4 text-body-base font-body-base focus:ring-1 focus:ring-primary w-64 transition-all" placeholder="Search fleet..." type="text" />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-hover:text-primary">search</span>
            </div>
            <div className="flex items-center gap-md">
              <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer">notifications</button>
              <div className="relative">
                <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="pt-24 px-lg pb-lg flex-1 overflow-y-auto z-10 space-y-lg relative">
          <Outlet />
        </div>

        {/* Background Atmospheric Element */}
        <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -mr-48 -mb-48 z-0"></div>
        <div className="fixed top-1/4 left-1/4 w-[300px] h-[300px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none z-0"></div>
      </main>
    </div>
  );
};

export default MainLayout;
