import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { HiCheckCircle, HiExclamationCircle, HiRefresh } from 'react-icons/hi';

const VerifyEmailPage = () => {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const { token } = useParams();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Tu email ha sido verificado exitosamente');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Error al verificar el email');
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Token de verificación no proporcionado');
    }
  }, [token]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white p-8 rounded-xl shadow-card text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiRefresh className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-heading text-primary-900 mb-4">
              Verificando tu email...
            </h2>
            <p className="text-gray-600">
              Por favor espera mientras verificamos tu cuenta.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white p-8 rounded-xl shadow-card text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiCheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-heading text-primary-900 mb-4">
              ¡Email Verificado!
            </h2>
            <p className="text-gray-600 mb-6">
              {message}. Ya puedes iniciar sesión en tu cuenta.
            </p>
            <Link to="/login" className="btn-primary inline-block">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 rounded-xl shadow-card text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiExclamationCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-heading text-primary-900 mb-4">
            Error de Verificación
          </h2>
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          <div className="space-y-3">
            <Link to="/login" className="btn-primary inline-block w-full">
              Ir a Iniciar Sesión
            </Link>
            <p className="text-sm text-gray-500">
              Si el problema persiste, contacta a soporte.
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <p className="mt-8 text-center">
          <Link to="/" className="text-gray-500 hover:text-primary-600">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
