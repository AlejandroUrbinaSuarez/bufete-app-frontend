import { clsx } from 'clsx';

/**
 * Componente de carga
 * @param {boolean} fullScreen - Si ocupa toda la pantalla
 * @param {string} size - Tamaño del spinner (sm, md, lg)
 * @param {string} text - Texto a mostrar
 */
const Loader = ({ fullScreen = false, size = 'md', text = 'Cargando...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={clsx(
          'rounded-full border-primary-200 border-t-primary-900 animate-spin',
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="text-gray-600 text-sm font-medium">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  );
};

export default Loader;
