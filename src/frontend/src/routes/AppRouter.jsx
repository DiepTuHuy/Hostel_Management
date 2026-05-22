import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute.jsx';

const LoginPage = lazy(() => import('../views/auth/LoginPage.jsx'));
const AdminLayout = lazy(() => import('../layouts/AdminLayout.jsx'));
const AdminDashboard = lazy(() => import('../views/admin/DashboardPage.jsx'));
const AdminProperties = lazy(() => import('../views/admin/PropertiesPage.jsx'));
const AdminUsers = lazy(() => import('../views/admin/UsersPage.jsx'));
const AdminContracts = lazy(() => import('../views/admin/ContractsPage.jsx'));
const AdminInvoices = lazy(() => import('../views/admin/InvoicesPage.jsx'));
const AdminDebts = lazy(() => import('../views/admin/DebtsPage.jsx'));
const AdminServices = lazy(() => import('../views/admin/ServicesPage.jsx'));
const AdminReports = lazy(() => import('../views/admin/ReportsPage.jsx'));
const AdminSettings = lazy(() => import('../views/admin/SettingsPage.jsx'));

const ManagerLayout = lazy(() => import('../layouts/ManagerLayout.jsx'));
const ManagerDashboard = lazy(() => import('../views/manager/DashboardPage.jsx'));
const ManagerRooms = lazy(() => import('../views/manager/RoomsPage.jsx'));
const ManagerContracts = lazy(() => import('../views/manager/ContractsPage.jsx'));
const ManagerMeters = lazy(() => import('../views/manager/MetersPage.jsx'));
const ManagerCashReceipts = lazy(() => import('../views/manager/CashReceiptsPage.jsx'));
const ManagerNotifications = lazy(() => import('../views/manager/NotificationsPage.jsx'));

const TenantLayout = lazy(() => import('../layouts/TenantLayout.jsx'));
const TenantDashboard = lazy(() => import('../views/tenant/DashboardPage.jsx'));
const TenantContracts = lazy(() => import('../views/tenant/ContractsPage.jsx'));
const TenantInvoices = lazy(() => import('../views/tenant/InvoicesPage.jsx'));
const TenantProfile = lazy(() => import('../views/tenant/ProfilePage.jsx'));
const TenantNotifications = lazy(() => import('../views/tenant/NotificationsPage.jsx'));

const VisitorLayout = lazy(() => import('../layouts/VisitorLayout.jsx'));
const VisitorHome = lazy(() => import('../views/visitor/HomePage.jsx'));
const VisitorRooms = lazy(() => import('../views/visitor/RoomSearchPage.jsx'));
const VisitorRoomDetail = lazy(() => import('../views/visitor/RoomDetailPage.jsx'));
const VisitorDeposit = lazy(() => import('../views/visitor/DepositPage.jsx'));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-ink-muted">Đang tải...</span>
      </div>
    </div>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="branches" element={<AdminProperties />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="contracts" element={<AdminContracts />} />
          <Route path="invoices" element={<AdminInvoices />} />
          <Route path="debts" element={<AdminDebts />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route
          path="/manager"
          element={
            <ProtectedRoute roles={['manager']}>
              <ManagerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ManagerDashboard />} />
          <Route path="rooms" element={<ManagerRooms />} />
          <Route path="contracts" element={<ManagerContracts />} />
          <Route path="billing" element={<ManagerMeters />} />
          <Route path="meters" element={<ManagerMeters />} />
          <Route path="cash-receipts" element={<ManagerCashReceipts />} />
          <Route path="notifications" element={<ManagerNotifications />} />
        </Route>

        <Route
          path="/tenant"
          element={
            <ProtectedRoute roles={['tenant']}>
              <TenantLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TenantDashboard />} />
          <Route path="dashboard" element={<TenantDashboard />} />
          <Route path="contract" element={<TenantContracts />} />
          <Route path="contracts" element={<TenantContracts />} />
          <Route path="invoices" element={<TenantInvoices />} />
          <Route path="profile" element={<TenantProfile />} />
          <Route path="notifications" element={<TenantNotifications />} />
        </Route>

        <Route path="/" element={<VisitorLayout />}>
          <Route index element={<VisitorHome />} />
          <Route path="search" element={<VisitorRooms />} />
          <Route path="room/:id" element={<VisitorRoomDetail />} />
          <Route path="room/:id/deposit" element={<VisitorDeposit />} />
          <Route path="about" element={<VisitorHome />} />
          <Route path="contact" element={<VisitorHome />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
