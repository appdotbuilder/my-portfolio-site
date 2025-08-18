import { useState, useEffect } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import type { PageContent, UpdatePageContentInput } from '../../../../server/src/schema';

interface PageContentManagerProps {
  pageType: 'home' | 'about';
}

export function PageContentManager({ pageType }: PageContentManagerProps) {
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [formData, setFormData] = useState<UpdatePageContentInput>({
    page_type: pageType,
    hero_title: '',
    hero_text: '',
    hero_image_url: null,
    content_sections: '{"sections":[]}'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPageContent();
  }, [pageType]);

  const loadPageContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const content = await trpc.getPageContent.query(pageType);
      setPageContent(content);
      
      // Populate form with existing data
      if (content) {
        setFormData({
          page_type: pageType,
          hero_title: content.hero_title,
          hero_text: content.hero_text,
          hero_image_url: content.hero_image_url,
          content_sections: content.content_sections
        });
      }
    } catch (err) {
      console.error(`Failed to load ${pageType} page content:`, err);
      setError('Failed to load page content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: UpdatePageContentInput) => ({ 
      ...prev, 
      [name]: value || null 
    }));
    
    // Clear save status when user makes changes
    if (saveStatus !== 'idle') setSaveStatus('idle');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      await trpc.updatePageContent.mutate(formData);
      setSaveStatus('success');
      
      // Reload content to get updated data
      await loadPageContent();
    } catch (err) {
      console.error('Failed to save page content:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const formatContentSections = () => {
    try {
      const parsed = JSON.parse(formData.content_sections);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return formData.content_sections;
    }
  };

  const handleContentSectionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev: UpdatePageContentInput) => ({
      ...prev,
      content_sections: e.target.value
    }));
    
    if (saveStatus !== 'idle') setSaveStatus('idle');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-36 mb-2" />
            <Skeleton className="h-48 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{pageType === 'home' ? '🏠' : '👥'}</span>
          {pageType === 'home' ? 'Home' : 'About'} Page Content
        </CardTitle>
        <CardDescription>
          Manage the hero section and content for the {pageType} page
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {saveStatus === 'success' && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              ✅ Page content saved successfully!
            </AlertDescription>
          </Alert>
        )}

        {saveStatus === 'error' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              ❌ Failed to save page content. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Hero Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Hero Section ✨
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="hero_title" className="block text-sm font-medium text-gray-700 mb-2">
                Hero Title *
              </label>
              <Input
                id="hero_title"
                name="hero_title"
                value={formData.hero_title}
                onChange={handleInputChange}
                placeholder={`Enter ${pageType} page title`}
                required
                disabled={isSaving}
              />
            </div>
            
            <div>
              <label htmlFor="hero_image_url" className="block text-sm font-medium text-gray-700 mb-2">
                Hero Image URL
              </label>
              <Input
                id="hero_image_url"
                name="hero_image_url"
                type="url"
                value={formData.hero_image_url || ''}
                onChange={handleInputChange}
                placeholder="https://example.com/hero-image.jpg"
                disabled={isSaving}
              />
            </div>
          </div>

          <div>
            <label htmlFor="hero_text" className="block text-sm font-medium text-gray-700 mb-2">
              Hero Text *
            </label>
            <Textarea
              id="hero_text"
              name="hero_text"
              value={formData.hero_text}
              onChange={handleInputChange}
              placeholder={`Enter compelling text for the ${pageType} page hero section`}
              rows={4}
              required
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Content Sections 📝
          </h3>
          
          <div>
            <label htmlFor="content_sections" className="block text-sm font-medium text-gray-700 mb-2">
              Content Sections (JSON Format)
            </label>
            <Textarea
              id="content_sections"
              name="content_sections"
              value={formatContentSections()}
              onChange={handleContentSectionsChange}
              placeholder={`{
  "sections": [
    {
      "title": "Section Title",
      "content": "<p>Section content with HTML</p>",
      "image": "https://example.com/image.jpg"
    }
  ]
}`}
              rows={12}
              required
              disabled={isSaving}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Tip: Use JSON format to define sections with title, content (HTML allowed), and optional image URL
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={loadPageContent}
            disabled={isSaving}
          >
            🔄 Reset to Saved
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
              '💾 Save Changes'
            )}
          </Button>
        </div>

        {/* Preview Section */}
        {pageContent && (
          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Current Content Preview 👀
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wider mb-2">
                  Hero Section
                </h4>
                <p className="text-sm text-gray-600">
                  <strong>Title:</strong> {pageContent.hero_title}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Text:</strong> {pageContent.hero_text.substring(0, 100)}...
                </p>
                {pageContent.hero_image_url && (
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Image:</strong> {pageContent.hero_image_url}
                  </p>
                )}
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wider mb-2">
                  Last Updated
                </h4>
                <p className="text-sm text-gray-600">
                  {pageContent.updated_at.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}