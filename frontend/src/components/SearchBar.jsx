import React from 'react';
import { Search, Filter, SortDesc, Star, LayoutGrid, List } from 'lucide-react';

const SearchBar = ({ 
  search, setSearch, 
  activeTab, setActiveTab, 
  viewMode, setViewMode,
  supplyFilter, setSupplyFilter,
  sortBy, setSortBy,
  favoritesCount, totalCount
}) => {
  return (
    <div className="floating-glass-bar animate-fade-in-up" style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
      position: 'sticky', top: '10px', zIndex: 10
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button 
          className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`} 
          onClick={() => setActiveTab('all')}
          style={{ padding: '0.4rem 1rem' }}
        >
          All ({totalCount})
        </button>
        <button 
          className={`btn ${activeTab === 'favorites' ? 'btn-primary' : 'btn-secondary'}`} 
          onClick={() => setActiveTab('favorites')}
          style={{ padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Star size={16} /> Favorites ({favoritesCount})
        </button>

        <div style={{ width: '1px', background: 'var(--card-border)', margin: '0 0.25rem' }} />

        <button
          className={`btn ${viewMode === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setViewMode('cards'); localStorage.setItem('dashboardViewMode', 'cards'); }}
          style={{ padding: '0.4rem 0.75rem' }}
          title="Cards View"
        >
          <LayoutGrid size={18} />
        </button>
        <button
          className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setViewMode('table'); localStorage.setItem('dashboardViewMode', 'table'); }}
          style={{ padding: '0.4rem 0.75rem' }}
          title="Table View"
        >
          <List size={18} />
        </button>
      </div>

      {/* Filters & Sorting */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <select 
            className="search-input" 
            value={supplyFilter} 
            onChange={(e) => setSupplyFilter(e.target.value)}
            style={{ padding: '0.4rem 0.75rem', width: 'auto', background: 'var(--bg-card)' }}
          >
            <option value="all">All Supplies</option>
            <option value="toner_20">Low Toner (≤ 20%)</option>
            <option value="toner_50">Toner (≤ 50%)</option>
            <option value="drum_20">Low Drum (≤ 20%)</option>
            <option value="drum_50">Drum (≤ 50%)</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SortDesc size={16} style={{ color: 'var(--text-muted)' }} />
          <select 
            className="search-input" 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '0.4rem 0.75rem', width: 'auto', background: 'var(--bg-card)' }}
          >
            <option value="ip_asc">IP (A → Z)</option>
            <option value="ip_desc">IP (Z → A)</option>
            <option value="name_asc">Name (A → Z)</option>
            <option value="name_desc">Name (Z → A)</option>
            <option value="toner_asc">Toner (Low → High)</option>
            <option value="toner_desc">Toner (High → Low)</option>
            <option value="drum_asc">Drum (Low → High)</option>
            <option value="drum_desc">Drum (High → Low)</option>
          </select>
        </div>

        <div className="search-wrapper" style={{ marginBottom: 0 }}>
          <Search className="search-icon" size={16} style={{ top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search IP or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: '220px', padding: '0.4rem 1rem 0.4rem 2.2rem' }}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
