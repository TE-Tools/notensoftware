import { useState } from 'react';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function Auth({ onSuccess }: { onSuccess: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      toast.success(isLogin ? "Willkommen zurück!" : "Account erstellt!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-zinc-900 p-10 rounded-3xl border border-zinc-700">
      <h2 className="text-3xl font-bold text-center mb-8">{isLogin ? "Anmelden" : "Registrieren"}</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="E-Mail" value={email} onChange={e => setEmail(e.target.value)} className="w-full mb-4 p-4 bg-zinc-800 rounded-xl" required />
        <input type="password" placeholder="Passwort" value={password} onChange={e => setPassword(e.target.value)} className="w-full mb-6 p-4 bg-zinc-800 rounded-xl" required />
        <button type="submit" disabled={loading} className="w-full py-4 bg-emerald-600 rounded-2xl font-semibold">
          {loading ? "..." : (isLogin ? "Einloggen" : "Registrieren")}
        </button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)} className="text-emerald-500 mt-6 block mx-auto">
        {isLogin ? "Noch kein Account? Registrieren" : "Bereits registriert? Anmelden"}
      </button>
    </div>
  );
}