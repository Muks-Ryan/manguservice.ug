import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { TechnicianList } from './components/TechnicianList';
import { TechnicianFormModal } from './components/TechnicianFormModal';
import { TechnicianDetailsModal } from './components/TechnicianDetailsModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { Toast, ToastMessage } from './components/Toast';

import { AuthSwitchBar } from './components/auth/AuthSwitchBar';
import { UserLoginPage } from './components/auth/UserLoginPage';
import { AdminLoginPage } from './components/auth/AdminLoginPage';

import { ClientDashboard } from './components/client/ClientDashboard';
import { ClientSettings } from './components/client/ClientSettings';
import { TechnicianDashboard } from './components/technician/TechnicianDashboard';
import { TechnicianSettings } from './components/technician/TechnicianSettings';
import { AdminSettings } from './components/admin/AdminSettings';

import { technicianService } from './services/technicianService';
import { authService } from './services/authService';
import { Technician, TechnicianFormData, FilterOptions, User, UserRole } from './types';

export const App: React.FC = () => {
  // Theme State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('mangu_theme') === 'dark';
  });

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return authService.getCurrentUser();
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [activeAuthPortal, setActiveAuthPortal] = useState<'user' | 'admin'>('user');

  // Active View ('dashboard' | 'settings')
  const [activeView, setActiveView] = useState<'dashboard' | 'settings'>('dashboard');

  // Technician Data State
  const [allTechnicians, setAllTechnicians] = useState<Technician[]>([]);
  const [filteredTechnicians, setFilteredTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters State
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    trade: 'ALL',
    town: 'ALL',
    status: 'ALL',
  });

  // Admin Modal States
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [viewingTech, setViewingTech] = useState<Technician | null>(null);
  const [deletingTech, setDeletingTech] = useState<Technician | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Toggle Theme
  const handleToggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    localStorage.setItem('mangu_theme', nextMode ? 'dark' : 'light');
    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Restore the server session before rendering role-specific application content.
  useEffect(() => {
    authService.hydrateCurrentUser().then((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
  }, []);

  // Load Technicians from Service
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const all = await technicianService.getAll();
      setAllTechnicians(all);
      const filtered = await technicianService.getAll(filters);
      setFilteredTechnicians(filtered);
    } catch (err: any) {
      showToast('Error Loading Data', err.message || 'Could not fetch records.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // AUTH ACTIONS
  const handleLoginSuccess = () => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    setActiveView('dashboard');
    showToast('Signed In', `Welcome back, ${user?.name || 'User'}!`, 'success');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setActiveView('dashboard');
    showToast('Signed Out', 'You have been safely signed out.', 'info');
  };

  // CREATE / UPDATE (Admin or General)
  const handleFormSubmit = async (formData: TechnicianFormData) => {
    try {
      if (editingTech) {
        const updated = await technicianService.update(editingTech.id, formData);
        showToast('Technician Updated', `${updated.name} was successfully updated.`, 'success');
      } else {
        const created = await technicianService.create(formData);
        showToast('Technician Added', `${created.name} was added to the directory.`, 'success');
      }
      setIsFormOpen(false);
      setEditingTech(null);
      await loadData();
    } catch (err: any) {
      showToast('Save Error', err.message || 'Failed to save technician.', 'error');
      throw err;
    }
  };

  // DELETE (Admin)
  const handleDeleteConfirm = async () => {
    if (!deletingTech) return;
    try {
      await technicianService.delete(deletingTech.id);
      showToast('Technician Deleted', `${deletingTech.name} was removed from the directory.`, 'success');
      setDeletingTech(null);
      await loadData();
    } catch (err: any) {
      showToast('Delete Error', err.message || 'Failed to delete record.', 'error');
    }
  };

  // RESET TO DEFAULT SEED
  const handleResetData = async () => {
    if (window.confirm('Reset all technician records to the default Ugandan directory seed data?')) {
      try {
        await technicianService.resetToDefaults();
        showToast('Data Reset', 'Directory reloaded with default seed technicians.', 'info');
        await loadData();
      } catch (err: any) {
        showToast('Reset Failed', err.message || 'Could not reset records.', 'error');
      }
    }
  };

  // Find linked technician record for technician role
  const currentTechnicianRecord = currentUser?.role === 'technician'
    ? allTechnicians.find(
        (t) =>
          (currentUser.technicianId && t.id === currentUser.technicianId) ||
          t.email.toLowerCase() === currentUser.email.toLowerCase()
      ) || null
    : null;

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Loading session...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* 1. NOT LOGGED IN: Combined User Portal (Client & Technician) vs Separate Admin Portal */}
      {!currentUser ? (
        <div className="flex-1 flex flex-col">
          {/* Top Switcher Bar between User Portal and Admin Portal */}
          <AuthSwitchBar
            activePortal={activeAuthPortal}
            onSelectPortal={(portal) => setActiveAuthPortal(portal)}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />

          {/* Login View: Unified User Login or Separated Admin Login */}
          <div className="flex-1 flex items-center justify-center p-4">
            {activeAuthPortal === 'user' ? (
              <UserLoginPage
                onSuccess={handleLoginSuccess}
                onSwitchToAdmin={() => setActiveAuthPortal('admin')}
              />
            ) : (
              <AdminLoginPage
                onSuccess={handleLoginSuccess}
                onSwitchToUserPortal={() => setActiveAuthPortal('user')}
              />
            )}
          </div>
        </div>
      ) : (
        /* 2. LOGGED IN: Role-specific Navigation, Dashboards, and Settings */
        <div className="flex-1 flex flex-col">
          <Navbar
            user={currentUser}
            activeView={activeView}
            onSelectView={setActiveView}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
            onOpenCreateModal={
              currentUser.role === 'admin'
                ? () => {
                    setEditingTech(null);
                    setIsFormOpen(true);
                  }
                : undefined
            }
            onLogout={handleLogout}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
            {/* ============================================================ */}
            {/* ADMIN ROLE VIEWS */}
            {/* ============================================================ */}
            {currentUser.role === 'admin' && (
              <>
                {activeView === 'dashboard' ? (
                  <div className="space-y-6">
                    {/* Admin Summary Metrics */}
                    <StatsBar technicians={allTechnicians} />

                    {/* Admin Full CRUD Directory */}
                    <TechnicianList
                      technicians={filteredTechnicians}
                      filters={filters}
                      onFilterChange={setFilters}
                      onView={(tech) => setViewingTech(tech)}
                      onEdit={(tech) => {
                        setEditingTech(tech);
                        setIsFormOpen(true);
                      }}
                      onDelete={(tech) => setDeletingTech(tech)}
                      onAddNew={() => {
                        setEditingTech(null);
                        setIsFormOpen(true);
                      }}
                    />
                  </div>
                ) : (
                  <AdminSettings
                    currentUser={currentUser}
                    onShowToast={showToast}
                  />
                )}
              </>
            )}

            {/* ============================================================ */}
            {/* TECHNICIAN ROLE VIEWS */}
            {/* ============================================================ */}
            {currentUser.role === 'technician' && (
              <>
                {activeView === 'dashboard' ? (
                  <TechnicianDashboard
                    user={currentUser}
                    technician={currentTechnicianRecord}
                    onRefreshData={loadData}
                    onShowToast={showToast}
                    onNavigateToSettings={() => setActiveView('settings')}
                  />
                ) : (
                  <TechnicianSettings
                    user={currentUser}
                    technician={currentTechnicianRecord}
                    onRefreshData={loadData}
                    onUserUpdate={(updated) => setCurrentUser(updated)}
                    onShowToast={showToast}
                  />
                )}
              </>
            )}

            {/* ============================================================ */}
            {/* CLIENT ROLE VIEWS */}
            {/* ============================================================ */}
            {currentUser.role === 'client' && (
              <>
                {activeView === 'dashboard' ? (
                  <ClientDashboard
                    user={currentUser}
                    technicians={filteredTechnicians}
                    filters={filters}
                    onFilterChange={setFilters}
                  />
                ) : (
                  <ClientSettings
                    user={currentUser}
                    onUserUpdate={(updated) => setCurrentUser(updated)}
                    onShowToast={showToast}
                  />
                )}
              </>
            )}
          </main>
        </div>
      )}

      {/* Global Minimal Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-3.5 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          Mangu Service UG • Simple Role-Based Architecture (Client, Technician, Admin) •{' '}
          <a href="/database.sql" download="database.sql" className="font-semibold underline hover:text-amber-600">
            database.sql
          </a>
        </p>
      </footer>

      {/* ADMIN CREATE & UPDATE MODAL */}
      <TechnicianFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTech(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingTech}
      />

      {/* READ / DETAILS MODAL */}
      <TechnicianDetailsModal
        technician={viewingTech}
        onClose={() => setViewingTech(null)}
        onEdit={
          currentUser?.role === 'admin'
            ? (tech) => {
                setViewingTech(null);
                setEditingTech(tech);
                setIsFormOpen(true);
              }
            : undefined
        }
      />

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={!!deletingTech}
        technician={deletingTech}
        onClose={() => setDeletingTech(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* TOAST NOTIFICATIONS */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
};

export default App;
