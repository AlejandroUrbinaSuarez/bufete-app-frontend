import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../../api/axiosConfig';

const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'Pedro Perez y Asociados';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/contact', formData);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar el mensaje. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contacto | {SITE_NAME}</title>
        <meta name="description" content={`Contáctenos para una consulta legal gratuita. ${SITE_NAME} - Estamos aquí para ayudarle.`} />
      </Helmet>

      {/* Hero */}
      <section className="bg-primary-900 text-white py-16 lg:py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-white mb-4">Contáctenos</h1>
            <p className="text-xl text-gray-300">
              Estamos aquí para ayudarle. Envíenos un mensaje o visite nuestras oficinas
              para una consulta gratuita.
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-gray-100 py-3">
        <div className="container-custom">
          <nav className="text-sm text-gray-600">
            <Link to="/" className="hover:text-primary-600">Inicio</Link>
            <span className="mx-2">/</span>
            <span className="text-primary-900 font-medium">Contacto</span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <section className="section">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 shadow-card">
                <h2 className="text-2xl mb-6">Envíenos un mensaje</h2>

                {success ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-6 text-center">
                    <div className="text-4xl mb-4">✓</div>
                    <h3 className="text-xl mb-2">Mensaje enviado</h3>
                    <p className="mb-4">Gracias por contactarnos. Nos pondremos en contacto con usted a la brevedad.</p>
                    <button
                      onClick={() => setSuccess(false)}
                      className="btn-primary btn-sm"
                    >
                      Enviar otro mensaje
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="label">Nombre completo *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="input"
                          required
                          placeholder="Su nombre"
                        />
                      </div>
                      <div>
                        <label className="label">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="input"
                          required
                          placeholder="su@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="label">Teléfono</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="input"
                          placeholder="+1 234 567 890"
                        />
                      </div>
                      <div>
                        <label className="label">Asunto *</label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className="input"
                          required
                        >
                          <option value="">Seleccione un asunto</option>
                          <option value="consulta-general">Consulta general</option>
                          <option value="derecho-civil">Derecho Civil</option>
                          <option value="derecho-penal">Derecho Penal</option>
                          <option value="derecho-laboral">Derecho Laboral</option>
                          <option value="derecho-familiar">Derecho Familiar</option>
                          <option value="derecho-mercantil">Derecho Mercantil</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="label">Mensaje *</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className="input"
                        rows={5}
                        required
                        placeholder="Describa brevemente su caso o consulta..."
                      />
                    </div>

                    <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
                      <p>
                        Al enviar este formulario, acepta nuestra política de privacidad.
                        Su información será tratada de forma confidencial.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary btn-lg w-full md:w-auto"
                    >
                      {loading ? 'Enviando...' : 'Enviar Mensaje'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Contact Details */}
                <div className="bg-primary-900 rounded-2xl p-6 text-white">
                  <h3 className="text-white text-xl mb-6">Información de Contacto</h3>
                  <div className="space-y-4">
                    <a href="tel:+1234567890" className="flex items-start gap-4 text-gray-300 hover:text-white transition-colors">
                      <span className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        📞
                      </span>
                      <div>
                        <div className="text-sm text-gray-400">Teléfono</div>
                        <div>+1 234 567 890</div>
                      </div>
                    </a>
                    <a href="mailto:contacto@ejemplo.com" className="flex items-start gap-4 text-gray-300 hover:text-white transition-colors">
                      <span className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        ✉️
                      </span>
                      <div>
                        <div className="text-sm text-gray-400">Email</div>
                        <div>contacto@ejemplo.com</div>
                      </div>
                    </a>
                    <div className="flex items-start gap-4 text-gray-300">
                      <span className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        📍
                      </span>
                      <div>
                        <div className="text-sm text-gray-400">Dirección</div>
                        <div>Calle Principal 123<br />Ciudad, País</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="font-semibold mb-4">Horario de Atención</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lunes - Viernes</span>
                      <span className="font-medium">9:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sábado</span>
                      <span className="font-medium">9:00 - 13:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Domingo</span>
                      <span className="font-medium">Cerrado</span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-gold-50 border border-gold-200 rounded-2xl p-6 text-center">
                  <h4 className="font-semibold mb-2">¿Prefiere una cita?</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Agende una consulta con uno de nuestros abogados.
                  </p>
                  <Link to="/agendar-cita" className="btn-secondary w-full justify-center">
                    Agendar Cita
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="bg-gray-100 py-8">
        <div className="container-custom">
          <div className="bg-gray-300 rounded-2xl h-64 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <span className="text-4xl block mb-2">📍</span>
              <p>Mapa de ubicación</p>
              <p className="text-sm">(Integrar Google Maps aquí)</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
