import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { HomePage } from '@/components/HomePage';
import { AboutPage } from '@/components/AboutPage';
import { ProjectPage } from '@/components/ProjectPage';
import { BlogPage } from '@/components/BlogPage';
import { BlogPostPage } from '@/components/BlogPostPage';
import { ContactPage } from '@/components/ContactPage';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AuthProvider } from '@/components/admin/AuthProvider';
import './App.css';

export type Route = 'home' | 'about' | 'projects' | 'blog' | 'blog-post' | 'contact' | 'admin' | 'admin-dashboard';

interface AppState {
  currentRoute: Route;
  blogPostSlug?: string;
}

function App() {
  const [appState, setAppState] = useState<AppState>({
    currentRoute: 'home'
  });

  const navigateTo = (route: Route, blogPostSlug?: string) => {
    setAppState({ currentRoute: route, blogPostSlug });
  };

  const renderCurrentPage = () => {
    switch (appState.currentRoute) {
      case 'home':
        return <HomePage />;
      case 'about':
        return <AboutPage />;
      case 'projects':
        return <ProjectPage />;
      case 'blog':
        return <BlogPage onNavigateToPost={(slug) => navigateTo('blog-post', slug)} />;
      case 'blog-post':
        return <BlogPostPage slug={appState.blogPostSlug} onNavigateBack={() => navigateTo('blog')} />;
      case 'contact':
        return <ContactPage />;
      case 'admin':
        return <AdminLogin onLoginSuccess={() => navigateTo('admin-dashboard')} onNavigateHome={() => navigateTo('home')} />;
      case 'admin-dashboard':
        return <AdminDashboard onLogout={() => navigateTo('admin')} onNavigateHome={() => navigateTo('home')} />;
      default:
        return <HomePage />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Only show navbar for non-admin routes */}
        {!appState.currentRoute.startsWith('admin') && (
          <Navbar currentRoute={appState.currentRoute} onNavigate={navigateTo} />
        )}
        {renderCurrentPage()}
      </div>
    </AuthProvider>
  );
}

export default App;