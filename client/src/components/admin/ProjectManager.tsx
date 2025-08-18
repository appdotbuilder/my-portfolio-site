import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Project, CreateProjectInput, UpdateProjectInput } from '../../../../server/src/schema';

export function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [formData, setFormData] = useState<CreateProjectInput>({
    title: '',
    description: null,
    image_url: null,
    order_index: 0,
    is_active: true
  });

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const projectsData = await trpc.getAllProjects.query();
      setProjects(projectsData);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' ? parseInt(value) || 0 : (value || null);
    
    setFormData((prev: CreateProjectInput) => ({ 
      ...prev, 
      [name]: processedValue
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev: CreateProjectInput) => ({ 
      ...prev, 
      [name]: checked
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: null,
      image_url: null,
      order_index: projects.length,
      is_active: true
    });
    setEditingProject(null);
    setSaveStatus('idle');
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      image_url: project.image_url,
      order_index: project.order_index,
      is_active: project.is_active
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      if (editingProject) {
        // Update existing project
        const updateData: UpdateProjectInput = {
          id: editingProject.id,
          ...formData
        };
        const updatedProject = await trpc.updateProject.mutate(updateData);
        setProjects((prev: Project[]) =>
          prev.map((p: Project) => (p.id === editingProject.id ? updatedProject : p))
        );
      } else {
        // Create new project
        const newProject = await trpc.createProject.mutate(formData);
        setProjects((prev: Project[]) => [...prev, newProject]);
      }

      setSaveStatus('success');
      setTimeout(() => {
        setIsDialogOpen(false);
        resetForm();
      }, 1000);
    } catch (err) {
      console.error('Failed to save project:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`Are you sure you want to delete "${project.title}"?`)) {
      return;
    }

    try {
      await trpc.deleteProject.mutate({ id: project.id });
      setProjects((prev: Project[]) => prev.filter((p: Project) => p.id !== project.id));
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert('Failed to delete project');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="aspect-video w-full mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>🚀</span> Project Management
            </CardTitle>
            <CardDescription>
              Manage your portfolio projects - add, edit, reorder, and toggle visibility
            </CardDescription>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                ➕ Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingProject ? '✏️ Edit Project' : '➕ Add New Project'}
                </DialogTitle>
                <DialogDescription>
                  {editingProject 
                    ? 'Update the project details below' 
                    : 'Fill in the details to create a new project'
                  }
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {saveStatus === 'success' && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">
                      ✅ Project saved successfully!
                    </AlertDescription>
                  </Alert>
                )}

                {saveStatus === 'error' && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">
                      ❌ Failed to save project. Please try again.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title *
                    </label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter project title"
                      required
                      disabled={isSaving}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="order_index" className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <Input
                      id="order_index"
                      name="order_index"
                      type="number"
                      value={formData.order_index}
                      onChange={handleInputChange}
                      min="0"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    placeholder="Enter project description"
                    rows={3}
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <Input
                    id="image_url"
                    name="image_url"
                    type="url"
                    value={formData.image_url || ''}
                    onChange={handleInputChange}
                    placeholder="https://example.com/project-image.jpg"
                    disabled={isSaving}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                    disabled={isSaving}
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Active (visible on website)
                  </label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="min-w-[100px]"
                  >
                    {isSaving ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                        Saving...
                      </>
                    ) : (
                      editingProject ? '💾 Update' : '➕ Create'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h3>
            <p className="text-gray-600 mb-6">
              Start by adding your first project to showcase your work.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects
              .sort((a: Project, b: Project) => a.order_index - b.order_index)
              .map((project: Project) => (
                <div
                  key={project.id}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Project Image */}
                  <div className="aspect-video bg-gray-100">
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <span className="text-4xl text-gray-400">📱</span>
                      </div>
                    )}
                  </div>

                  {/* Project Content */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 truncate flex-1 mr-2">
                        {project.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          #{project.order_index}
                        </Badge>
                        {project.is_active ? (
                          <Badge variant="default" className="text-xs">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Hidden</Badge>
                        )}
                      </div>
                    </div>
                    
                    {project.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    <div className="text-xs text-gray-500 mb-4">
                      Created: {project.created_at.toLocaleDateString()}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(project)}
                        className="flex-1"
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(project)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}