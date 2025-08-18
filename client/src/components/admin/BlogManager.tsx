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
import type { BlogPost, CreateBlogPostInput, UpdateBlogPostInput, PaginatedResponse } from '../../../../server/src/schema';

export function BlogManager() {
  const [blogData, setBlogData] = useState<PaginatedResponse<BlogPost> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState<CreateBlogPostInput>({
    title: '',
    slug: '',
    excerpt: null,
    content: '',
    image_url: null,
    is_published: false,
    published_at: null
  });

  const loadBlogPosts = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await trpc.getAllBlogPosts.query({ page, limit: 10 });
      setBlogData(data);
    } catch (err) {
      console.error('Failed to load blog posts:', err);
      setError('Failed to load blog posts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlogPosts(currentPage);
  }, [currentPage, loadBlogPosts]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev: CreateBlogPostInput) => {
      const updatedData = { 
        ...prev, 
        [name]: value || null
      };

      // Auto-generate slug when title changes
      if (name === 'title' && !editingPost) {
        updatedData.slug = generateSlug(value);
      }

      return updatedData;
    });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev: CreateBlogPostInput) => ({ 
      ...prev, 
      [name]: checked,
      // Set published_at when publishing
      ...(name === 'is_published' && checked && !prev.published_at && {
        published_at: new Date()
      })
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: null,
      content: '',
      image_url: null,
      is_published: false,
      published_at: null
    });
    setEditingPost(null);
    setSaveStatus('idle');
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      image_url: post.image_url,
      is_published: post.is_published,
      published_at: post.published_at
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      if (editingPost) {
        // Update existing post
        const updateData: UpdateBlogPostInput = {
          id: editingPost.id,
          ...formData
        };
        await trpc.updateBlogPost.mutate(updateData);
      } else {
        // Create new post
        await trpc.createBlogPost.mutate(formData);
      }

      setSaveStatus('success');
      await loadBlogPosts(currentPage);
      
      setTimeout(() => {
        setIsDialogOpen(false);
        resetForm();
      }, 1000);
    } catch (err) {
      console.error('Failed to save blog post:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) {
      return;
    }

    try {
      await trpc.deleteBlogPost.mutate({ id: post.id });
      await loadBlogPosts(currentPage);
    } catch (err) {
      console.error('Failed to delete blog post:', err);
      alert('Failed to delete blog post');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading && !blogData) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4" />
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
              <span>📝</span> Blog Management
            </CardTitle>
            <CardDescription>
              Create and manage blog posts - write, edit, publish, and organize your content
            </CardDescription>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                ➕ New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPost ? '✏️ Edit Blog Post' : '📝 Create New Blog Post'}
                </DialogTitle>
                <DialogDescription>
                  {editingPost 
                    ? 'Update the blog post details below' 
                    : 'Fill in the details to create a new blog post'
                  }
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {saveStatus === 'success' && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">
                      ✅ Blog post saved successfully!
                    </AlertDescription>
                  </Alert>
                )}

                {saveStatus === 'error' && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">
                      ❌ Failed to save blog post. Please try again.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter blog post title"
                      required
                      disabled={isSaving}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                      URL Slug *
                    </label>
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="url-friendly-slug"
                      required
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                    Excerpt
                  </label>
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt || ''}
                    onChange={handleInputChange}
                    placeholder="Brief description of the post (optional)"
                    rows={2}
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image URL
                  </label>
                  <Input
                    id="image_url"
                    name="image_url"
                    type="url"
                    value={formData.image_url || ''}
                    onChange={handleInputChange}
                    placeholder="https://example.com/featured-image.jpg"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Write your blog post content here. HTML is supported for rich formatting."
                    rows={12}
                    required
                    disabled={isSaving}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Tip: You can use HTML tags for formatting (p, h1-h6, strong, em, ul, ol, li, a, img, etc.)
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => handleSwitchChange('is_published', checked)}
                    disabled={isSaving}
                  />
                  <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                    Publish immediately (make visible to public)
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
                    className="min-w-[120px]"
                  >
                    {isSaving ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                        Saving...
                      </>
                    ) : (
                      editingPost ? '💾 Update Post' : '📝 Create Post'
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

        {!blogData || blogData.data.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Blog Posts Yet</h3>
            <p className="text-gray-600 mb-6">
              Start creating engaging content for your readers.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {blogData.data.map((post: BlogPost) => (
                <div
                  key={post.id}
                  className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg flex-1 mr-4 truncate">
                      {post.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {post.is_published ? (
                        <Badge variant="default" className="text-xs">Published</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Draft</Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Slug:</strong> /blog/{post.slug}
                  </div>
                  
                  {post.excerpt && (
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div>
                      Created: {post.created_at.toLocaleDateString()} • 
                      Updated: {post.updated_at.toLocaleDateString()}
                      {post.published_at && (
                        <> • Published: {post.published_at.toLocaleDateString()}</>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(post)}
                      className="flex-1"
                    >
                      ✏️ Edit
                    </Button>
                    {post.is_published && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                      >
                        👁️ View
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(post)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {blogData.pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!blogData.pagination.hasPrev || isLoading}
                  size="sm"
                >
                  Previous
                </Button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: blogData.pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={isLoading}
                      className="min-w-[40px]"
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!blogData.pagination.hasNext || isLoading}
                  size="sm"
                >
                  Next
                </Button>
              </div>
            )}

            <div className="text-center text-gray-600 mt-4 text-sm">
              Showing {((blogData.pagination.page - 1) * blogData.pagination.limit) + 1} to{' '}
              {Math.min(blogData.pagination.page * blogData.pagination.limit, blogData.pagination.total)} of{' '}
              {blogData.pagination.total} posts
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}