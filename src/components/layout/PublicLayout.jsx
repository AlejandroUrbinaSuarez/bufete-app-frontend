import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Layout para páginas públicas
 */
const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
