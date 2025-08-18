import { useState, useEffect } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import type { BlogPost, PaginatedResponse } from '../../../server/src/schema';

interface BlogPageProps {
  onNavigateToPost: (slug: string) => void;
}

export function BlogPage({ onNavigateToPost }: BlogPageProps) {
  const [blogData, setBlogData] = useState<PaginatedResponse<BlogPost> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadBlogPosts = async (page: number) => {
    try {
      setIsLoading(true);
      const data = await trpc.getBlogPosts.query({ page, limit: 6 });
      setBlogData(data);
    } catch (err) {
      console.error('Failed to load blog posts:', err);
      setError('Failed to load blog posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBlogPosts(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading && !blogData) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <section className="bg-gradient-to-br from-green-50 to-teal-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Skeleton className="h-12 w-1/2 mb-4 mx-auto" />
            <Skeleton className="h-6 w-2/3 mx-auto" />
          </div>
        </section>

        {/* Blog Posts Skeleton */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <Skeleton className="h-4 w-1/2" />
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-green-50 to-teal-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Blog ✍️
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Stay updated with the latest insights, tutorials, and news from our team. 
            Discover valuable content that helps you grow and succeed.
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!blogData || blogData.data.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-8xl mb-6">📝</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Blog Posts Yet</h2>
              <p className="text-gray-600">
                We're working on exciting new content. Check back soon for our latest articles!
              </p>
            </div>
          ) : (
            <>
              {/* Loading overlay for pagination */}
              {isLoading && (
                <div className="absolute inset-0 bg-gray-50 bg-opacity-75 z-10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading...</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {blogData.data.map((post: BlogPost) => (
                  <button
                    key={post.id}
                    onClick={() => onNavigateToPost(post.slug)}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 group block text-left w-full"
                  >
                    {/* Post Image */}
                    <div className="aspect-video relative overflow-hidden">
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                          <span className="text-white text-4xl">📄</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                    </div>

                    {/* Post Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        {post.is_published ? (
                          <Badge variant="default" className="text-xs">
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Draft
                          </Badge>
                        )}
                        {post.published_at && (
                          <span className="text-sm text-gray-500">
                            {post.published_at.toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-3 line-clamp-2">
                        {post.title}
                      </h3>
                      
                      {post.excerpt && (
                        <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-sm text-gray-500">
                          {post.created_at.toLocaleDateString()}
                        </span>
                        <span className="text-blue-600 hover:text-blue-700 font-medium text-sm group-hover:underline transition-all">
                          Read More →
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Pagination */}
              {blogData.pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!blogData.pagination.hasPrev || isLoading}
                  >
                    Previous
                  </Button>
                  
                  {/* Page numbers */}
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
                  >
                    Next
                  </Button>
                </div>
              )}

              {/* Pagination Info */}
              <div className="text-center text-gray-600 mt-4">
                Showing {((blogData.pagination.page - 1) * blogData.pagination.limit) + 1} to{' '}
                {Math.min(blogData.pagination.page * blogData.pagination.limit, blogData.pagination.total)} of{' '}
                {blogData.pagination.total} posts
              </div>
            </>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-white py-16 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Stay Updated 📬
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter to get the latest articles and insights delivered straight to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button className="px-8 py-3">
              Subscribe ✨
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}