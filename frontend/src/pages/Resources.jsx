import { useState, useEffect } from 'react';

export default function Resources() {
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState("Ready"); // "Inhale" or "Exhale" or "Ready"

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
           const newTimeLeft = prev - 1;
           const currentSec = 300 - newTimeLeft + 1; 
           if (currentSec % 10 < 5) {
               setPhase("Inhale");
           } else {
               setPhase("Exhale");
           }
           return newTimeLeft;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setPhase("Session Complete");
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
     setIsActive(!isActive);
     if (!isActive && phase === "Ready") setPhase("Inhale");
  };
  
  const resetTimer = () => { 
     setIsActive(false); 
     setTimeLeft(300); 
     setPhase("Ready"); 
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="mb-8 border-b border-outline-variant/20 pb-4">
        <h1 className="text-4xl font-headline font-extrabold tracking-tight">Clinical Resources</h1>
        <p className="text-on-surface-variant mt-2">Scientific literature and interactive recovery protocols.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="space-y-4">
            <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">book</span> Literature
            </h2>
            <a href="https://academic.oup.com/eurheartj/article/17/3/354/483089" target="_blank" rel="noreferrer" className="block p-5 bg-surface-container-lowest border border-outline-variant/20 rounded-lg hover:border-primary transition-colors">
               <h3 className="font-bold text-on-surface mb-1">HRV: Standards of Measurement</h3>
               <p className="text-xs text-on-surface-variant">Task Force guidelines (1996) - The gold-standard foundational paper establishing RMSSD, SDNN, and spectral analysis parameters.</p>
            </a>
            <a href="https://www.frontiersin.org/articles/10.3389/fnins.2018.00114/full" target="_blank" rel="noreferrer" className="block p-5 bg-surface-container-lowest border border-outline-variant/20 rounded-lg hover:border-primary transition-colors">
               <h3 className="font-bold text-on-surface mb-1">The Vagal Tank Theory</h3>
               <p className="text-xs text-on-surface-variant">Frontiers in Neuroscience (2018) - Examines the "Three Rs" (Resting, Reactivity, Recovery) of autonomic control and vagal depletion.</p>
            </a>
            <a href="https://journals.lww.com/psychosomaticmedicine" target="_blank" rel="noreferrer" className="block p-5 bg-surface-container-lowest border border-outline-variant/20 rounded-lg hover:border-primary transition-colors">
               <h3 className="font-bold text-on-surface mb-1">HRV as a measure of Vagal Tone</h3>
               <p className="text-xs text-on-surface-variant">Psychosomatic Medicine (2020) - Details how RMSSD directly translates to parasympathetic recovery metrics.</p>
            </a>
            <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6102609/" target="_blank" rel="noreferrer" className="block p-5 bg-surface-container-lowest border border-outline-variant/20 rounded-lg hover:border-primary transition-colors">
               <h3 className="font-bold text-on-surface mb-1">Sympathetic Dominance in Clinical Burnout</h3>
               <p className="text-xs text-on-surface-variant">Neuropsychiatric Disease and Treatment (2018) - Exploring the link between LF/HF ratio imbalances and chronic stress burnout.</p>
            </a>
            <a href="https://pubmed.ncbi.nlm.nih.gov/30283577/" target="_blank" rel="noreferrer" className="block p-5 bg-surface-container-lowest border border-outline-variant/20 rounded-lg hover:border-primary transition-colors">
               <h3 className="font-bold text-on-surface mb-1">Burnout Syndrome & Autonomic Activity</h3>
               <p className="text-xs text-on-surface-variant">Journal of Environmental Research (2019) - Empirical studies classifying workplace burnout using Machine Learning classifiers on HRV sequences.</p>
            </a>
         </div>

         <div className="space-y-4">
            <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">self_improvement</span> Resonance Protocol
            </h2>
             <div className="p-8 bg-surface-container-lowest rounded-xl border border-secondary/30 custom-shadow flex flex-col items-center">
               <h3 className="font-bold text-xl text-on-surface mb-2">5-Minute Vagal Reset</h3>
               <p className="text-xs text-center text-on-surface-variant mb-6">Breathing at 6 breaths per minute maximizes HRV and significantly improves baroreflex gain.</p>
               
               <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                 {/* Breathing Circle Animation */}
                 <div className={`absolute rounded-full bg-secondary/20 transition-all ease-in-out duration-1000 ${isActive ? (phase === 'Inhale' ? 'w-48 h-48 scale-100 opacity-50' : 'w-24 h-24 scale-75 opacity-100') : 'w-32 h-32'}`}></div>
                 <div className="z-10 flex flex-col items-center">
                    <span className="text-5xl font-extrabold font-headline tracking-tighter text-secondary">{formatTime(timeLeft)}</span>
                    <span className="text-sm font-bold uppercase tracking-widest text-secondary mt-1">{phase}</span>
                 </div>
               </div>

               <div className="flex gap-4 w-full">
                 <button onClick={toggleTimer} className="flex-1 bg-secondary text-on-secondary py-3 rounded-lg font-bold tracking-wide hover:brightness-105 active:scale-95 transition-all">
                    {isActive ? 'Pause' : (timeLeft < 300 ? 'Resume' : 'Start Session')}
                 </button>
                 <button onClick={resetTimer} className="px-6 py-3 border-2 border-outline-variant text-on-surface py-2 rounded-lg font-bold tracking-wide hover:bg-surface-variant transition-all">Reset</button>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
