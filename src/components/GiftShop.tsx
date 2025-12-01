import React, { useState, useEffect } from 'react';
import { api } from '../services/api'; 
import { useAuth } from '../hooks/useAuth'; 

interface Gift {
  id: string;
  name: string;
  cost: number;
  points: number;
}

interface GiftShopProps {
  streamerUsername: string;
}

const GiftShop: React.FC<GiftShopProps> = ({ streamerUsername }) => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false); 
  const [error, setError] = useState<string | null>(null);

  const { user, coins, setCoins, refreshCoins } = useAuth(); 

  useEffect(() => {
    const fetchGifts = async () => {
      try {
        const data = await api.getGifts(streamerUsername);
        setGifts(data);
      } catch (err: any) {
        setError(err.message);
      }
      setIsLoading(false);
    };
    fetchGifts();
  }, [streamerUsername]); 

  const handleSendGift = async (giftId: string) => {
    if (!user || isSending) return; 

    setIsSending(true);
    try {
      const data = await api.sendGift(giftId, streamerUsername); 
      // Actualizamos las monedas globales con la respuesta del backend
      if (data && data.newCoins !== undefined) {
          setCoins(data.newCoins);
      } else {
          // Fallback: refrescar desde la API si la respuesta no trae el dato directo
          await refreshCoins();
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
    setIsSending(false);
  };

  if (isLoading) return <div className="p-4 text-center text-gray-500 text-sm animate-pulse">Cargando tienda...</div>;
  if (error) return <div className="p-4 text-center text-red-500 text-sm">{error}</div>;

  const userCoins = coins ?? 0; 

  return (
    <div className="bg-[#191b1f] p-5 rounded-xl border border-[#24272c] shadow-sm mt-4">
      <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">Tienda del Canal</h3>
          <span className="text-xs font-mono text-[#53FC18] bg-[#53FC18]/10 px-2 py-1 rounded border border-[#53FC18]/20"></span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {gifts.length > 0 ? ( 
          gifts.map((gift) => {
            const canAfford = userCoins >= gift.cost;
            
            return (
              <button
                key={gift.id}
                onClick={() => handleSendGift(gift.id)}
                disabled={!user || !canAfford || isSending}
                className="group relative flex flex-col items-center p-3 rounded-lg bg-[#0b0e0f] border border-[#24272c] hover:border-[#53FC18] transition-all duration-200 disabled:opacity-50 disabled:hover:border-[#24272c] disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(83,252,24,0.1)]"
              >
                <div className="text-3xl mb-2 transform group-hover:scale-110 transition-transform duration-200 filter drop-shadow-lg">{gift.name.split(' ')[1] || '🎁'}</div>
                <span className="text-xs font-bold text-gray-300 group-hover:text-white truncate w-full text-center transition-colors">{gift.name.split(' ')[0]}</span>
                
                <div className="mt-2 flex items-center gap-1 bg-[#191b1f] px-2 py-1 rounded border border-[#24272c] group-hover:border-[#53FC18]/50 transition-colors">
                   <span className="text-[10px]">💰</span>
                   <span className={`text-xs font-mono font-bold ${canAfford ? 'text-[#53FC18]' : 'text-red-500'}`}>{gift.cost}</span>
                </div>
                
                {/* Tooltip puntos */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap border border-[#24272c] shadow-lg z-10">
                   <span className="text-[#53FC18] font-bold">+{gift.points}</span> Puntos de Nivel
                   <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black border-r border-b border-[#24272c] rotate-45"></div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8 border-2 border-dashed border-[#24272c] rounded-lg bg-[#0b0e0f]/50">
            <p className="text-gray-500 text-xs">Este streamer aún no ha configurado sus regalos.</p>
          </div>
        )}
      </div>
      
      {!user && (
        <div className="mt-4 p-3 bg-[#0b0e0f] rounded border border-dashed border-[#24272c] text-center">
            <p className="text-xs text-gray-500">
              <span className="text-[#53FC18] cursor-pointer hover:underline font-bold">Inicia sesión</span> para apoyar al streamer
            </p>
        </div>
      )}
    </div>
  );
};

export default GiftShop;