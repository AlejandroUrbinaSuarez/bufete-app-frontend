import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';

const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'Pedro Perez y Asociados';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/portal';

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await login(data.email, data.password);
    setIsLoading(false);

    if (result.success) {
      toast.success('¡Bienvenido!');
      const redirectTo = result.user.role === 'client' ? '/portal' : '/admin';
      navigate(from !== '/portal' ? from : redirectTo, { replace: true });
    } else {
      toast.error(result.error);
    }
  };

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
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-gray-600">
            Accede a tu portal de cliente
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

            {/* Password */}
            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  {...register('password', { required: 'La contraseña es requerida' })}
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

            {/* Forgot Password */}
            <div className="text-right">
              <Link to="/recuperar-password" className="text-sm text-primary-600 hover:text-primary-800">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-primary-600 hover:text-primary-800 font-medium">
              Regístrate aquí
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

export default LoginPage;
