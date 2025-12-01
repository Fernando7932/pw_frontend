import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const Header: React.FC = () => {
  const { page, setPage, user, coins, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Estilos base para enlaces
  const linkClass = "text-gray-400 hover:text-[#53FC18] transition-colors font-medium text-sm uppercase tracking-wide";
  const activeLinkClass = "text-[#53FC18] font-bold text-sm uppercase tracking-wide";

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleNavClick = (newPage: string) => {
    setPage(newPage);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-[#191b1f] border-b border-[#24272c] p-4 sticky top-0 z-50">
      <nav className="container mx-auto flex justify-between items-center relative">

        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => handleNavClick('home')}
        >
          <div className="w-8 h-8 bg-[#53FC18] rounded flex items-center justify-center text-black font-black text-xl group-hover:rotate-3 transition-transform">
            K
          </div>
          <span className="text-xl font-bold text-white tracking-tighter group-hover:text-[#53FC18] transition-colors">
            KICKCLONE
          </span>
        </div>

        {/* Navegación Central (Desktop) */}
        <div className="hidden md:flex items-center space-x-8">
          <button onClick={() => setPage('home')} className={page === 'home' ? activeLinkClass : linkClass}>
            Explorar
          </button>
          <button onClick={() => setPage('about')} className={page === 'about' ? activeLinkClass : linkClass}>
            Nosotros
          </button>
        </div>

        {/* Área de Usuario (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center bg-[#0b0e0f] rounded px-3 py-1.5 border border-[#24272c]">
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

        {/* Botón Menú Hamburguesa (Mobile) */}
        <button
          className="md:hidden text-white p-2"
          onClick={toggleMenu}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Menú Mobile Desplegable */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#191b1f] border-b border-[#24272c] p-4 md:hidden flex flex-col space-y-4 shadow-xl animate-fade-in">
            <button onClick={() => handleNavClick('home')} className={page === 'home' ? activeLinkClass : linkClass}>
              Explorar
            </button>
            <button onClick={() => handleNavClick('about')} className={page === 'about' ? activeLinkClass : linkClass}>
              Nosotros
            </button>

            <div className="h-px bg-[#24272c] my-2"></div>

            {user ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between bg-[#0b0e0f] p-3 rounded border border-[#24272c]">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs font-bold uppercase">Monedas</span>
                    <span className="text-[#53FC18] font-bold">💰 {coins}</span>
                  </div>
                  <button
                    onClick={() => handleNavClick('buy-coins')}
                    className="text-xs bg-[#53FC18] text-black font-bold px-3 py-1 rounded hover:bg-[#42ca13]"
                  >
                    Comprar
                  </button>
                </div>

                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="flex items-center gap-3 text-white font-bold p-2 hover:bg-[#24272c] rounded"
                >
                  <div className="w-8 h-8 bg-gray-700 rounded-full overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="Avatar" />
                  </div>
                  <span>Mi Panel ({user.username})</span>
                </button>

                <button
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="text-red-500 font-bold text-sm uppercase tracking-wide p-2 hover:bg-[#24272c] rounded text-left"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleNavClick('login')}
                  className="w-full py-3 text-sm font-bold text-white bg-[#24272c] rounded hover:bg-[#32353b]"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="w-full py-3 text-sm font-bold bg-[#53FC18] text-black rounded hover:bg-[#42ca13]"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};
export default Header;