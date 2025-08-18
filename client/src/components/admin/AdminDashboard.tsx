import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from './AuthProvider';
import { PageContentManager } from './PageContentManager';
import { ProjectManager } from './ProjectManager';
import { BlogManager } from './BlogManager';

interface AdminDashboardProps {
  onLogout: () => void;
  onNavigateHome: () => void;
}

export function AdminDashboard({ onLogout, onNavigateHome }: AdminDashboardProps) {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚡</span>
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={onNavigateHome}
                size="sm"
              >
                View Website 🌐
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                size="sm"
              >
                Logout 🚪
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Admin Dashboard 🎛️
          </h2>
          <p className="text-gray-600">
            Manage your website content, projects, and blog posts from here.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-900">2</span>
                <span className="text-2xl ml-2">📄</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Home & About</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-900">-</span>
                <span className="text-2xl ml-2">🚀</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Active projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Blog Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-900">-</span>
                <span className="text-2xl ml-2">📝</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Published posts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Last Update</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span className="text-sm font-bold text-gray-900">Today</span>
                <span className="text-2xl ml-2">⏰</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Content updated</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <span>🏠</span> Home Page
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <span>👥</span> About Page
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <span>🚀</span> Projects
            </TabsTrigger>
            <TabsTrigger value="blog" className="flex items-center gap-2">
              <span>📝</span> Blog Posts
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <span>⚙️</span> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home">
            <PageContentManager pageType="home" />
          </TabsContent>

          <TabsContent value="about">
            <PageContentManager pageType="about" />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectManager />
          </TabsContent>

          <TabsContent value="blog">
            <BlogManager />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>⚙️</span> Settings
                </CardTitle>
                <CardDescription>
                  Configure your website settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔧</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Settings Panel</h3>
                  <p className="text-gray-600 mb-6">
                    Advanced settings and configuration options coming soon.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Site Title</span>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Site Description</span>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Contact Information</span>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}