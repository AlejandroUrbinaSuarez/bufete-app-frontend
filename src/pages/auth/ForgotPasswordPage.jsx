import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { HiMail } from 'react-icons/hi';

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { forgotPassword } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await forgotPassword(data.email);
    setIsLoading(false);

    if (result.success) {
      setSuccess(true);
    } else {
      toast.error(result.error);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white p-8 rounded-xl shadow-card text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiMail className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-heading text-primary-900 mb-4">
              Revisa tu correo
            </h2>
            <p className="text-gray-600 mb-6">
              Si existe una cuenta asociada a ese email, recibirás un enlace
              para restablecer tu contraseña. El enlace expira en 1 hora.
            </p>
            <Link to="/login" className="btn-primary inline-block">
              Volver a Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-primary-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-heading font-bold text-2xl">PP</span>
            </div>
          </Link>
          <h2 className="mt-4 text-2xl font-heading text-primary-900">
            Recuperar Contraseña
          </h2>
          <p className="mt-2 text-gray-600">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        {/* Form */}
        <div className="bg-white p-8 rounded-xl shadow-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                  placeholder="tu@email.com"
                  {...register('email', {
                    required: 'El email es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                />
              </div>
              {errors.email && <p className="error-message">{errors.email.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-gray-600">
            ¿Recordaste tu contraseña?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-800 font-medium">
              Inicia sesión
            </Link>
          </p>
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

export default ForgotPasswordPage;
