import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  streamKey: string; 
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ streamKey }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // URL del stream HLS
  const hlsUrl = `http://34.68.66.89:8080/live/${streamKey}.m3u8`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Intentar reproducir automáticamente (puede ser bloqueado por el navegador)
        video.play().catch(() => console.log("Autoplay bloqueado, esperando interacción"));
      });
      
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("Error de red, intentando recuperar...");
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Error de medios, intentando recuperar...");
              hls?.recoverMediaError();
              break;
            default:
              hls?.destroy();
              break;
          }
        }
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Soporte nativo (Safari)
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => console.log("Autoplay bloqueado"));
      });
    }

    return () => {
      if (hls) hls.destroy();
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [hlsUrl]);

  return (
    // Contenedor principal con estilo Kick:
    <div className="w-full h-full bg-black rounded-xl overflow-hidden border border-[#24272c] shadow-2xl relative group">
      
      {/* Video */}
      <video 
        ref={videoRef} 
        controls 
        className="w-full h-full object-contain focus:outline-none"
        poster="https://placehold.co/1920x1080/0b0e0f/24272c?text=Offline"
      />

      {/* Overlay decorativo "En Vivo" (Solo aparece si se está reproduciendo y se hace hover) */}
      {isPlaying && (
        <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg">
          🔴 En Vivo
        </div>
      )}

      {/* Overlay de carga o estado (Opcional: se podría agregar lógica de loading aquí) */}
    </div>
  );
};

export default VideoPlayer;