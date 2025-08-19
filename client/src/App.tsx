import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { HomePage } from '@/components/HomePage';
import { AboutPage } from '@/components/AboutPage';
import { ProjectPage } from '@/components/ProjectPage';
import { BlogPage } from '@/components/BlogPage';
import { BlogPostPage } from '@/components/BlogPostPage';
import { ContactPage } from '@/components/ContactPage';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AuthProvider, useAuth } from '@/components/admin/AuthProvider';
import './App.css';

export type Route = 'home' | 'about' | 'projects' | 'blog' | 'blog-post' | 'contact' | 'admin-dashboard';

interface AppState {
  currentRoute: Route;
  blogPostSlug?: string;
  isBackendRoute: boolean;
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [appState, setAppState] = useState<AppState>({
    currentRoute: 'home',
    isBackendRoute: false
  });

  // Handle URL path changes and browser navigation
  useEffect(() => {
    const handlePathChange = () => {
      const path = window.location.pathname;
      if (path === '/backend') {
        setAppState(prev => ({ ...prev, isBackendRoute: true }));
        if (isAuthenticated) {
          // If user is authenticated and on /backend, redirect to admin dashboard
          setAppState(prev => ({ ...prev, currentRoute: 'admin-dashboard' }));
        }
      } else {
        setAppState(prev => ({ ...prev, isBackendRoute: false }));
        // Handle other routes based on URL
        if (path === '/about') {
          setAppState(prev => ({ ...prev, currentRoute: 'about' }));
        } else if (path === '/projects') {
          setAppState(prev => ({ ...prev, currentRoute: 'projects' }));
        } else if (path === '/blog') {
          setAppState(prev => ({ ...prev, currentRoute: 'blog' }));
        } else if (path === '/contact') {
          setAppState(prev => ({ ...prev, currentRoute: 'contact' }));
        } else if (path === '/' || path === '/home') {
          setAppState(prev => ({ ...prev, currentRoute: 'home' }));
        }
      }
    };

    // Initial path check
    handlePathChange();

    // Listen for browser navigation (back/forward buttons)
    const handlePopState = () => {
      handlePathChange();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated]);

  const navigateTo = (route: Route, blogPostSlug?: string) => {
    setAppState({ currentRoute: route, blogPostSlug, isBackendRoute: false });
    // Update URL based on route
    const routeMap: { [key in Route]: string } = {
      'home': '/',
      'about': '/about',
      'projects': '/projects',
      'blog': '/blog',
      'blog-post': '/blog',
      'contact': '/contact',
      'admin-dashboard': '/backend'
    };
    window.history.pushState(null, '', routeMap[route]);
  };

  const renderCurrentPage = () => {
    // Handle backend route logic
    if (appState.isBackendRoute) {
      if (!isAuthenticated) {
        return <AdminLogin onLoginSuccess={() => navigateTo('admin-dashboard')} onNavigateHome={() => navigateTo('home')} />;
      } else {
        return <AdminDashboard onLogout={() => {
          // Stay on backend route but force re-render to show login form
          setAppState(prev => ({ ...prev, isBackendRoute: true }));
        }} onNavigateHome={() => navigateTo('home')} />;
      }
    }

    // Handle regular routes
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
      case 'admin-dashboard':
        return <AdminDashboard onLogout={() => {
          // Navigate to backend route to show login form after logout
          window.history.pushState(null, '', '/backend');
          setAppState(prev => ({ ...prev, isBackendRoute: true }));
        }} onNavigateHome={() => navigateTo('home')} />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Only show navbar for non-admin routes and non-backend routes */}
      {!appState.isBackendRoute && appState.currentRoute !== 'admin-dashboard' && (
        <Navbar currentRoute={appState.currentRoute} onNavigate={navigateTo} />
      )}
      {renderCurrentPage()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;