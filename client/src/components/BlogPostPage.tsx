import { useState, useEffect } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import type { BlogPost } from '../../../server/src/schema';

interface BlogPostPageProps {
  slug?: string;
  onNavigateBack: () => void;
}

export function BlogPostPage({ slug, onNavigateBack }: BlogPostPageProps) {
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBlogPost = async () => {
      if (!slug) {
        setError('Blog post not found');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const post = await trpc.getBlogPostBySlug.query({ slug });
        setBlogPost(post);
      } catch (err) {
        console.error('Failed to load blog post:', err);
        setError('Failed to load blog post');
      } finally {
        setIsLoading(false);
      }
    };

    loadBlogPost();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Back Button Skeleton */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Skeleton className="h-10 w-32 mb-8" />
        </div>

        {/* Hero Section Skeleton */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12">
            <Skeleton className="h-12 w-3/4 mb-4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mb-6 mx-auto" />
            <Skeleton className="h-4 w-1/3 mx-auto" />
          </header>

          <Skeleton className="aspect-video w-full mb-12 rounded-lg" />

          <div className="prose prose-lg max-w-none">
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-5/6 mb-4" />
            <Skeleton className="h-6 w-4/5 mb-8" />
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-4" />
          </div>
        </article>
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Alert className="max-w-md mb-6">
            <AlertDescription>{error || 'Blog post not found'}</AlertDescription>
          </Alert>
          <Button onClick={onNavigateBack} variant="outline">
            ← Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  // Check if post is published (for public viewing)
  if (!blogPost.is_published) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">📝</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Available</h1>
          <p className="text-gray-600 mb-6">
            This blog post is not currently published or doesn't exist.
          </p>
          <Button onClick={onNavigateBack} variant="outline">
            ← Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Button variant="outline" className="mb-8" onClick={onNavigateBack}>
          ← Back to Blog
        </Button>
      </div>

      {/* Blog Post Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Badge variant="default" className="text-xs">
              Published
            </Badge>
            {blogPost.published_at && (
              <span className="text-sm text-gray-500">
                {blogPost.published_at.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {blogPost.title}
          </h1>
          
          {blogPost.excerpt && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              {blogPost.excerpt}
            </p>
          )}

          <div className="text-sm text-gray-500">
            <span>Published on {blogPost.created_at.toLocaleDateString()}</span>
            {blogPost.updated_at > blogPost.created_at && (
              <span className="ml-4">• Updated on {blogPost.updated_at.toLocaleDateString()}</span>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {blogPost.image_url && (
          <div className="mb-12">
            <img
              src={blogPost.image_url}
              alt={blogPost.title}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <div 
            className="prose prose-lg prose-gray max-w-none
              prose-headings:text-gray-900 prose-headings:font-bold
              prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8
              prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-6
              prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-4
              prose-p:mb-4 prose-p:leading-relaxed prose-p:text-gray-700
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-ul:mb-4 prose-ol:mb-4
              prose-li:mb-1 prose-li:text-gray-700
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 
              prose-blockquote:pl-6 prose-blockquote:my-6 prose-blockquote:italic
              prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg
              prose-img:rounded-lg prose-img:shadow-md"
            dangerouslySetInnerHTML={{ __html: blogPost.content }}
          />
        </div>

        {/* Article Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Share this article</h3>
              <div className="flex space-x-3">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                  Twitter 🐦
                </button>
                <button className="bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-900 transition-colors text-sm">
                  LinkedIn 💼
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm">
                  Copy Link 🔗
                </button>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-600 mb-4">Found this helpful?</p>
              <div className="flex gap-2 justify-center md:justify-end">
                <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors text-sm">
                  👍 Like
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors text-sm">
                  💬 Comment
                </button>
              </div>
            </div>
          </div>
        </footer>
      </article>

      {/* Related Posts or CTA Section */}
      <section className="bg-white py-16 border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Want to Read More? 📚
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover more insights and tutorials in our blog. Stay updated with the latest trends and best practices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={onNavigateBack}>
              View All Posts ✨
            </Button>
            <Button variant="outline" size="lg">
              Subscribe to Newsletter 📬
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}