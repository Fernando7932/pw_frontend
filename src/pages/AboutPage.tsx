
import React from 'react';
import FernandoImg from '../static/images/Fernando Quispe.png';
import FlaviaImg from '../static/images/Flavia Vigil.png';
import HeidiImg from '../static/images/Heidi Palacios.jpg';
import JoaquinImg from '../static/images/Joaquin Monroy.jpg';
import MarkoImg from '../static/images/Marko Lopez.jpg';

const AboutPage: React.FC = () => {
  const teamMembers = [
    {
      name: 'Fernando Quispe',
      role: 'Desarrollador Principal',
      image: FernandoImg,
      quote: '"Construyendo el futuro del streaming línea por línea."'
    },
    {
      name: 'Flavia Vigil',
      role: 'Diseñadora UI/UX',
      image: FlaviaImg,
      quote: '"Creando experiencias visuales impactantes."'
    },
    {
      name: 'Heidi Palacios',
      role: 'Frontend Developer',
      image: HeidiImg,
      quote: '"Dando vida a las interfaces."'
    },
    {
      name: 'Joaquin Monroy',
      role: 'Backend Developer',
      image: JoaquinImg,
      quote: '"Optimizando el rendimiento del servidor."'
    },
    {
      name: 'Marko Lopez',
      role: 'Full Stack Developer',
      image: MarkoImg,
      quote: '"Integrando soluciones completas."'
    }
  ];

  return (
    <div className="p-8 bg-[#0b0e0f] min-h-full text-white">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
          Sobre <span className="text-[#53FC18]">Nosotros</span>
        </h1>
        <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
          Somos un equipo apasionado creando la próxima generación de streaming interactivo para universitarios.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-[#191b1f] p-6 rounded-xl border border-[#24272c] hover:border-[#53FC18] transition-colors group w-full max-w-sm">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-[#24272c] group-hover:border-[#53FC18] transition-colors">
                <img
                  src={member.image}
                  alt={`Foto de ${member.name} `}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-white">{member.name}</h3>
              <p className="text-[#53FC18] text-sm font-bold uppercase tracking-wide mt-1">{member.role}</p>
              <p className="text-gray-500 text-xs mt-4">
                {member.quote}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;