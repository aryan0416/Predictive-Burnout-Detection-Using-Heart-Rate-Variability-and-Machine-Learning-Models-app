import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('predictionHistory') || '[]');
    setHistory(saved);
  }, []);

  const totalTests = history.length;
  const recentTest = history[0];

  const currentStatus = recentTest ? (recentTest.prediction === 1 ? 'Elevated' : 'Optimal') : 'Pending Data';
  const statusColor = recentTest ? (recentTest.prediction === 1 ? 'text-error' : 'text-primary') : 'text-outline';
  
  // Data for chart (Reverse to show oldest to newest)
  const chartData = [...history].reverse().map((item, idx) => ({
    name: `Test ${idx + 1}`,
    RMSSD: parseFloat(item.metrics.HRV_RMSSD),
    LFHF: parseFloat(item.metrics.HRV_LFHF)
  }));

  const handleDownloadCSV = () => {
    if (history.length === 0) {
      alert("No data available to download.");
      return;
    }
    const headers = ["Date", "Time", "Prediction", "Confidence", "RMSSD", "MeanNN", "SDNN", "LF", "HF", "LFHF"];
    const rows = history.map(item => [
      item.date,
      item.time,
      item.status,
      (item.confidence * 100).toFixed(1) + "%",
      item.metrics.HRV_RMSSD,
      item.metrics.HRV_MeanNN,
      item.metrics.HRV_SDNN,
      item.metrics.HRV_LF,
      item.metrics.HRV_HF,
      item.metrics.HRV_LFHF
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Ethereal_Burnout_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to permanently delete all prediction history and synced metrics?")) {
      localStorage.removeItem('predictionHistory');
      localStorage.removeItem('syncedMetrics');
      localStorage.removeItem('lastSync');
      setHistory([]);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end mb-8 border-b border-outline-variant/20 pb-4">
        <div>
          <h1 className="text-4xl font-headline font-extrabold tracking-tight">Overview Dashboard</h1>
          <p className="text-on-surface-variant mt-2">Welcome back. Here is your latest physiological summary.</p>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={handleClearHistory} className="text-error font-bold uppercase tracking-widest text-[10px] hover:underline px-2 transition-all">Clear Data</button>
            <button onClick={handleDownloadCSV} className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold custom-shadow hover:brightness-105 transition-all text-sm">Download Weekly CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-surface-container-lowest p-6 rounded-xl custom-shadow border border-outline-variant/10 flex flex-col gap-2">
            <span className="material-symbols-outlined text-primary mb-2">favorite</span>
            <span className="text-sm font-semibold tracking-widest uppercase text-on-surface-variant">Last Reading RMSSD</span>
            <span className="text-3xl font-extrabold font-headline text-on-surface">
              {recentTest ? recentTest.metrics.HRV_RMSSD : '--'} <span className="text-lg font-medium text-outline">ms</span>
            </span>
         </div>
         <div className="bg-surface-container-lowest p-6 rounded-xl custom-shadow border border-outline-variant/10 flex flex-col gap-2">
            <span className="material-symbols-outlined text-secondary mb-2">history</span>
            <span className="text-sm font-semibold tracking-widest uppercase text-on-surface-variant">Total Predictions</span>
            <span className="text-3xl font-extrabold font-headline text-on-surface">{totalTests}</span>
         </div>
         <div className="bg-surface-container-lowest p-6 rounded-xl custom-shadow border border-outline-variant/10 flex flex-col gap-2">
            <span className="material-symbols-outlined text-error mb-2">bolt</span>
            <span className="text-sm font-semibold tracking-widest uppercase text-on-surface-variant">Current Stress Status</span>
            <span className={`text-3xl font-extrabold font-headline ${statusColor}`}>{currentStatus}</span>
         </div>
      </div>
      
      {/* Chart Section */}
      <div className="bg-surface-container-lowest p-8 rounded-xl custom-shadow border border-outline-variant/10">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-xl font-bold font-headline">Physiological Trajectory</h3>
           <span className="text-xs font-medium text-on-surface-variant bg-surface-container py-1 px-3 rounded-full">RMSSD vs LF/HF</span>
        </div>
        
        {totalTests > 1 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="name" fontSize={12} stroke="#9ca3af" tickMargin={10} />
                <YAxis yAxisId="left" fontSize={10} stroke="#9ca3af" tickMargin={10} />
                <YAxis yAxisId="right" orientation="right" fontSize={10} stroke="#9ca3af" tickMargin={10} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Line yAxisId="left" type="monotone" dataKey="RMSSD" stroke="#4e6354" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="RMSSD (ms)" />
                <Line yAxisId="right" type="monotone" dataKey="LFHF" stroke="#ba1a1a" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="LF/HF Ratio" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 w-full flex flex-col items-center justify-center text-on-surface-variant opacity-70 bg-surface-container/30 rounded-lg">
             <span className="material-symbols-outlined text-5xl mb-3">auto_graph</span>
             <p className="text-sm font-medium">Insufficient data. Complete at least 2 predictions to unlock trajectory mapping.</p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-7 bg-surface-container-lowest p-8 rounded-xl custom-shadow border border-outline-variant/10">
          <h3 className="text-xl font-bold font-headline mb-6">Recent Prediction History</h3>
          {history.length > 0 ? (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {history.map((item, i) => (
                <div key={item.id || i} className="flex items-center justify-between p-4 border border-outline-variant/20 rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-bold text-on-surface">{item.date} {item.time}</span>
                    <span className="text-xs text-on-surface-variant">Conf: {(item.confidence*100).toFixed(1)}% | LF/HF: {item.metrics.HRV_LFHF}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${item.prediction === 1 ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-on-surface-variant opacity-70">
              <span className="material-symbols-outlined text-6xl mb-2">monitoring</span>
              <p>No predictions recorded yet. Sync data and run a prediction.</p>
            </div>
          )}
        </div>

        <div className="md:col-span-5 bg-surface-container p-8 rounded-xl flex flex-col gap-4 border-t-4 border-primary">
           <span className="material-symbols-outlined text-4xl text-primary mt-1">insights</span>
           <div>
              <h3 className="text-xl font-bold font-headline mb-2">Ready for deeper analysis?</h3>
              <p className="text-on-surface-variant mb-6 text-sm">Input your latest HRV parameters into the Predictions module or sync from a wearable device first.</p>
              <div className="flex flex-col gap-3">
                <Link to="/biometrics" className="w-full text-center bg-surface-container-lowest text-on-surface border border-outline-variant/30 py-3 rounded-lg font-bold tracking-wide hover:bg-surface-variant transition-all custom-shadow text-sm">1. Sync Wearable Data</Link>
                <Link to="/predictions" className="w-full text-center bg-primary text-on-primary py-3 rounded-lg font-bold tracking-wide hover:brightness-105 transition-all custom-shadow text-sm">2. Analyze the Sync</Link>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
