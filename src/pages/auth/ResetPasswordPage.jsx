import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { HiLockClosed, HiEye, HiEyeOff, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi';

const ResetPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const { resetPassword } = useAuth();
  const { token } = useParams();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    const result = await resetPassword(token, data.password);
    setIsLoading(false);

    if (result.success) {
      setSuccess(true);
      toast.success('Contraseña restablecida exitosamente');
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setError(result.error);
      toast.error(result.error);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white p-8 rounded-xl shadow-card text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiCheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-heading text-primary-900 mb-4">
              ¡Contraseña Actualizada!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu contraseña ha sido restablecida exitosamente.
              Serás redirigido al inicio de sesión en unos segundos...
            </p>
            <Link to="/login" className="btn-primary inline-block">
              Ir a Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error && (error.includes('expirado') || error.includes('inválido') || error.includes('expired') || error.includes('invalid'))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white p-8 rounded-xl shadow-card text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiExclamationCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-heading text-primary-900 mb-4">
              Enlace Expirado
            </h2>
            <p className="text-gray-600 mb-6">
              El enlace de recuperación ha expirado o no es válido.
              Por favor, solicita uno nuevo.
            </p>
            <Link to="/recuperar-password" className="btn-primary inline-block">
              Solicitar Nuevo Enlace
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
            Nueva Contraseña
          </h2>
          <p className="mt-2 text-gray-600">
            Ingresa tu nueva contraseña
          </p>
        </div>

        {/* Form */}
        <div className="bg-white p-8 rounded-xl shadow-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Password */}
            <div>
              <label className="label">Nueva Contraseña</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Debe incluir mayúscula, minúscula y número'
                    }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="error-message">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">Confirmar Contraseña</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`input pl-10 pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  {...register('confirmPassword', {
                    required: 'Confirma tu contraseña',
                    validate: value => value === password || 'Las contraseñas no coinciden'
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="error-message">{errors.confirmPassword.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Guardando...' : 'Restablecer Contraseña'}
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

export default ResetPasswordPage;
