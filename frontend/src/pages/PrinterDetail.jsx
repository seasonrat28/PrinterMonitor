import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPrinterHistory } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Activity } from 'lucide-react';

const PrinterDetail = () => {
  const { id } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [id]);

  const fetchHistory = async () => {
    try {
      const data = await getPrinterHistory(id);
      
      // Format timestamps for chart
      const formattedData = data.map(record => {
        const date = new Date(record.timestamp);
        return {
          ...record,
          timeLabel: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
          fullDate: date.toLocaleString()
        };
      });

      setHistory(formattedData);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Determine if printer is monochrome based on history data
  const isMonochrome = history.length > 0 && history.every(h => 
    (!h.toner_cyan && !h.toner_magenta && !h.toner_yellow)
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/printers" className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)', padding: '0.5rem' }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="page-title">Printer Details & Trends</h1>
          <p className="page-subtitle">Historical data for Printer ID: {id}</p>
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading history...</div>
      ) : history.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Activity size={48} style={{ opacity: 0.3, margin: '0 auto 1rem', display: 'block' }} />
          <h3>No historical data yet.</h3>
          <p style={{ color: 'var(--text-muted)' }}>Click 'Refresh' on the printers list to generate data points.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Page Count Chart */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--info)' }}>Page Count Trend</h3>
            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="timeLabel" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '8px' }}
                    labelStyle={{ color: 'var(--text-main)' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="page_count" name="Total Pages" stroke="var(--primary-color)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Toner Levels Chart */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--success)' }}>Toner Depletion Trend (%)</h3>
            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="timeLabel" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="toner_black" name="Black" stroke="#94A3B8" strokeWidth={2} />
                  {!isMonochrome && (
                    <>
                      <Line type="monotone" dataKey="toner_cyan" name="Cyan" stroke="#06B6D4" strokeWidth={2} />
                      <Line type="monotone" dataKey="toner_magenta" name="Magenta" stroke="#EC4899" strokeWidth={2} />
                      <Line type="monotone" dataKey="toner_yellow" name="Yellow" stroke="#EAB308" strokeWidth={2} />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default PrinterDetail;
