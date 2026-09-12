import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { AppLayout } from '../components/layout/AppLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { PropertiesListPage } from '../pages/properties/PropertiesListPage';
import { PropertyDetailPage } from '../pages/properties/PropertyDetailPage';
import { ChargesListPage } from '../pages/charges/ChargesListPage';
import { ChargeDetailPage } from '../pages/charges/ChargeDetailPage';
import { CalendarPage } from '../pages/calendar/CalendarPage';
import { FinancialPage } from '../pages/financial/FinancialPage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { SettingsPage } from '../pages/settings/SettingsPage';

import { RentalsListPage } from '../pages/rentals/RentalsListPage';
import { RentalDetailPage } from '../pages/rentals/RentalDetailPage';
import { ClientsListPage } from '../pages/clients/ClientsListPage';
import { ClientDetailPage } from '../pages/clients/ClientDetailPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="alugueis" element={<RentalsListPage />} />
        <Route path="alugueis/:id" element={<RentalDetailPage />} />
        <Route path="clientes" element={<ClientsListPage />} />
        <Route path="clientes/:id" element={<ClientDetailPage />} />
        <Route path="imoveis" element={<PropertiesListPage />} />
        <Route path="imoveis/:id" element={<PropertyDetailPage />} />
        <Route path="inquilinos" element={<ClientsListPage />} />
        <Route path="inquilinos/:id" element={<ClientDetailPage />} />
        <Route path="cobrancas" element={<ChargesListPage />} />
        <Route path="cobrancas/:id" element={<ChargeDetailPage />} />
        <Route path="calendario" element={<CalendarPage />} />
        <Route path="financeiro" element={<FinancialPage />} />
        <Route path="relatorios" element={<ReportsPage />} />
        <Route path="configuracoes" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
