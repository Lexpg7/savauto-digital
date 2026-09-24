import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import MiniAppLayout from './layouts/MiniAppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import ClientsPage from './pages/admin/ClientsPage';
import ClientDetailPage from './pages/admin/ClientDetailPage';
import LeadsPage from './pages/admin/LeadsPage';
import DealsPage from './pages/admin/DealsPage';
import CarsPage from './pages/admin/CarsPage';
import CarDetailPage from './pages/admin/CarDetailPage';
import KanbanPage from './pages/admin/KanbanPage';
import PaymentsPage from './pages/admin/PaymentsPage';
import TasksPage from './pages/admin/TasksPage';
import DocumentsPage from './pages/admin/DocumentsPage';
import SupportPage from './pages/admin/SupportPage';
import NotificationsPage from './pages/admin/NotificationsPage';
import SettingsPage from './pages/admin/SettingsPage';
import MiniAppHome from './pages/miniapp/MiniAppHome';
import MiniAppCars from './pages/miniapp/MiniAppCars';
import MiniAppCarDetail from './pages/miniapp/MiniAppCarDetail';
import MiniAppNotifications from './pages/miniapp/MiniAppNotifications';
import MiniAppSupport from './pages/miniapp/MiniAppSupport';
import MiniAppProfile from './pages/miniapp/MiniAppProfile';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Admin Panel */}
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="clients/:id" element={<ClientDetailPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="deals" element={<DealsPage />} />
          <Route path="cars" element={<CarsPage />} />
          <Route path="cars/:id" element={<CarDetailPage />} />
          <Route path="cars/kanban" element={<KanbanPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Telegram Mini App */}
        <Route path="/app" element={<MiniAppLayout />}>
          <Route index element={<MiniAppHome />} />
          <Route path="cars" element={<MiniAppCars />} />
          <Route path="cars/:id" element={<MiniAppCarDetail />} />
          <Route path="notifications" element={<MiniAppNotifications />} />
          <Route path="support" element={<MiniAppSupport />} />
          <Route path="profile" element={<MiniAppProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
