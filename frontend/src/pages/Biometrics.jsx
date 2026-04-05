import { useState } from 'react';

export default function Biometrics() {
  const [syncingOura, setSyncingOura] = useState(false);
  const [lastSync, setLastSync] = useState(localStorage.getItem('lastSync') || '2 hours ago');

  const handleMockSync = () => {
    setSyncingOura(true);
    setTimeout(() => {
      // Simulate real HRV generation based on typical Oura/Apple Watch exports
      const mockMetrics = {
        HRV_RMSSD: (Math.random() * 40 + 20).toFixed(1),   // 20-60 ms
        HRV_MeanNN: (Math.random() * 200 + 750).toFixed(1), // 750-950 ms
        HRV_SDNN: (Math.random() * 50 + 30).toFixed(1),    // 30-80 ms
        HRV_LF: (Math.random() * 0.05 + 0.02).toFixed(3),
        HRV_HF: (Math.random() * 0.03 + 0.01).toFixed(3),
        HRV_LFHF: (Math.random() * 2.5 + 0.8).toFixed(2),  // 0.8 to 3.3
      };
      
      localStorage.setItem('syncedMetrics', JSON.stringify(mockMetrics));
      const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      localStorage.setItem('lastSync', `Today at ${time}`);
      setLastSync(`Today at ${time}`);
      setSyncingOura(false);
      alert('✅ Watch data successfully synced! Navigate to the Predictions tab to analyze your latest readings.');
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="mb-8 border-b border-outline-variant/20 pb-4">
        <h1 className="text-4xl font-headline font-extrabold tracking-tight">Devices & Integrations</h1>
        <p className="text-on-surface-variant mt-2">Manage connected wearables that supply your autonomic data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl custom-shadow border border-primary/30 flex flex-col items-center text-center gap-4 relative overflow-hidden transition-all hover:border-primary">
           <div className="absolute top-0 w-full bg-primary text-on-primary text-[10px] uppercase tracking-widest py-1 font-bold">Connected</div>
           <span className="material-symbols-outlined text-5xl text-primary mt-4">watch</span>
           <h3 className="font-headline font-bold text-lg">Oura Ring Gen3</h3>
           <p className="text-xs text-on-surface-variant">Syncing: HRV, HR, Sleep Stages</p>
           
           <div className="mt-2 w-full flex flex-col gap-2">
             <button 
                onClick={handleMockSync}
                disabled={syncingOura}
                className="w-full bg-primary/10 text-primary py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50">
                {syncingOura ? 'Syncing...' : 'Force Sync Data'}
             </button>
             <p className="text-[10px] text-outline font-medium">Last synced: {lastSync}</p>
           </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 flex flex-col items-center text-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
           <span className="material-symbols-outlined text-5xl text-outline mt-4">watch</span>
           <h3 className="font-headline font-bold text-lg text-outline">Apple Watch Ultra</h3>
           <p className="text-xs text-on-surface-variant">Syncing: HRV, HR</p>
           <button className="mt-4 px-4 py-2 border-2 border-outline-variant text-xs font-bold uppercase tracking-widest rounded-lg hover:border-primary hover:text-primary transition-colors">Connect Apple Health API</button>
        </div>

        <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 flex flex-col items-center text-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
           <span className="material-symbols-outlined text-5xl text-outline mt-4">watch</span>
           <h3 className="font-headline font-bold text-lg text-outline">Garmin Epix</h3>
           <p className="text-xs text-on-surface-variant">Syncing: HRV, HR, Body Battery</p>
           <button className="mt-4 px-4 py-2 border-2 border-outline-variant text-xs font-bold uppercase tracking-widest rounded-lg hover:border-primary hover:text-primary transition-colors">Connect ConnectIQ API</button>
        </div>
      </div>
    </div>
  )
}
