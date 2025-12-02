import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Header: React.FC = () => {
  const { page, setPage, user, coins, logout } = useAuth();
  
  // Estilos base para enlaces
  const linkClass = "text-gray-400 hover:text-[#53FC18] transition-colors font-medium text-sm uppercase tracking-wide";
  const activeLinkClass = "text-[#53FC18] font-bold text-sm uppercase tracking-wide";

  return (
    <header className="bg-[#191b1f] border-b border-[#24272c] p-4 sticky top-0 z-50">
      <nav className="container mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => setPage('home')}
        >
          <div className="w-8 h-8 bg-[#53FC18] rounded flex items-center justify-center text-black font-black text-xl group-hover:rotate-3 transition-transform">
            K
          </div>
          <span className="text-xl font-bold text-white tracking-tighter group-hover:text-[#53FC18] transition-colors">
            KICKCLONE
          </span>
        </div>
        
        {/* Navegación Central */}
        <div className="hidden md:flex items-center space-x-8">
          <button onClick={() => setPage('home')} className={page === 'home' ? activeLinkClass : linkClass}>
            Explorar
          </button>
          <button onClick={() => setPage('about')} className={page === 'about' ? activeLinkClass : linkClass}>
            Nosotros
          </button>
        </div>
        
        {/* Área de Usuario */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center bg-[#0b0e0f] rounded px-3 py-1.5 border border-[#24272c]">
                <span className="text-[#53FC18] font-bold mr-2">💰 {coins}</span>
                <button 
                  onClick={() => setPage('buy-coins')}
                  className="text-xs bg-[#24272c] hover:bg-[#32353b] text-white px-2 py-1 rounded transition-colors"
                >
                  +
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setPage('dashboard')} 
                  className="flex items-center gap-2 text-gray-200 hover:text-white"
                >
                  <div className="w-8 h-8 bg-gray-700 rounded-full overflow-hidden border-2 border-transparent hover:border-[#53FC18] transition-all">
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="Avatar" />
                  </div>
                  <span className="hidden lg:block text-sm font-semibold">{user.username}</span>
                </button>
                
                <button 
                  onClick={logout} 
                  className="text-gray-500 hover:text-red-500 transition-colors"
                  title="Cerrar Sesión"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={() => setPage('login')} 
                className="px-4 py-2 text-sm font-bold text-gray-200 hover:text-white transition-colors"
              >
                Iniciar Sesión
              </button>
              <button 
                onClick={() => setPage('register')} 
                className="px-4 py-2 text-sm font-bold bg-[#53FC18] text-black rounded hover:bg-[#42ca13] transition-colors"
              >
                Registrarse
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};
export default Header;
