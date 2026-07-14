import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Donate() {
  const donate = (amount: number) => {
    window.open(`https://ko-fi.com/yourusername?amount=${amount}`, '_blank');
    toast.success(`Danke für ${amount} € ❤️`);
  };

  return (
    <div className="p-8 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-emerald-900 rounded-3xl text-center">
      <Heart className="mx-auto text-red-500 w-16 h-16 mb-6" />
      <h2 className="text-3xl font-bold mb-3">NotaFlow unterstützen</h2>
      <p className="text-zinc-400 mb-8">Hilf bei der Weiterentwicklung</p>
      <div className="flex justify-center gap-6">
        {[5,10,20].map(a => (
          <button key={a} onClick={() => donate(a)} className="px-10 py-4 bg-zinc-800 hover:bg-emerald-600 rounded-2xl text-lg font-semibold">
            {a} €
          </button>
        ))}
      </div>
    </div>
  );
}