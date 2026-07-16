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
      mapRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(173, 199, 255, 0.05) 0%, transparent 60%)`;
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-lg relative z-10 pb-md">
      {/* Network Targeting Controls */}
      <section className="glass-panel rounded-xl p-md flex flex-wrap md:flex-nowrap items-end gap-md relative z-20">
        <div className="w-full md:w-64 space-y-xs">
          <label className="font-label-mono text-[10px] text-primary uppercase tracking-widest block">ช่วง IP สำหรับการสแกน</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 text-base">settings_ethernet</span>
            <input 
              className="w-full bg-surface-container-lowest border-none rounded-lg py-2 pl-10 pr-3 font-label-mono text-base text-on-surface focus:ring-2 focus:ring-primary/30 transition-all" 
              type="text" 
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              disabled={isScanning}
            />
          </div>
        </div>
        <div className="w-full md:w-64 space-y-xs">
          <label className="font-label-mono text-[10px] text-primary uppercase tracking-widest block">Subnet Mask</label>
          <select className="w-full bg-surface-container-lowest border-none rounded-lg py-2 px-3 font-label-mono text-base text-on-surface focus:ring-2 focus:ring-primary/30 transition-all appearance-none cursor-pointer">
            <option>255.255.255.0 (/24)</option>
            <option>255.255.0.0 (/16)</option>
          </select>
        </div>
        <button 
          className={`h-10 px-lg font-bold rounded-lg flex items-center justify-center gap-sm transition-all ${isScanning ? 'bg-error-container text-on-error-container' : 'bg-primary text-on-primary hover:shadow-[0_0_20px_rgba(173,199,255,0.4)] active:scale-95'}`}
          onClick={startScan}
        >
          <span className="material-symbols-outlined text-base">{isScanning ? 'stop' : 'radar'}</span>
          <span className="font-label-mono text-xs uppercase tracking-widest">{isScanning ? 'ยกเลิกการสแกน' : 'เริ่มการสแกนตอนนี้'}</span>
        </button>
      </section>

      {/* Radar Visualization */}
      <section className="grid grid-cols-12 gap-lg h-[450px]">
        <div 
          className="col-span-12 glass-panel rounded-xl relative overflow-hidden flex items-center justify-center group"
          ref={mapRef}
          onMouseMove={handleMouseMove}
        >
          {/* Radar Rings */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[700px] h-[700px] border border-primary/40 rounded-full"></div>
              <div className="w-[500px] h-[500px] border border-primary/40 rounded-full"></div>
              <div className="w-[300px] h-[300px] border border-primary/40 rounded-full"></div>
              <div className="w-[100px] h-[100px] border border-primary/40 rounded-full"></div>
              <div className="absolute w-1 h-[350px] bg-gradient-to-t from-primary/60 to-transparent radar-sweep"></div>
            </div>
          </div>

          {/* Map Nodes */}
          <div className="relative z-10 w-full h-full">
            {/* Central Scanner Node */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-16 h-16 bg-primary-container/30 border-2 border-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(173,199,255,0.3)] relative">
                <span className="material-symbols-outlined text-primary text-3xl">dns</span>
                {isScanning && <div className="absolute inset-0 rounded-full bg-primary/20 ping-pulse"></div>}
              </div>
              <p className="mt-2 font-label-mono text-label-micro text-primary font-bold bg-surface-container-high px-2 py-0.5 rounded border border-glass-border">PRINTERMONITOR_SCANNER</p>
            </div>
            
            {/* Dynamic Map Dots */}
            {mapDots.map(dot => (
              <div key={dot.id} className="absolute opacity-50 hover:opacity-100 transition-opacity" style={{ left: dot.left, top: dot.top }}>
                <div className="w-2 h-2 bg-primary rounded-full animate-ping shadow-[0_0_8px_#adc7ff]"></div>
              </div>
            ))}
          </div>

          {/* Overlay Status Info */}
          <div className="absolute bottom-6 left-6 flex flex-col gap-sm">
            <div className="flex items-center gap-sm bg-surface-container-highest/80 backdrop-blur px-md py-sm rounded-lg border border-glass-border">
              <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-secondary-container shadow-[0_0_10px_#00f1fe] animate-pulse' : 'bg-outline'}`}></div>
              <span className="font-label-mono text-label-micro uppercase">สถานะ: {isScanning ? 'กำลังสแกน...' : 'สแตนด์บาย'}</span>
            </div>
            {discoveredDevices.length > 0 && (
              <div className="text-on-surface-variant font-label-mono text-label-micro px-1">
                NODES FOUND: <span className="text-primary font-bold">{discoveredDevices.length}</span>
              </div>
            )}
          </div>

          <div className="absolute bottom-6 right-6 flex items-center gap-lg">
            <div className="flex items-center gap-sm">
              <span className="w-3 h-3 rounded-full bg-primary"></span>
              <span className="font-label-mono text-label-micro">Found</span>
            </div>
            <div className="flex items-center gap-sm">
              <span className="w-3 h-3 rounded-full bg-secondary-container animate-pulse"></span>
              <span className="font-label-mono text-label-micro">Scanning</span>
            </div>
            <div className="flex items-center gap-sm">
              <span className="w-3 h-3 rounded-full bg-outline"></span>
              <span className="font-label-mono text-label-micro">Inactive</span>
            </div>
          </div>
        </div>
      </section>

      {/* Logs & Discovery */}
      <section className="grid grid-cols-12 gap-lg">
        {/* Live Execution Logs */}
        <div className="col-span-12 lg:col-span-5 glass-panel rounded-xl flex flex-col overflow-hidden h-[360px]">
          <div className="bg-surface-container-high px-lg py-sm flex items-center justify-between border-b border-glass-border">
            <span className="font-label-mono text-label-micro text-primary uppercase font-bold tracking-widest">Live Execution Logs</span>
            <div className="flex gap-xs">
              <div className={`w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-primary/80 animate-pulse' : 'bg-primary/30'}`}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/30"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/30"></div>
            </div>
          </div>
          <div ref={logContainerRef} className="flex-1 p-lg font-label-mono text-[12px] leading-relaxed space-y-1 overflow-y-auto bg-surface-lowest/50">
            {logs.length === 0 && <p className="text-on-surface-variant italic opacity-50">System ready. Waiting for operator command...</p>}
            {logs.map((log, i) => {
              let colorClass = 'text-on-surface-variant';
              if (log.type === 'primary-bold') colorClass = 'text-primary font-bold';
              else if (log.type === 'success') colorClass = 'text-secondary-container font-bold';
              else if (log.type === 'error') colorClass = 'text-error font-bold';
              return (
                <p key={i} className={colorClass}>
                  [{log.time}] {log.text}
                </p>
              );
            })}
          </div>
        </div>

        {/* Newly Discovered Devices */}
        <div className="col-span-12 lg:col-span-7 glass-panel rounded-xl flex flex-col h-[360px]">
          <div className="bg-surface-container-high px-lg py-sm flex items-center justify-between border-b border-glass-border">
            <span className="font-label-mono text-label-micro text-primary uppercase font-bold tracking-widest">Newly Discovered Devices (อุปกรณ์ที่พบใหม่)</span>
            <span className="bg-primary/20 text-primary font-label-micro px-2 py-0.5 rounded-full">{discoveredDevices.length} DETECTED</span>
          </div>
          <div className="flex-1 p-lg overflow-y-auto space-y-md">
            {discoveredDevices.length === 0 && !isScanning && (
              <div className="text-center text-on-surface-variant font-label-mono mt-12 opacity-50">
                No new devices found. Run a scan to populate this list.
              </div>
            )}
            {discoveredDevices.length === 0 && isScanning && (
              <div className="text-center text-on-surface-variant font-label-mono mt-12">
                <span className="material-symbols-outlined text-4xl mb-2 spin inline-block">sync</span>
                <p>Scanning network blocks...</p>
              </div>
            )}
            
            {discoveredDevices.map(d => (
              <div key={d.ip_address} className="flex items-center justify-between p-md bg-surface-container/50 border border-glass-border rounded-lg hover:border-primary/40 transition-colors group">
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-3xl">print</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">{d.model || d.hostname || 'Unidentified Node'}</h4>
                    <p className="text-xs font-label-mono text-on-surface-variant">IP: {d.ip_address}</p>
                  </div>
                </div>
                <button className="flex items-center gap-sm px-md py-2 bg-surface-container-highest rounded border border-glass-border text-on-surface hover:bg-primary hover:text-on-primary hover:border-primary transition-all font-label-mono text-label-micro uppercase tracking-tight">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  เพิ่มในระบบ
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Summary Info Box */}
      <div className="p-lg bg-primary/5 rounded-xl border border-primary/20 flex items-center gap-lg">
        <div className="p-md bg-primary/10 rounded-full">
          <span className="material-symbols-outlined text-primary">info</span>
        </div>
        <p className="text-on-surface-variant leading-relaxed">
          ระบบจะบันทึกอุปกรณ์ที่เลือกไว้ในระบบจัดการวัสดุสิ้นเปลืองโดยอัตโนมัติ โดยโปรโตคอล <span className="text-primary font-bold">SNMP v3</span> จะถูกเปิดใช้งานสำหรับอุปกรณ์เหล่านี้เพื่อการตรวจสอบสถานะแบบเรียลไทม์
        </p>
      </div>
    </div>
  );
};

export default Scanner;
