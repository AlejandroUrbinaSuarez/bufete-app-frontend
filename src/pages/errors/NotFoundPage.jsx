import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-primary-200">404</h1>
        <h2 className="text-2xl font-heading text-primary-900 mt-4 mb-2">
          Página no encontrada
        </h2>
        <p className="text-gray-600 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <Link to="/" className="btn-primary">
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
