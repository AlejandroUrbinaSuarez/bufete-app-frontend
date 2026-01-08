import { Link } from 'react-router-dom';

const VerifyEmailPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full text-center">
        <h2 className="text-2xl font-heading text-primary-900 mb-4">VerifyEmailPage</h2>
        <p className="text-gray-600 mb-8">Esta página está en construcción.</p>
        <Link to="/login" className="btn-primary">
          Ir a Login
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
