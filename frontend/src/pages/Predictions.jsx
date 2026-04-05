import { useState, useEffect } from 'react'

export default function Predictions() {
  const [formData, setFormData] = useState({
    HRV_RMSSD: '',
    HRV_MeanNN: '',
    HRV_SDNN: '',
    HRV_LF: '',
    HRV_HF: '',
    HRV_LFHF: ''
  })

  useEffect(() => {
    const synced = localStorage.getItem('syncedMetrics');
    if (synced) {
      try {
        setFormData(JSON.parse(synced));
      } catch (e) {}
    }
  }, []);
  
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [grokAnalysis, setGrokAnalysis] = useState(null)
  const [grokLoading, setGrokLoading] = useState(false)
  const [grokError, setGrokError] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePredict = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setGrokAnalysis(null)
    setGrokError(null)
    
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          HRV_RMSSD: parseFloat(formData.HRV_RMSSD),
          HRV_MeanNN: parseFloat(formData.HRV_MeanNN),
          HRV_SDNN: parseFloat(formData.HRV_SDNN),
          HRV_LF: parseFloat(formData.HRV_LF),
          HRV_HF: parseFloat(formData.HRV_HF),
          HRV_LFHF: parseFloat(formData.HRV_LFHF),
        })
      })
      
      const data = await response.json()
      if (data.error) {
        setError(data.error)
      } else {
        setResult(data)
        
        // Append to dashboard history
        const newRecord = {
          id: Date.now(),
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          prediction: data.prediction,
          status: data.status,
          confidence: data.confidence,
          metrics: formData
        };
        const history = JSON.parse(localStorage.getItem('predictionHistory') || '[]');
        localStorage.setItem('predictionHistory', JSON.stringify([newRecord, ...history].slice(0, 15)));
      }
    } catch (err) {
      setError("Failed to connect to the backend. Is it running?")
    } finally {
      setLoading(false)
    }
  }

  const handleGrokAnalysis = async () => {
    setGrokLoading(true)
    setGrokError(null)
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE}/grok-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: result.status,
          confidence: result.confidence,
          metrics: formData
        })
      })
      const data = await response.json()
      if (data.error) {
        setGrokError(data.error)
      } else {
        setGrokAnalysis(data.analysis)
      }
    } catch (err) {
      setGrokError("Failed to fetch Grok analysis. Check backend logs.")
    } finally {
      setGrokLoading(false)
    }
  }

  return (
      <>
        <div className="mb-12">
          <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface mb-2">Predictive Wellness</h1>
          <p className="text-on-surface-variant text-lg max-w-xl">Harness clinical-grade HRV metrics to anticipate physiological burnout before it impacts your performance.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: HRV Input Form */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <section className="glass-panel p-10 rounded-xl custom-shadow border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>monitor_heart</span>
                <h2 className="text-xl font-bold font-headline tracking-tight">Biometric Profile</h2>
              </div>
              
              <form className="space-y-6" onSubmit={handlePredict}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="group relative">
                    <label className="block text-xs font-semibold tracking-widest uppercase text-on-surface-variant mb-2 ml-1 cursor-help" title="Root Mean Square of Successive Differences. A primary measure of parasympathetic (vagal) activity. Higher means better recovery.">RMSSD ⓘ</label>
                    <input required name="HRV_RMSSD" value={formData.HRV_RMSSD} onChange={handleChange} className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 focus:ring-1 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" placeholder="e.g., 45.2" type="number" step="any"/>
                    <div className="hidden group-hover:block absolute z-10 w-48 p-2 mt-1 -ml-4 text-[10px] bg-inverse-surface text-inverse-on-surface rounded shadow-xl leading-snug">Primary measure of parasympathetic recovery. Higher is generally better.</div>
                  </div>
                  <div className="group relative">
                    <label className="block text-xs font-semibold tracking-widest uppercase text-on-surface-variant mb-2 ml-1 cursor-help" title="Average time between normal heartbeats. Inversely related to heart rate.">Mean NN ⓘ</label>
                    <input required name="HRV_MeanNN" value={formData.HRV_MeanNN} onChange={handleChange} className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 focus:ring-1 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" placeholder="e.g., 850.5" type="number" step="any"/>
                    <div className="hidden group-hover:block absolute z-10 w-48 p-2 mt-1 -ml-4 text-[10px] bg-inverse-surface text-inverse-on-surface rounded shadow-xl leading-snug">Average time between heartbeats in milliseconds. Inverse of HR.</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="group relative">
                    <label className="block text-xs font-semibold tracking-widest uppercase text-on-surface-variant mb-2 ml-1 cursor-help" title="Standard Deviation of NN intervals. Reflects overall autonomic regulation context.">SDNN ⓘ</label>
                    <input required name="HRV_SDNN" value={formData.HRV_SDNN} onChange={handleChange} className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 focus:ring-1 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" placeholder="e.g., 65.1" type="number" step="any"/>
                    <div className="hidden group-hover:block absolute z-10 w-48 p-2 mt-1 -ml-4 text-[10px] bg-inverse-surface text-inverse-on-surface rounded shadow-xl leading-snug">Estimates overall HRV. Drops sharply during chronic stress.</div>
                  </div>
                  <div className="group relative">
                    <label className="block text-xs font-semibold tracking-widest uppercase text-on-surface-variant mb-2 ml-1 cursor-help" title="Low-Frequency power. Indicates a mix of sympathetic and parasympathetic activity.">LF Power ⓘ</label>
                    <input required name="HRV_LF" value={formData.HRV_LF} onChange={handleChange} className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 focus:ring-1 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" placeholder="e.g., 0.04" type="number" step="any"/>
                    <div className="hidden group-hover:block absolute z-10 w-48 p-2 mt-1 -ml-4 text-[10px] bg-inverse-surface text-inverse-on-surface rounded shadow-xl leading-snug">Low-Frequency (LF) band. Dominant in "fight or flight" responses.</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="group relative">
                    <label className="block text-xs font-semibold tracking-widest uppercase text-on-surface-variant mb-2 ml-1 cursor-help" title="High-Frequency power. Reflects pure parasympathetic (vagal) tone.">HF Power ⓘ</label>
                    <input required name="HRV_HF" value={formData.HRV_HF} onChange={handleChange} className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 focus:ring-1 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" placeholder="e.g., 0.02" type="number" step="any"/>
                    <div className="hidden group-hover:block absolute z-10 w-48 p-2 mt-1 -ml-4 text-[10px] bg-inverse-surface text-inverse-on-surface rounded shadow-xl leading-snug">High-Frequency (HF) band. Reflects pure vagal (rest and digest) tone.</div>
                  </div>
                  <div className="group relative">
                    <label className="block text-xs font-semibold tracking-widest uppercase text-on-surface-variant mb-2 ml-1 cursor-help" title="Ratio between Low and High frequency. High ratio indicates sympathetic dominance (stress/burnout).">LF/HF Ratio ⓘ</label>
                    <input required name="HRV_LFHF" value={formData.HRV_LFHF} onChange={handleChange} className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 focus:ring-1 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" placeholder="e.g., 2.0" type="number" step="any"/>
                    <div className="hidden group-hover:block absolute z-10 w-48 p-2 mt-1 -ml-4 text-[10px] bg-inverse-surface text-inverse-on-surface rounded shadow-xl leading-snug">A higher ratio (&gt;2.0) often signifies strong sympathetic dominance.</div>
                  </div>
                </div>

                {error && <div className="text-error text-sm mt-2 font-medium">{error}</div>}

                <div className="pt-4">
                  <button type="submit" disabled={loading} className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-5 rounded-xl font-bold tracking-wide custom-shadow hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50">
                    {loading ? 'Analyzing...' : 'Analyze HRV Profile'}
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* Right Column: Results Dashboard */}
          <div className="lg:col-span-7 space-y-8">
            {/* Main Result Card */}
            <section className="bg-surface-container-lowest p-10 rounded-xl custom-shadow border border-outline-variant/5">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h2 className="text-2xl font-bold font-headline mb-1">Burnout Analysis</h2>
                  <p className="text-on-surface-variant font-medium">Predicted Risk Projection</p>
                </div>
                {result ? (
                   <span className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full ${result.prediction === 1 ? 'bg-error-container text-on-error-container' : 'bg-primary-container/30 text-primary'}`}>
                     {result.status}
                   </span>
                ) : (
                  <span className="px-4 py-1.5 bg-surface-variant/50 text-outline text-xs font-bold uppercase tracking-widest rounded-full">Awaiting Data</span>
                )}
              </div>

              <div className="flex flex-col md:flex-row items-center gap-12">
                {/* Gauge */}
                <div className="relative w-48 h-48 flex items-center justify-center rounded-full p-1 bg-surface-container">
                  <div className="w-full h-full rounded-full circular-progress flex items-center justify-center" 
                       style={result ? {background: `conic-gradient(${result.prediction === 1 ? '#ba1a1a' : '#4e6354'} ${result.confidence * 100}%, #eeeeed 0)`} : {}}>
                    <div className="w-40 h-40 bg-surface-container-lowest rounded-full flex flex-col items-center justify-center">
                      <span className="text-4xl font-extrabold font-headline">
                        {result ? `${(result.confidence * 100).toFixed(1)}%` : '--%'}
                      </span>
                      <span className="text-[10px] uppercase tracking-tighter text-on-surface-variant font-bold">
                        {result && result.prediction === 1 ? 'Stress Probability' : 'Baseline Probability'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Data Table */}
                <div className="flex-grow space-y-6 w-full">
                  <div className="space-y-2 group relative">
                    <div className="flex justify-between text-sm mb-1 cursor-help">
                      <span className="font-medium text-on-surface">Model Confidence ⓘ</span>
                      <span className="text-primary font-bold">{result ? `${(result.confidence * 100).toFixed(1)}%` : '--%'}</span>
                    </div>
                    <div className="hidden group-hover:block absolute z-10 w-full p-2 mt-4 text-[10px] bg-inverse-surface text-inverse-on-surface rounded shadow-xl leading-snug">The XGBoost machine learning model's certainty that its prediction constraint holds true based on training data.</div>
                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{width: result ? `${result.confidence * 100}%` : '0%'}}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 group relative">
                    <div className="flex justify-between text-sm mb-1 cursor-help">
                      <span className="font-medium text-on-surface">LF/HF Imbalance Severity ⓘ</span>
                      <span className="text-secondary font-bold">
                        {formData.HRV_LFHF ? `${Math.min(parseInt(parseFloat(formData.HRV_LFHF)/3 * 100), 100)}%` : '--%'}
                      </span>
                    </div>
                    <div className="hidden group-hover:block absolute z-10 w-full p-2 mt-4 text-[10px] bg-inverse-surface text-inverse-on-surface rounded shadow-xl leading-snug">Visualizes how far the LF/HF ratio skews toward sympathetic (stress) dominance. 100% means extreme stress loading.</div>
                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-secondary-fixed-dim rounded-full transition-all duration-1000" style={{width: formData.HRV_LFHF ? `${Math.min(parseFloat(formData.HRV_LFHF)/3 * 100, 100)}%` : '0%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Grok AI Integration */}
            {result && (
              <div className="bg-surface-container border border-primary/20 p-8 rounded-xl flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                  <span className="material-symbols-outlined text-9xl">neurology</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
                    <h3 className="font-headline font-bold text-lg">Grok API Clinical Insights</h3>
                  </div>
                  <button 
                    onClick={handleGrokAnalysis}
                    disabled={grokLoading}
                    className="px-4 py-2 bg-inverse-surface text-inverse-on-surface rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-stone-700 transition-all disabled:opacity-50"
                  >
                    {grokLoading ? 'Analyzing Data...' : 'Request x.AI Deep Dive'}
                  </button>
                </div>
                
                {grokError && (
                  <div className="text-error bg-error-container/50 px-4 py-3 rounded-lg text-sm mb-2">{grokError}</div>
                )}
                
                {grokAnalysis ? (
                  <div className="text-sm font-medium text-on-surface-variant leading-relaxed bg-surface-container-lowest p-5 rounded-lg border border-outline-variant/30 shadow-sm relative italic">
                    "{grokAnalysis}"
                    <span className="absolute bottom-2 right-3 text-[10px] text-outline font-bold tracking-widest uppercase">Powered by Grok-2</span>
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Tap the button above to request an individualized analysis of your exact numerical readouts utilizing Grok's clinical wellness prompts. Ensure your `GROK_API_KEY` is present in the backend.
                  </p>
                )}
              </div>
            )}
            
          </div>
        </div>
      </>
  )
}
