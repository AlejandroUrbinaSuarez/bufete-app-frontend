import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { HiPhone, HiMail, HiLocationMarker } from 'react-icons/hi';
import { FaFacebookF, FaLinkedinIn, FaTwitter, FaInstagram } from 'react-icons/fa';
import { settingsApi } from '../../api/settings';

const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'Pedro Perez y Asociados';

// Obtener iniciales de las primeras dos palabras significativas (>2 caracteres)
const getInitials = (name) => {
  const words = name.split(' ').filter(w => w.length > 2);
  return words.slice(0, 2).map(w => w[0].toUpperCase()).join('');
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const initials = getInitials(SITE_NAME);

  const { data: settings } = useQuery({
    queryKey: ['settings', 'public'],
    queryFn: () => settingsApi.getPublic().then(res => res.data),
    staleTime: 1000 * 60 * 30, // 30 minutos
  });

  return (
    <footer className="bg-primary-900 text-white">
      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Columna 1: Logo e Info */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-heading font-bold text-xl">{initials}</span>
              </div>
              <span className="font-heading font-semibold text-white text-lg">
                {SITE_NAME}
              </span>
            </Link>
            <p className="text-gray-300 text-sm mb-6">
              Protegemos sus derechos con profesionalismo, dedicación y más de 20 años de experiencia legal.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold-500 transition-colors"
                aria-label="Facebook"
              >
                <FaFacebookF className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold-500 transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold-500 transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold-500 transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Columna 2: Servicios */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Áreas de Práctica</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/servicios/derecho-civil" className="text-gray-300 hover:text-gold-500 text-sm">
                  Derecho Civil
                </Link>
              </li>
              <li>
                <Link to="/servicios/derecho-penal" className="text-gray-300 hover:text-gold-500 text-sm">
                  Derecho Penal
                </Link>
              </li>
              <li>
                <Link to="/servicios/derecho-laboral" className="text-gray-300 hover:text-gold-500 text-sm">
                  Derecho Laboral
                </Link>
              </li>
              <li>
                <Link to="/servicios/derecho-familiar" className="text-gray-300 hover:text-gold-500 text-sm">
                  Derecho Familiar
                </Link>
              </li>
              <li>
                <Link to="/servicios/derecho-mercantil" className="text-gray-300 hover:text-gold-500 text-sm">
                  Derecho Mercantil
                </Link>
              </li>
              <li>
                <Link to="/servicios" className="text-gold-500 hover:text-gold-400 text-sm font-medium">
                  Ver todos los servicios →
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Enlaces Rápidos */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/nosotros" className="text-gray-300 hover:text-gold-500 text-sm">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link to="/equipo" className="text-gray-300 hover:text-gold-500 text-sm">
                  Nuestro Equipo
                </Link>
              </li>
              <li>
                <Link to="/casos-exito" className="text-gray-300 hover:text-gold-500 text-sm">
                  Casos de Éxito
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-gold-500 text-sm">
                  Blog Legal
                </Link>
              </li>
              <li>
                <Link to="/agendar-cita" className="text-gray-300 hover:text-gold-500 text-sm">
                  Agendar Cita
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-gray-300 hover:text-gold-500 text-sm">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <HiLocationMarker className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm whitespace-pre-line">
                  {settings?.site_address || 'Calle Principal 123, Ciudad'}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <HiPhone className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <a
                  href={`tel:${(settings?.site_phone || '+1234567890').replace(/\s/g, '')}`}
                  className="text-gray-300 hover:text-gold-500 text-sm"
                >
                  {settings?.site_phone || '+1 234 567 890'}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <HiMail className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <a
                  href={`mailto:${settings?.site_email || 'contacto@ejemplo.com'}`}
                  className="text-gray-300 hover:text-gold-500 text-sm"
                >
                  {settings?.site_email || 'contacto@ejemplo.com'}
                </a>
              </li>
            </ul>

            {/* Horario */}
            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <p className="text-sm font-medium mb-2">Horario de Atención</p>
              <p className="text-gray-300 text-sm">{settings?.site_schedule || 'Lunes a Viernes: 9:00 - 18:00'}</p>
              <p className="text-gray-300 text-sm">{settings?.site_schedule_weekend || 'Sábado: 9:00 - 13:00'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/10">
        <div className="container-custom py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {currentYear} {SITE_NAME}. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <Link to="/privacidad" className="text-gray-400 hover:text-gold-500 text-sm">
              Política de Privacidad
            </Link>
            <Link to="/terminos" className="text-gray-400 hover:text-gold-500 text-sm">
              Términos de Servicio
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
