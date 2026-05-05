import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './components/AppLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage';
import DocumentsPage from './pages/DocumentsPage';
import TeamPage from './pages/TeamPage';
import AIAssistantPage from './pages/AIAssistantPage';
import InvoicesPage from './pages/InvoicesPage';
import SettingsPage from './pages/SettingsPage';

type PublicPage = 'landing' | 'login' | 'register';
type AppPage = 'dashboard' | 'projects' | 'tasks' | 'documents' | 'team' | 'ai' | 'invoices' | 'settings';

function AppInner() {
  const { user, profile, company, loading } = useAuth();
  const [publicPage, setPublicPage] = useState<PublicPage>('landing');
  const [appPage, setAppPage] = useState<AppPage>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Indlæser...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (publicPage === 'login') return <LoginPage onNavigate={(p) => setPublicPage(p as PublicPage)} />;
    if (publicPage === 'register') return <RegisterPage onNavigate={(p) => setPublicPage(p as PublicPage)} />;
    return <LandingPage onNavigate={(p) => setPublicPage(p as PublicPage)} />;
  }

  if (!profile?.company_id || !company) {
    return <OnboardingPage />;
  }

  const handleNavigate = (page: string) => {
    setAppPage(page as AppPage);
  };

  const renderPage = () => {
    switch (appPage) {
      case 'dashboard': return <DashboardPage onNavigate={handleNavigate} />;
      case 'projects': return <ProjectsPage />;
      case 'tasks': return <TasksPage />;
      case 'documents': return <DocumentsPage />;
      case 'team': return <TeamPage />;
      case 'ai': return <AIAssistantPage />;
      case 'invoices': return <InvoicesPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <AppLayout currentPage={appPage} onNavigate={handleNavigate}>
      {renderPage()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
