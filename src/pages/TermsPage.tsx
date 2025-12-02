import React from 'react';
import { useAuth } from '../hooks/useAuth';

const TermsPage: React.FC = () => {
  const { setPage } = useAuth();

  return (
    <div className="p-8 bg-[#0b0e0f] min-h-full text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black mb-8 border-b border-[#24272c] pb-4">
          Términos y <span className="text-[#53FC18]">Condiciones</span> ()
        </h1>
        
        <div className="bg-[#191b1f] p-8 rounded-xl border border-[#24272c] space-y-6 text-gray-300 leading-relaxed shadow-lg">
          <p>
            <strong className="text-white block mb-2 text-lg">1. Introducción</strong>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris.
          </p>
          <div className="h-px bg-[#24272c] w-full my-4"></div>
          <p>
            <strong className="text-white block mb-2 text-lg">2. Uso de la Plataforma</strong>
            Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero.
          </p>
          <div className="h-px bg-[#24272c] w-full my-4"></div>
          <p>
            <strong className="text-white block mb-2 text-lg">3. Política de Monedas</strong>
            Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor.
          </p>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setPage('home')}
            className="px-8 py-3 bg-[#53FC18] text-black font-black uppercase rounded hover:bg-[#42ca13] transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(83,252,24,0.3)]"
          >
            Aceptar y Regresar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
