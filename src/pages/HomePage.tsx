import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { io } from 'socket.io-client';

interface LiveStream {
  id: string;
  title: string;
  user: { username: string; };
}

const HomePage: React.FC = () => {
  const { setPage } = useAuth();
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLiveStreams = useCallback(async () => {
    try {
      const data = await api.getLiveStreams();
      setLiveStreams(data);
    } catch (error) {
      console.error("Error al cargar streams:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchLiveStreams();
    const socket = io('https://kickclone-api.onrender.com');
    socket.on('streams_changed', () => { fetchLiveStreams(); });
    return () => { socket.disconnect(); };
  }, [fetchLiveStreams]);

  return (
    <div className="p-6 bg-[#0b0e0f] min-h-full">
      {/* Hero Section Minimalista */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Canales en vivo <span className="text-[#53FC18]">Recomendados</span>
        </h1>
        <p className="text-gray-400">Explora lo mejor del streaming universitario.</p>
      </div>

      {/* Grid de Streams */}
      {isLoading ? (
        <div className="flex justify-center py-20">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#53FC18]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {liveStreams.length > 0 ? liveStreams.map((stream) => (
            <div 
              key={stream.id} 
              className="group cursor-pointer" 
              onClick={() => setPage(`stream/${stream.user.username}`)}
            >
              {/* Thumbnail Wrapper */}
              <div className="relative aspect-video rounded overflow-hidden mb-3 border border-transparent group-hover:border-[#53FC18] transition-all">
                <img 
                  src={`https://placehold.co/600x340/191b1f/FFF?text=${stream.user.username}`} 
                  alt="Thumbnail" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                  En Vivo
                </div>
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                  1.2k espectadores
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex gap-3">
                 <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${stream.user.username}`} alt="Avatar" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold truncate group-hover:text-[#53FC18] transition-colors">
                      {stream.title}
                    </h3>
                    <p className="text-gray-400 text-sm truncate">{stream.user.username}</p>
                    <p className="text-gray-500 text-xs mt-1">Just Chatting</p>
                 </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-20 bg-[#191b1f] rounded-xl border-dashed border-2 border-gray-700">
              <p className="text-gray-400 text-xl">No hay nadie transmitiendo en este momento 😴</p>
              <p className="text-gray-600 text-sm mt-2">¡Sé el primero en iniciar directo!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default HomePage;
