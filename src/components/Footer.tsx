import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Footer: React.FC = () => {
  const { setPage } = useAuth();

  return (
    <footer className="bg-[#191b1f] p-6 mt-auto text-center text-gray-500 border-t border-[#24272c] flex-shrink-0">
      <p className="text-sm">© 2025 KICKCLONE. Todos los derechos reservados.</p>
      <div className="space-x-4 mt-3 text-sm font-medium">
        <button onClick={() => setPage('about')} className="hover:text-[#53FC18] transition-colors">Nosotros</button>
        <span>|</span>
        <button onClick={() => setPage('terms')} className="hover:text-[#53FC18] transition-colors">Términos y Condiciones</button>
      </div>
    </footer>
  );
};

export default Footer;