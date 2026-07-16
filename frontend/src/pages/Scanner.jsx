import React, { useState, useEffect, useRef } from 'react';
import { scanAndSavePrinters } from '../services/api';

const Scanner = () => {
  const [network, setNetwork] = useState(localStorage.getItem('printerNetwork') || '10.119.35');
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [mapDots, setMapDots] = useState([]);
  
  const mapRef = useRef(null);
  const logContainerRef = useRef(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (text, type = 'normal') => {
    const now = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setLogs(prev => [...prev, { time: now, text, type }]);
  };

  const startScan = async () => {
    const prefix = network.trim();
    if (!/^\d{1,3}(?:\.\d{1,3}){2}$/.test(prefix)) {
      addLog("ERROR: Invalid network format. Use format like 10.119.35", "error");
      return;
    }

    if (isScanning) {
      addLog("Network scan aborted by operator.", "primary-bold");
      setIsScanning(false);
      return;
    }

    setIsScanning(true);
    setLogs([]);
    setDiscoveredDevices([]);
    setMapDots([]);
    
    addLog("Starting intensive deep scan protocol...", "primary-bold");
    addLog(`Targeting network: ${prefix}.0/24`);
    addLog("Initializing Network Discovery Module...");
    
    localStorage.setItem('printerNetwork', prefix);

    // Simulate dots while waiting for API
    const dotInterval = setInterval(() => {
      setMapDots(prev => [...prev, {
        id: Date.now(),
        left: `${Math.random() * 80 + 10}%`,
        top: `${Math.random() * 80 + 10}%`
      }]);
    }, 1500);

    // Simulate scanning logs
    const logPool = [
      "Syncing neural packet relay...",
      "Decrypting discovery broadcast...",
      "Trace route mapped for gateway segment",
      "Filtering noise from environmental interference...",
      "Mapping logical topology..."
    ];
    let count = 0;
    const logInterval = setInterval(() => {
      addLog(logPool[count % logPool.length]);
      count++;
    }, 2000);

    try {
      // Call actual API
      const found = await scanAndSavePrinters(prefix, 1, 254);
      clearInterval(dotInterval);
      clearInterval(logInterval);
      
      addLog(`Full network scan completed. ${found.length} active nodes identified.`, "success");
      setDiscoveredDevices(found);
    } catch (error) {
      clearInterval(dotInterval);
      clearInterval(logInterval);
      addLog("Critical failure during network scan protocol.", "error");
    } finally {
      setIsScanning(false);
    }
  };

  const handleMouseMove = (e) => {
    if (mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mapRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(79, 134, 247, 0.05) 0%, transparent 60%)`;
    }
  };

  return (
    <div className="flex-col gap-lg pb-md relative z-10" style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '2rem' }}>
      {/* Network Targeting Controls */}
      <section className="glass-panel p-md flex-row flex-wrap gap-md relative z-20" style={{ alignItems: 'flex-end' }}>
        <div className="flex-col gap-xs" style={{ width: '100%', maxWidth: '250px' }}>
          <label className="text-micro text-accent" style={{ color: 'var(--accent-primary)' }}>IP Range (ช่วง IP)</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute text-muted" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>settings_ethernet</span>
            <input 
              className="input-field text-mono" 
              style={{ paddingLeft: '2.5rem', background: 'rgba(0,0,0,0.3)' }}
              type="text" 
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              disabled={isScanning}
            />
          </div>
        </div>
        <div className="flex-col gap-xs" style={{ width: '100%', maxWidth: '250px' }}>
          <label className="text-micro text-accent" style={{ color: 'var(--accent-primary)' }}>Subnet Mask</label>
          <select className="input-field text-mono" style={{ background: 'rgba(0,0,0,0.3)', appearance: 'none', cursor: 'pointer' }}>
            <option>255.255.255.0 (/24)</option>
            <option>255.255.0.0 (/16)</option>
          </select>
        </div>
        <button 
          className="btn text-mono text-micro"
          style={{ 
            height: '42px', 
            background: isScanning ? 'var(--status-offline)' : 'var(--accent-primary)',
            color: '#fff',
            boxShadow: isScanning ? 'none' : '0 4px 14px 0 rgba(79, 134, 247, 0.39)'
          }}
          onClick={startScan}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{isScanning ? 'stop' : 'radar'}</span>
          {isScanning ? 'ยกเลิกการสแกน' : 'เริ่มการสแกนตอนนี้'}
        </button>
      </section>

      {/* Radar Visualization */}
      <section className="glass-panel relative overflow-hidden flex-center group" style={{ height: '450px', borderRadius: 'var(--radius-xl)' }} ref={mapRef} onMouseMove={handleMouseMove}>
        {/* Radar Rings */}
        <div className="absolute" style={{ top: 0, left: 0, right: 0, bottom: 0, opacity: 0.15, pointerEvents: 'none' }}>
          <div className="absolute flex-center" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
            <div style={{ width: '700px', height: '700px', border: '1px solid var(--accent-primary)', borderRadius: '50%', position: 'absolute' }}></div>
            <div style={{ width: '500px', height: '500px', border: '1px solid var(--accent-primary)', borderRadius: '50%', position: 'absolute' }}></div>
            <div style={{ width: '300px', height: '300px', border: '1px solid var(--accent-primary)', borderRadius: '50%', position: 'absolute' }}></div>
            <div style={{ width: '100px', height: '100px', border: '1px solid var(--accent-primary)', borderRadius: '50%', position: 'absolute' }}></div>
            <div style={{ position: 'absolute', width: '2px', height: '350px', background: 'linear-gradient(to top, rgba(79, 134, 247, 0.8), transparent)', transformOrigin: 'bottom center', animation: 'spin 4s linear infinite', top: '50%', left: '50%', transform: 'translate(-50%, -100%)' }}></div>
          </div>
        </div>

        {/* Map Nodes */}
        <div className="relative z-10 w-full h-full">
          {/* Central Scanner Node */}
          <div className="absolute flex-col flex-center" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <div className="flex-center relative" style={{ width: '64px', height: '64px', background: 'rgba(79, 134, 247, 0.2)', border: '2px solid var(--accent-primary)', borderRadius: '50%', boxShadow: '0 0 30px rgba(79, 134, 247, 0.3)' }}>
              <span className="material-symbols-outlined icon-filled text-accent" style={{ fontSize: '32px' }}>dns</span>
              {isScanning && <div className="absolute" style={{ top: 0, left: 0, right: 0, bottom: 0, borderRadius: '50%', background: 'rgba(79, 134, 247, 0.3)', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>}
            </div>
            <p className="text-mono text-micro text-accent mt-sm p-xs" style={{ background: 'rgba(10,10,15,0.8)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>PRINTERMONITOR_SCANNER</p>
          </div>
          
          {/* Dynamic Map Dots */}
          {mapDots.map(dot => (
            <div key={dot.id} className="absolute transition-normal" style={{ left: dot.left, top: dot.top, opacity: 0.7 }}>
              <div style={{ width: '8px', height: '8px', background: 'var(--accent-secondary)', borderRadius: '50%', animation: 'pulse 2s infinite', boxShadow: '0 0 10px var(--accent-secondary)' }}></div>
            </div>
          ))}
        </div>

        {/* Overlay Status Info */}
        <div className="absolute flex-col gap-sm" style={{ bottom: '1.5rem', left: '1.5rem' }}>
          <div className="flex-row gap-sm p-sm" style={{ background: 'rgba(10, 10, 15, 0.8)', backdropFilter: 'blur(4px)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isScanning ? 'var(--accent-secondary)' : 'var(--text-muted)', boxShadow: isScanning ? '0 0 10px var(--accent-secondary)' : 'none', animation: isScanning ? 'pulse 2s infinite' : 'none' }}></div>
            <span className="text-mono text-micro">สถานะ: {isScanning ? 'กำลังสแกน...' : 'สแตนด์บาย'}</span>
          </div>
          {discoveredDevices.length > 0 && (
            <div className="text-mono text-micro text-muted px-sm">
              NODES FOUND: <span className="text-accent font-bold">{discoveredDevices.length}</span>
            </div>
          )}
        </div>

        <div className="absolute flex-row gap-lg" style={{ bottom: '1.5rem', right: '1.5rem' }}>
          <div className="flex-row gap-sm">
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-primary)' }}></span>
            <span className="text-mono text-micro">Found</span>
          </div>
          <div className="flex-row gap-sm">
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-secondary)', animation: 'pulse 2s infinite' }}></span>
            <span className="text-mono text-micro">Scanning</span>
          </div>
          <div className="flex-row gap-sm">
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--text-muted)' }}></span>
            <span className="text-mono text-micro">Inactive</span>
          </div>
        </div>
      </section>

      {/* Logs & Discovery */}
      <section className="grid grid-cols-2 gap-lg" style={{ marginTop: '2rem' }}>
        {/* Live Execution Logs */}
        <div className="glass-panel flex-col" style={{ height: '360px', overflow: 'hidden' }}>
          <div className="flex-between p-md" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
            <span className="text-mono text-micro text-accent font-bold">Live Execution Logs</span>
            <div className="flex-row gap-xs">
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isScanning ? 'var(--accent-primary)' : 'rgba(255,255,255,0.2)', animation: isScanning ? 'pulse 1.5s infinite' : 'none' }}></div>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></div>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></div>
            </div>
          </div>
          <div ref={logContainerRef} className="flex-1 p-md text-mono" style={{ fontSize: '12px', lineHeight: '1.8', overflowY: 'auto', background: 'rgba(0,0,0,0.4)' }}>
            {logs.length === 0 && <p className="text-muted" style={{ fontStyle: 'italic', opacity: 0.6 }}>System ready. Waiting for operator command...</p>}
            {logs.map((log, i) => {
              let color = 'var(--text-secondary)';
              let fw = 'normal';
              if (log.type === 'primary-bold') { color = 'var(--accent-primary)'; fw = 'bold'; }
              else if (log.type === 'success') { color = 'var(--status-online)'; fw = 'bold'; }
              else if (log.type === 'error') { color = 'var(--status-offline)'; fw = 'bold'; }
              return (
                <p key={i} style={{ color, fontWeight: fw, marginBottom: '0.25rem' }}>
                  [{log.time}] {log.text}
                </p>
              );
            })}
          </div>
        </div>

        {/* Newly Discovered Devices */}
        <div className="glass-panel flex-col" style={{ height: '360px' }}>
          <div className="flex-between p-md" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
            <span className="text-mono text-micro text-accent font-bold">Newly Discovered Devices</span>
            <span className="text-mono text-micro text-accent" style={{ background: 'rgba(79, 134, 247, 0.2)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{discoveredDevices.length} DETECTED</span>
          </div>
          <div className="flex-1 p-md flex-col gap-md" style={{ overflowY: 'auto' }}>
            {discoveredDevices.length === 0 && !isScanning && (
              <div className="flex-center h-full">
                <div className="text-mono text-muted text-center" style={{ opacity: 0.6 }}>
                  No new devices found. Run a scan to populate this list.
                </div>
              </div>
            )}
            {discoveredDevices.length === 0 && isScanning && (
              <div className="flex-center h-full">
                <div className="text-mono text-muted text-center flex-col flex-center">
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', marginBottom: '0.5rem', animation: 'spin 2s linear infinite' }}>sync</span>
                  <p>Scanning network blocks...</p>
                </div>
              </div>
            )}
            
            {discoveredDevices.map(d => (
              <div key={d.ip_address} className="flex-between p-md transition-normal" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <div className="flex-row gap-md">
                  <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(79, 134, 247, 0.1)', color: 'var(--accent-primary)' }}>
                    <span className="material-symbols-outlined icon-filled" style={{ fontSize: '28px' }}>print</span>
                  </div>
                  <div className="flex-col gap-xs">
                    <h4 className="text-body" style={{ fontWeight: '600' }}>{d.model || d.hostname || 'Unidentified Node'}</h4>
                    <p className="text-mono text-micro">IP: {d.ip_address}</p>
                  </div>
                </div>
                <button className="btn btn-secondary text-mono text-micro">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                  เพิ่มในระบบ
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Summary Info Box */}
      <div className="p-lg flex-row gap-lg" style={{ marginTop: '2rem', background: 'rgba(79, 134, 247, 0.05)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(79, 134, 247, 0.2)' }}>
        <div className="flex-center" style={{ padding: '0.75rem', background: 'rgba(79, 134, 247, 0.1)', borderRadius: '50%' }}>
          <span className="material-symbols-outlined text-accent">info</span>
        </div>
        <p className="text-body text-muted">
          ระบบจะบันทึกอุปกรณ์ที่เลือกไว้ในระบบจัดการวัสดุสิ้นเปลืองโดยอัตโนมัติ โดยโปรโตคอล <span className="text-accent" style={{ fontWeight: 'bold' }}>SNMP v3</span> จะถูกเปิดใช้งานสำหรับอุปกรณ์เหล่านี้เพื่อการตรวจสอบสถานะแบบเรียลไทม์
        </p>
      </div>
    </div>
  );
};

export default Scanner;
