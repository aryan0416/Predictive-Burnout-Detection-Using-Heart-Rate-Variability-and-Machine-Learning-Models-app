export default function Guide() {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="mb-8 border-b border-outline-variant/20 pb-4">
        <h1 className="text-4xl font-headline font-extrabold tracking-tight">How It Works</h1>
        <p className="text-on-surface-variant mt-2">Understanding your biometrics and our machine learning prediction pipeline.</p>
      </div>

      <section className="bg-surface-container-lowest p-8 rounded-xl custom-shadow border border-outline-variant/10">
        <h2 className="text-2xl font-bold font-headline mb-6 border-b border-outline-variant/20 pb-4">1. Inputting Your Data</h2>
        <p className="text-on-surface-variant mb-6 text-sm leading-relaxed">To get an accurate physiological burnout prediction, the algorithm requires 6 specific Heart Rate Variability (HRV) indices. You can extract these from clinical-grade wearables (Oura, Garmin) or ECG exports. </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <li className="bg-surface-container p-5 rounded-lg border border-outline-variant/20">
            <strong className="text-primary block mb-1">RMSSD</strong> 
            <span className="text-xs text-on-surface-variant">Root Mean Square of Successive Differences. A key indicator of vagal tone (parasympathetic recovery).</span>
          </li>
          <li className="bg-surface-container p-5 rounded-lg border border-outline-variant/20">
            <strong className="text-primary block mb-1">Mean NN</strong> 
            <span className="text-xs text-on-surface-variant">The average time (in milliseconds) between normal heartbeats. Inverse correlation to heart rate.</span>
          </li>
          <li className="bg-surface-container p-5 rounded-lg border border-outline-variant/20">
            <strong className="text-primary block mb-1">SDNN</strong> 
            <span className="text-xs text-on-surface-variant">Standard Deviation of all NN intervals. Reflects overall health and global autonomic regulation capability.</span>
          </li>
          <li className="bg-surface-container p-5 rounded-lg border border-outline-variant/20">
            <strong className="text-primary block mb-1">LF Power</strong> 
            <span className="text-xs text-on-surface-variant">Low-Frequency band. Reflects a mixture of sympathetic (arousal) and parasympathetic activity.</span>
          </li>
          <li className="bg-surface-container p-5 rounded-lg border border-outline-variant/20">
            <strong className="text-primary block mb-1">HF Power</strong> 
            <span className="text-xs text-on-surface-variant">High-Frequency band. Reflects pure parasympathetic (rest and digest) activity governed by the vagus nerve.</span>
          </li>
          <li className="bg-surface-container p-5 rounded-lg border border-outline-variant/20">
            <strong className="text-primary block mb-1">LF/HF Ratio</strong> 
            <span className="text-xs text-on-surface-variant">The mathematical balance. Ratios higher than ~2.0 strongly imply sympathetic dominance and physiological stress.</span>
          </li>
        </ul>
      </section>

      <section className="bg-surface-container-lowest p-8 rounded-xl custom-shadow border border-outline-variant/10">
        <h2 className="text-2xl font-bold font-headline mb-4 border-b border-outline-variant/20 pb-2">2. The Machine Learning Engine</h2>
        <p className="text-on-surface-variant mb-4 text-sm leading-relaxed">Once you submit your data, our modular ML pipeline processes it using an advanced Random Forest ensemble algorithm originally trained on the <strong>WESAD (Wearable Stress and Affect Detection)</strong> clinical dataset.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="p-6 bg-surface-container rounded-xl flex flex-col gap-2">
            <span className="material-symbols-outlined text-4xl text-primary mb-2">scale</span>
            <h3 className="font-bold font-headline text-lg">Standardization</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">Your raw inputs are normalized using a global <code>StandardScaler</code> matrix so they perfectly match the mean and variance distribution of our clinical baseline training data.</p>
          </div>
          <div className="p-6 bg-surface-container rounded-xl flex flex-col gap-2">
            <span className="material-symbols-outlined text-4xl text-secondary mb-2">balance</span>
            <h3 className="font-bold font-headline text-lg">SMOTE Balancing</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">Our training system utilized Synthetic Minority Over-sampling Technique (SMOTE) to ensure the algorithm can accurately detect the minority "Stress" event without inherent bias.</p>
          </div>
          <div className="p-6 bg-surface-container rounded-xl flex flex-col gap-2">
            <span className="material-symbols-outlined text-4xl text-error mb-2">park</span>
            <h3 className="font-bold font-headline text-lg">Random Forest Inference</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">The scaled parameters are passed through our <code>RandomForestClassifier</code>. The ensemble decision tree model returns a binary calculation (Baseline vs. Stress) along with its statistical confidence probability.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
