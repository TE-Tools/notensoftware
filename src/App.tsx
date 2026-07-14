import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Editor from './components/Editor';
import OMRUpload from './components/OMRUpload';
import SibeliusImport from './components/SibeliusImport';
import Auth from './components/Auth';
import Dashboard from './pages/Dashboard';
import Donate from './components/Donate';
import { Music, Upload, FileText, Home, Heart, LogOut } from 'lucide-react';

function App() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'dashboard' | 'editor' | 'omr' | 'sibelius' | 'donate'>('login');
  const [currentScore, setCurrentScore] = useState<{xml: string, title: string} | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) setActiveTab('dashboard');
    });
    return unsub;
  }, []);

  const handleLoadScore = (xml: string, title: string) => {
    setCurrentScore({ xml, title });
    setActiveTab('editor');
  };

  const handleLogout = () => auth.signOut().then(() => setActiveTab('login'));

  return (
    <div className="min-h-screen bg-zinc-950">
      <Toaster position="top-center" />

      <nav className="border-b border-zinc-800 bg-zinc-900 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Music className="w-9 h-9 text-emerald-500" />
          <h1 className="text-3xl font-bold">NotaFlow</h1>
        </div>

        {user && (
          <div className="flex gap-6 text-sm">
            <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-emerald-500' : ''}>Dashboard</button>
            <button onClick={() => setActiveTab('editor')} className={activeTab === 'editor' ? 'text-emerald-500' : ''}>Editor</button>
            <button onClick={() => setActiveTab('sibelius')} className={activeTab === 'sibelius' ? 'text-emerald-500' : ''}>Sibelius Import</button>
            <button onClick={() => setActiveTab('omr')} className={activeTab === 'omr' ? 'text-emerald-500' : ''}>PDF OMR</button>
            <button onClick={() => setActiveTab('donate')} className={activeTab === 'donate' ? 'text-emerald-500' : ''}>Spenden</button>
            <button onClick={handleLogout} className="text-red-400">Abmelden</button>
          </div>
        )}
      </nav>

      <div className="p-6">
        {!user ? (
          <Auth onSuccess={() => setActiveTab('dashboard')} />
        ) : (
          <>
            {activeTab === 'dashboard' && <Dashboard onLoad={handleLoadScore} />}
            {activeTab === 'editor' && <Editor initialXml={currentScore?.xml} title={currentScore?.title} />}
            {activeTab === 'sibelius' && <SibeliusImport onImport={handleLoadScore} />}
            {activeTab === 'omr' && <OMRUpload onOMRComplete={(xml) => handleLoadScore(xml, "OMR Import")} />}
            {activeTab === 'donate' && <Donate />}
          </>
        )}
      </div>
    </div>
  );
}

export default App;