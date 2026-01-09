import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import ClientLayout from './components/layout/ClientLayout';
import AdminLayout from './components/layout/AdminLayout';

// Route Guards
import ProtectedRoute from './routes/ProtectedRoute';

// Loading component
import Loader from './components/common/Loader';

// Lazy load pages para mejor performance
const HomePage = lazy(() => import('./pages/public/HomePage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const ServicesPage = lazy(() => import('./pages/public/ServicesPage'));
const ServiceDetailPage = lazy(() => import('./pages/public/ServiceDetailPage'));
const TeamPage = lazy(() => import('./pages/public/TeamPage'));
const LawyerProfilePage = lazy(() => import('./pages/public/LawyerProfilePage'));
const BlogPage = lazy(() => import('./pages/public/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/public/BlogPostPage'));
const SuccessCasesPage = lazy(() => import('./pages/public/SuccessCasesPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const BookAppointmentPage = lazy(() => import('./pages/public/BookAppointmentPage'));

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));

// Client Pages
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard'));
const MyCasesPage = lazy(() => import('./pages/client/MyCasesPage'));
const CaseDetailPage = lazy(() => import('./pages/client/CaseDetailPage'));
const MyAppointmentsPage = lazy(() => import('./pages/client/MyAppointmentsPage'));
const DocumentsPage = lazy(() => import('./pages/client/DocumentsPage'));
const MessagesPage = lazy(() => import('./pages/client/MessagesPage'));
const ProfilePage = lazy(() => import('./pages/client/ProfilePage'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageServicesPage = lazy(() => import('./pages/admin/ManageServicesPage'));
const ManageLawyersPage = lazy(() => import('./pages/admin/ManageLawyersPage'));
const ManageBlogPage = lazy(() => import('./pages/admin/ManageBlogPage'));
const ManageCasesPage = lazy(() => import('./pages/admin/ManageCasesPage'));
const ManageAppointmentsPage = lazy(() => import('./pages/admin/ManageAppointmentsPage'));
const ManageContactsPage = lazy(() => import('./pages/admin/ManageContactsPage'));
const ManageSuccessCasesPage = lazy(() => import('./pages/admin/ManageSuccessCasesPage'));
const ManageTestimonialsPage = lazy(() => import('./pages/admin/ManageTestimonialsPage'));
const LiveChatPage = lazy(() => import('./pages/admin/LiveChatPage'));

// Error Pages
const NotFoundPage = lazy(() => import('./pages/errors/NotFoundPage'));

function App() {
  return (
    <Suspense fallback={<Loader fullScreen />}>
      <Routes>
        {/* ======================= */}
        {/* RUTAS PÚBLICAS */}
        {/* ======================= */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/nosotros" element={<AboutPage />} />
          <Route path="/servicios" element={<ServicesPage />} />
          <Route path="/servicios/:slug" element={<ServiceDetailPage />} />
          <Route path="/equipo" element={<TeamPage />} />
          <Route path="/equipo/:slug" element={<LawyerProfilePage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/casos-exito" element={<SuccessCasesPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/agendar-cita" element={<BookAppointmentPage />} />
        </Route>

        {/* ======================= */}
        {/* RUTAS DE AUTENTICACIÓN */}
        {/* ======================= */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/recuperar-password" element={<ForgotPasswordPage />} />
        <Route path="/restablecer-password/:token" element={<ResetPasswordPage />} />
        <Route path="/verificar-email/:token" element={<VerifyEmailPage />} />

        {/* ======================= */}
        {/* RUTAS DE CLIENTE (PROTEGIDAS) */}
        {/* ======================= */}
        <Route element={<ProtectedRoute allowedRoles={['client', 'admin', 'lawyer']} />}>
          <Route element={<ClientLayout />}>
            <Route path="/portal" element={<ClientDashboard />} />
            <Route path="/portal/casos" element={<MyCasesPage />} />
            <Route path="/portal/casos/:id" element={<CaseDetailPage />} />
            <Route path="/portal/citas" element={<MyAppointmentsPage />} />
            <Route path="/portal/documentos" element={<DocumentsPage />} />
            <Route path="/portal/mensajes" element={<MessagesPage />} />
            <Route path="/portal/perfil" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* ======================= */}
        {/* RUTAS DE ADMIN (PROTEGIDAS) */}
        {/* ======================= */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'lawyer']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/servicios" element={<ManageServicesPage />} />
            <Route path="/admin/abogados" element={<ManageLawyersPage />} />
            <Route path="/admin/blog" element={<ManageBlogPage />} />
            <Route path="/admin/casos" element={<ManageCasesPage />} />
            <Route path="/admin/citas" element={<ManageAppointmentsPage />} />
            <Route path="/admin/contactos" element={<ManageContactsPage />} />
            <Route path="/admin/casos-exito" element={<ManageSuccessCasesPage />} />
            <Route path="/admin/testimonios" element={<ManageTestimonialsPage />} />
            <Route path="/admin/chat" element={<LiveChatPage />} />
          </Route>
        </Route>

        {/* ======================= */}
        {/* 404 */}
        {/* ======================= */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
