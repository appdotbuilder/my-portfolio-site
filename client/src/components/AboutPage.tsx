import { useState, useEffect } from 'react';
import { trpc } from '@/utils/trpc';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { PageContent } from '../../../server/src/schema';

export function AboutPage() {
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPageContent = async () => {
      try {
        setIsLoading(true);
        const content = await trpc.getPageContent.query('about');
        setPageContent(content);
      } catch (err) {
        console.error('Failed to load about page content:', err);
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
        <section className="relative bg-gradient-to-br from-purple-50 to-pink-100 py-20">
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
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <Skeleton className="aspect-video w-full" />
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Us</h1>
          <p className="text-xl text-gray-600">Content is being set up. Please check back soon!</p>
        </div>
      </div>
    );
  }

  const contentSections = parseContentSections(pageContent.content_sections);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 to-pink-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {pageContent.hero_title}
              </h1>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                {pageContent.hero_text}
              </p>
            </div>
            <div>
              {pageContent.hero_image_url ? (
                <img
                  src={pageContent.hero_image_url}
                  alt={pageContent.hero_title}
                  className="w-full h-auto rounded-lg shadow-xl"
                />
              ) : (
                <div className="w-full aspect-video bg-gradient-to-r from-green-400 to-blue-400 rounded-lg shadow-xl flex items-center justify-center">
                  <span className="text-white text-6xl">👥</span>
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
            <div className="space-y-16">
              {contentSections.sections.map((section: any, index: number) => (
                <div 
                  key={index} 
                  className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${
                    index % 2 === 1 ? 'md:grid-flow-col-dense' : ''
                  }`}
                >
                  <div className={index % 2 === 1 ? 'md:col-start-2' : ''}>
                    {section.title && (
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        {section.title}
                      </h2>
                    )}
                    {section.content && (
                      <div 
                        className="text-lg text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    )}
                  </div>
                  <div className={index % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}>
                    {section.image ? (
                      <img
                        src={section.image}
                        alt={section.title || 'About us'}
                        className="w-full h-auto rounded-lg shadow-lg"
                      />
                    ) : (
                      <div className="w-full aspect-video bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-4xl">📸</span>
                      </div>
                    )}
                  </div>
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
            <div className="space-y-16">
              {/* Our Story Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story 📖</h2>
                  <p className="text-lg text-gray-700 leading-relaxed mb-4">
                    We started with a simple mission: to create amazing digital experiences that make a difference. 
                    Our journey began with a small team of passionate developers and designers who believed in the 
                    power of technology to transform businesses.
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Today, we continue to push boundaries and deliver innovative solutions that exceed expectations.
                  </p>
                </div>
                <div className="bg-gradient-to-r from-blue-400 to-purple-400 aspect-video rounded-lg flex items-center justify-center">
                  <span className="text-white text-6xl">🌟</span>
                </div>
              </div>

              {/* Our Mission Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="bg-gradient-to-r from-green-400 to-teal-400 aspect-video rounded-lg flex items-center justify-center order-2 md:order-1">
                  <span className="text-white text-6xl">🎯</span>
                </div>
                <div className="order-1 md:order-2">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission 🎯</h2>
                  <p className="text-lg text-gray-700 leading-relaxed mb-4">
                    We believe in empowering businesses through cutting-edge technology and exceptional design. 
                    Our mission is to help our clients achieve their goals by providing reliable, scalable, 
                    and user-friendly solutions.
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    We're committed to excellence in everything we do, from the initial consultation to ongoing support.
                  </p>
                </div>
              </div>

              {/* Our Values Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Values 💎</h2>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">✨</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">Innovation</h3>
                        <p className="text-gray-700">Always pushing the boundaries of what's possible.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">🤝</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">Collaboration</h3>
                        <p className="text-gray-700">Working together to achieve extraordinary results.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">🔧</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">Quality</h3>
                        <p className="text-gray-700">Delivering excellence in every project we undertake.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-400 to-pink-400 aspect-video rounded-lg flex items-center justify-center">
                  <span className="text-white text-6xl">💎</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}