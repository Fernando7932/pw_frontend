import React, { useState, useEffect } from 'react';
import VideoPlayer from '../components/VideoPlayer';
import Chat from '../components/Chat';
import GiftShop from '../components/GiftShop';
import LoyaltyProgressBar from '../components/LoyaltyProgressBar';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface StreamPageProps {
  username: string;
}

interface PublicStreamInfo {
  title: string;
  streamKey: string;
  user: {
    username: string;
  }
}

const StreamPage: React.FC<StreamPageProps> = ({ username }) => {
  const { user } = useAuth();
  const [streamInfo, setStreamInfo] = useState<PublicStreamInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStreamInfo = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getStreamInfoByUsername(username);
        setStreamInfo(data);
      } catch (err: any) {
        setError("Stream no encontrado o no está en vivo. (404)");
        console.error(err);
      }
      setIsLoading(false);
    };
    fetchStreamInfo();
  }, [username]);

  if (isLoading) {
    return <div className="p-8 text-center text-white">Cargando stream...</div>;
  }

  if (error || !streamInfo) {
    return <div className="p-8 text-center text-red-500 font-bold">{error || 'Stream no encontrado.'}</div>;
  }

  const { title } = streamInfo;
  const hlsStreamKey = streamInfo.streamKey;

  return (
    <div className="flex flex-col lg:flex-row w-full lg:h-[calc(100vh-64px)] lg:overflow-hidden bg-[#0b0e0f]">

      {/* columna izquierfda (Video + Info/Regalos) */}
      <div className="flex-1 flex flex-col gap-4 p-4 lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

        {/* 1. Video Player */}
        <div className="w-full aspect-video flex-shrink-0 bg-black rounded-lg overflow-hidden shadow-lg border border-[#24272c]">
          <VideoPlayer streamKey={hlsStreamKey} />
        </div>

        {/* 2. Info del Stream + Componentes */}
        <div className="space-y-4">
          <div className="bg-[#191b1f] p-4 rounded-lg border border-[#24272c] shadow-sm">
            <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} alt="Avatar" />
              </div>
              <span className="text-[#53FC18] font-bold text-lg">{username}</span>
              <span className="ml-2 bg-[#24272c] text-gray-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-gray-700">En Vivo</span>
            </div>
          </div>

          {user && <LoyaltyProgressBar streamerUsername={username} />}

          <GiftShop streamerUsername={username} />

          {/* Espacio extra al final solo en desktop si es necesario, en mobile el chat está abajo */}
          <div className="h-4 lg:h-20"></div>
        </div>
      </div>

      {/* columna derecha (Chat) */}
      <div className="w-full lg:w-80 h-[600px] lg:h-full flex-shrink-0 bg-[#0b0e0f] border-t lg:border-t-0 lg:border-l border-[#24272c]">
        <Chat roomName={username} />
      </div>
    </div>
  );
};

export default StreamPage;