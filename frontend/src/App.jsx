import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Predictions from './pages/Predictions'
import Dashboard from './pages/Dashboard'
import Biometrics from './pages/Biometrics'
import Resources from './pages/Resources'
import Guide from './pages/Guide'

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  if (isActive) {
    return (
      <Link className="text-emerald-800 dark:text-emerald-400 font-semibold border-b-2 border-emerald-800 dark:border-emerald-400 pb-1" to={to}>{children}</Link>
    )
  }
  return (
    <Link className="text-stone-500 dark:text-stone-400 hover:text-emerald-700 transition-colors" to={to}>{children}</Link>
  )
}

function Layout({ children }) {
  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-stone-50/70 dark:bg-stone-900/70 backdrop-blur-xl flex justify-between items-center px-8 h-20 max-w-full">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-50 font-headline">Ethereal Clinical</span>
          <nav className="hidden md:flex gap-6 items-center">
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/guide">How It Works</NavLink>
            <NavLink to="/biometrics">Biometrics</NavLink>
            <NavLink to="/predictions">Predictions</NavLink>
            <NavLink to="/resources">Resources</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 rounded-full transition-all active:scale-95">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          </button>
          <button className="p-2 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 rounded-full transition-all active:scale-95">
            <span className="material-symbols-outlined text-on-surface-variant">settings</span>
          </button>
          <div className="h-10 w-10 rounded-full overflow-hidden ml-2 border border-outline-variant/20">
            <img alt="User profile" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvlkWn-CScdZaJRe4uM5aYSG9VKpFX8ttolYyRdgFzRnvntOvs_gPcUHuXSleGf1kQIT1_4CkdTsygq5_-TA4jH_PH2Yj8Vquf70NL14A2j__kj0LRPiA28jXnbwvoShPG6qpuZyc0p-UgeVQfTeyeqwG7m6KqP4KthT6n5EjnYW1JGAXksr4ilfQxgGdVGKynyai9as_Zqy7eq2Nfw2kCXW9qxQ26-0ZqHKG-IbKsnlu0rSHZRxv-SEcRp0cQeM7EGSbu8RV0SOE"/>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-32 pb-24 px-8 md:px-16 max-w-7xl mx-auto w-full min-h-[85vh]">
        {children}
      </main>

      <footer className="w-full py-12 mt-auto bg-stone-50 dark:bg-stone-950 flex flex-col md:flex-row justify-between items-center px-12 border-t border-stone-200/20">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="font-bold text-stone-900 dark:text-stone-50 font-headline">Ethereal Clinical</span>
          <p className="text-stone-400 dark:text-stone-600 text-[10px] uppercase tracking-wider font-body">© 2024 Ethereal Clinical. Clinical Serenity Guaranteed.</p>
        </div>
        <nav className="flex flex-wrap justify-center gap-8 mt-8 md:mt-0">
          <a className="text-stone-400 dark:text-stone-600 hover:text-emerald-600 dark:hover:text-emerald-400 text-[10px] uppercase tracking-wider font-body transition-opacity opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
          <a className="text-stone-400 dark:text-stone-600 hover:text-emerald-600 dark:hover:text-emerald-400 text-[10px] uppercase tracking-wider font-body transition-opacity opacity-80 hover:opacity-100" href="#">Terms of Service</a>
          <a className="text-stone-400 dark:text-stone-600 hover:text-emerald-600 dark:hover:text-emerald-400 text-[10px] uppercase tracking-wider font-body transition-opacity opacity-80 hover:opacity-100" href="#">Clinical Methodology</a>
          <a className="text-stone-400 dark:text-stone-600 hover:text-emerald-600 dark:hover:text-emerald-400 text-[10px] uppercase tracking-wider font-body transition-opacity opacity-80 hover:opacity-100" href="#">Contact Support</a>
        </nav>
      </footer>
    </>
  )
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/biometrics" element={<Biometrics />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/resources" element={<Resources />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
