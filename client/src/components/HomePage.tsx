import { useState, useEffect } from 'react';
import { trpc } from '@/utils/trpc';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { PageContent } from '../../../server/src/schema';

export function HomePage() {
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPageContent = async () => {
      try {
        setIsLoading(true);
        const content = await trpc.getPageContent.query('home');
        setPageContent(content);
      } catch (err) {
        console.error('Failed to load home page content:', err);
        setError('Failed to load page content');
      } finally {
        setIsLoading(false);
      }
    };

    loadPageContent();
  }, []);

  const parseContentSections = (contentSections: string) => {
    try {
      return JSON.parse(contentSections);
    } catch {
      return { sections: [] };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        {/* Hero Section Skeleton */}
        <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Skeleton className="h-12 w-3/4 mb-6" />
                <Skeleton className="h-6 w-full mb-4" />
                <Skeleton className="h-6 w-2/3" />
              </div>
              <div>
                <Skeleton className="aspect-video w-full rounded-lg" />
              </div>
            </div>
          </div>
        </section>

        {/* Content Sections Skeleton */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-8 w-1/2 mb-8 mx-auto" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!pageContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Our Website</h1>
          <p className="text-xl text-gray-600">Content is being set up. Please check back soon!</p>
        </div>
      </div>
    );
  }

  const contentSections = parseContentSections(pageContent.content_sections);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {pageContent.hero_title}
              </h1>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                {pageContent.hero_text}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Get Started ✨
                </button>
                <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Learn More
                </button>
              </div>
            </div>
            <div>
              {pageContent.hero_image_url ? (
                <img
                  src={pageContent.hero_image_url}
                  alt={pageContent.hero_title}
                  className="w-full h-auto rounded-lg shadow-xl"
                />
              ) : (
                <div className="w-full aspect-video bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg shadow-xl flex items-center justify-center">
                  <span className="text-white text-6xl">🚀</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      {contentSections.sections && contentSections.sections.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {contentSections.sections.map((section: any, index: number) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow">
                  {section.title && (
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {section.title}
                    </h3>
                  )}
                  {section.content && (
                    <div 
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  )}
                  {section.image && (
                    <img
                      src={section.image}
                      alt={section.title || 'Content image'}
                      className="w-full h-48 object-cover rounded-md mt-4"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Default content sections if none exist */}
      {(!contentSections.sections || contentSections.sections.length === 0) && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Choose Us? 🌟
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast & Reliable</h3>
                <p className="text-gray-600">Lightning-fast performance with 99.9% uptime guarantee.</p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure</h3>
                <p className="text-gray-600">Enterprise-grade security to protect your data.</p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Beautiful Design</h3>
                <p className="text-gray-600">Modern, clean design that your users will love.</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}