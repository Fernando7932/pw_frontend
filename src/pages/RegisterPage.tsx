import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import Modal from '../components/Modal';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { setPage } = useAuth();

  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.register(email, username, password);
      setShowModal(true);
    } catch (err: any) { setError(err.message); }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPage('login');
  };

  return (
    <div className="min-h-full flex items-center justify-center p-4 bg-[#0b0e0f]">
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="¡Registro Exitoso!"
        message="Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión."
        type="success"
      />

      <div className="w-full max-w-md bg-[#191b1f] p-8 rounded-xl border border-[#24272c] shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Únete a la comunidad</h1>
          <p className="text-gray-400 text-sm font-medium">Crea tu cuenta gratis</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded bg-[#0b0e0f] border border-[#24272c] text-white focus:border-[#53FC18] focus:outline-none transition-colors placeholder-gray-700 font-medium"
              placeholder="TuNombreDeUsuario"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded bg-[#0b0e0f] border border-[#24272c] text-white focus:border-[#53FC18] focus:outline-none transition-colors placeholder-gray-700 font-medium"
              placeholder="ejemplo@correo.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-[#0b0e0f] border border-[#24272c] text-white focus:border-[#53FC18] focus:outline-none transition-colors placeholder-gray-700 font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded text-center font-bold">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full p-3 bg-[#53FC18] text-black font-black uppercase rounded hover:bg-[#42ca13] transition-all shadow-[0_0_15px_rgba(83,252,24,0.2)] hover:shadow-[0_0_20px_rgba(83,252,24,0.4)] mt-6"
          >
            Registrarse
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-xs">
            ¿Ya tienes cuenta? <span className="text-[#53FC18] cursor-pointer hover:underline font-bold" onClick={() => setPage('login')}>Inicia Sesión</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;