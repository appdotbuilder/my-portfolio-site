import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { Route } from '../App';

interface NavbarProps {
  currentRoute: Route;
  onNavigate: (route: Route) => void;
}

export function Navbar({ currentRoute, onNavigate }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isActive = (path: Route) => {
    if (path === 'home' && currentRoute === 'home') return true;
    if (path === 'blog' && (currentRoute === 'blog' || currentRoute === 'blog-post')) return true;
    if (path === currentRoute) return true;
    return false;
  };

  const navItems = [
    { path: 'home' as Route, label: 'Home' },
    { path: 'about' as Route, label: 'About' },
    { path: 'projects' as Route, label: 'Projects' },
    { path: 'blog' as Route, label: 'Blog' },
    { path: 'contact' as Route, label: 'Contact Us' }
  ];

  const handleNavigation = (route: Route) => {
    onNavigate(route);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button 
            onClick={() => handleNavigation('home')} 
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl font-bold text-gray-900">✨ Portfolio</span>
          </button>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive(item.path) 
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                    : 'text-gray-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Admin Login Button */}
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleNavigation('admin')}
            >
              Admin Login
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2 pt-4">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`text-sm font-medium px-3 py-2 rounded-md transition-colors hover:bg-gray-100 text-left ${
                    isActive(item.path) ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => handleNavigation('admin')}
                className="text-sm font-medium px-3 py-2 rounded-md transition-colors hover:bg-gray-100 text-left text-gray-700 border-t border-gray-200 mt-2 pt-4"
              >
                Admin Login
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}