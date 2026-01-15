import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiUser, HiPhone } from 'react-icons/hi';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register: registerUser } = useAuth();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await registerUser({
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone || undefined
    });
    setIsLoading(false);

    if (result.success) {
      setSuccess(true);
      toast.success('Cuenta creada exitosamente');
    } else {
      if (result.details) {
        result.details.forEach(err => toast.error(err.msg || err.message));
      } else {
        toast.error(result.error);
      }
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white p-8 rounded-xl shadow-card text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiMail className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-heading text-primary-900 mb-4">
              ¡Revisa tu correo!
            </h2>
            <p className="text-gray-600 mb-6">
              Hemos enviado un enlace de verificación a tu correo electrónico.
              Por favor, verifica tu cuenta para poder iniciar sesión.
            </p>
            <Link to="/login" className="btn-primary inline-block">
              Ir a Iniciar Sesión
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
            Crear Cuenta
          </h2>
          <p className="mt-2 text-gray-600">
            Regístrate para acceder a nuestros servicios
          </p>
        </div>

        {/* Form */}
        <div className="bg-white p-8 rounded-xl shadow-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre</label>
                <div className="relative">
                  <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    className={`input pl-10 ${errors.first_name ? 'input-error' : ''}`}
                    placeholder="Juan"
                    {...register('first_name', {
                      required: 'El nombre es requerido',
                      minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                    })}
                  />
                </div>
                {errors.first_name && <p className="error-message">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="label">Apellido</label>
                <input
                  type="text"
                  className={`input ${errors.last_name ? 'input-error' : ''}`}
                  placeholder="Pérez"
                  {...register('last_name', {
                    required: 'El apellido es requerido',
                    minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                  })}
                />
                {errors.last_name && <p className="error-message">{errors.last_name.message}</p>}
              </div>
            </div>

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

            {/* Teléfono (opcional) */}
            <div>
              <label className="label">Teléfono <span className="text-gray-400 text-sm">(opcional)</span></label>
              <div className="relative">
                <HiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  className={`input pl-10 ${errors.phone ? 'input-error' : ''}`}
                  placeholder="+34 600 000 000"
                  {...register('phone', {
                    pattern: {
                      value: /^[+]?[\d\s-]{9,}$/,
                      message: 'Teléfono inválido'
                    }
                  })}
                />
              </div>
              {errors.phone && <p className="error-message">{errors.phone.message}</p>}
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
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-gray-600">
            ¿Ya tienes cuenta?{' '}
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

export default RegisterPage;
