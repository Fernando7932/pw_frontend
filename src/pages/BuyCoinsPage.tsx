import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

const coinPacks = [
  { name: 'Pack Básico', amount: 100, price: 'S/. 3.50' },
  { name: 'Pack Popular', amount: 500, price: 'S/. 15.00', popular: true },
  { name: 'Pack Pro', amount: 1000, price: 'S/. 28.00' },
];

const BuyCoinsPage: React.FC = () => {
  const { setPage, setCoins } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleBuy = async (amount: number, packName: string) => {
    setIsLoading(packName);
    try {
      const data = await api.buyCoinsTest(amount);
      setCoins(data.coins);
      alert(`¡Has comprado ${amount} monedas!`);
      setPage('dashboard');
    } catch (err: any) { alert(err.message); }
    setIsLoading(null);
  };

  return (
    <div className="p-8 bg-[#0b0e0f] min-h-full text-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-4">Recargar Monedas</h1>
          <p className="text-gray-400">Elige el paquete que mejor se adapte a ti y apoya a tus streamers favoritos.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {coinPacks.map((pack) => (
            <div 
              key={pack.name} 
              className={`relative bg-[#191b1f] p-8 rounded-2xl border ${pack.popular ? 'border-[#53FC18] shadow-[0_0_20px_rgba(83,252,24,0.1)]' : 'border-[#24272c]'} flex flex-col items-center transition-transform hover:-translate-y-1`}
            >
              {pack.popular && (
                <div className="absolute -top-3 bg-[#53FC18] text-black text-xs font-black px-3 py-1 rounded uppercase tracking-wide">
                  Más Popular
                </div>
              )}

              <div className="text-5xl mb-4">💰</div>
              <h2 className="text-2xl font-bold mb-2 text-white">{pack.amount} Monedas</h2>
              <p className="text-gray-400 text-sm mb-8">{pack.name}</p>
              
              <div className="mt-auto w-full">
                <p className="text-3xl font-black text-center mb-6">{pack.price}</p>
                <button 
                  onClick={() => handleBuy(pack.amount, pack.name)} 
                  disabled={isLoading === pack.name} 
                  className={`w-full p-3 font-black uppercase rounded transition-colors disabled:opacity-50 ${
                    pack.popular 
                      ? 'bg-[#53FC18] text-black hover:bg-[#42ca13]' 
                      : 'bg-[#24272c] text-white hover:bg-[#32353b]'
                  }`}
                >
                  {isLoading === pack.name ? "Procesando..." : "Comprar Ahora"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default BuyCoinsPage;
