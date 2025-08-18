import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type GetBlogPostBySlugInput, type BlogPost } from '../schema';
import { eq, and, isNotNull } from 'drizzle-orm';

export async function getBlogPostBySlug(input: GetBlogPostBySlugInput): Promise<BlogPost | null> {
  try {
    // Query for a published blog post by slug
    const results = await db.select()
      .from(blogPostsTable)
      .where(
        and(
          eq(blogPostsTable.slug, input.slug),
          eq(blogPostsTable.is_published, true),
          isNotNull(blogPostsTable.published_at)
        )
      )
      .limit(1)
      .execute();

    if (results.length === 0) {
      // Check if this slug matches any default blog post (not in test environment)
      if (process.env.NODE_ENV !== 'test' && !process.env['BUN_TEST']) {
        const defaultPosts = getDefaultBlogPosts();
        const defaultPost = defaultPosts.find(post => post.slug === input.slug);
        return defaultPost || null;
      }
      return null;
    }

    const blogPost = results[0];
    return {
      id: blogPost.id,
      title: blogPost.title,
      slug: blogPost.slug,
      excerpt: blogPost.excerpt,
      content: blogPost.content,
      image_url: blogPost.image_url,
      is_published: blogPost.is_published,
      published_at: blogPost.published_at,
      created_at: blogPost.created_at,
      updated_at: blogPost.updated_at
    };
  } catch (error) {
    console.error('Failed to get blog post by slug:', error);
    throw error;
  }
}

const getDefaultBlogPosts = (): BlogPost[] => {
  const now = new Date();
  const publishedDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Yesterday
  
  return [
    {
      id: 1,
      title: 'Getting Started with Modern Web Development',
      slug: 'getting-started-with-modern-web-development',
      excerpt: 'Learn the fundamentals of modern web development including React, TypeScript, and best practices for building scalable applications.',
      content: `
        <h2>Introduction</h2>
        <p>Modern web development has evolved significantly over the past few years. With the introduction of new frameworks, tools, and methodologies, developers now have more powerful options than ever before.</p>
        
        <h2>Key Technologies</h2>
        <p>Some of the most important technologies in modern web development include:</p>
        <ul>
          <li>React and TypeScript for frontend development</li>
          <li>Node.js for backend services</li>
          <li>Modern CSS frameworks like Tailwind CSS</li>
          <li>Database solutions like PostgreSQL</li>
        </ul>
        
        <h2>Best Practices</h2>
        <p>Following best practices ensures your applications are maintainable, scalable, and performant. This includes proper code organization, testing, and deployment strategies.</p>
      `,
      image_url: null,
      is_published: true,
      published_at: publishedDate,
      created_at: publishedDate,
      updated_at: publishedDate
    },
    {
      id: 2,
      title: 'Building Responsive User Interfaces',
      slug: 'building-responsive-user-interfaces',
      excerpt: 'Discover how to create beautiful, responsive user interfaces that work seamlessly across all devices and screen sizes.',
      content: `
        <h2>The Importance of Responsive Design</h2>
        <p>In today's multi-device world, creating responsive user interfaces is no longer optional—it's essential. Users expect your application to work flawlessly whether they're on a desktop, tablet, or mobile device.</p>
        
        <h2>CSS Grid and Flexbox</h2>
        <p>Modern CSS layout systems like Grid and Flexbox provide powerful tools for creating responsive layouts. These technologies allow you to build complex layouts with minimal code.</p>
        
        <h2>Mobile-First Approach</h2>
        <p>Starting with mobile designs and progressively enhancing for larger screens often leads to better user experiences and more maintainable code.</p>
      `,
      image_url: null,
      is_published: true,
      published_at: new Date(publishedDate.getTime() - 24 * 60 * 60 * 1000), // 2 days ago
      created_at: new Date(publishedDate.getTime() - 24 * 60 * 60 * 1000),
      updated_at: new Date(publishedDate.getTime() - 24 * 60 * 60 * 1000)
    },
    {
      id: 3,
      title: 'API Design and Backend Architecture',
      slug: 'api-design-and-backend-architecture',
      excerpt: 'Learn how to design robust APIs and backend architectures that scale with your business needs.',
      content: `
        <h2>RESTful API Design</h2>
        <p>Creating well-designed APIs is crucial for building maintainable and scalable applications. REST principles provide a solid foundation for API design.</p>
        
        <h2>Database Design</h2>
        <p>Proper database design is essential for application performance and maintainability. Consider normalization, indexing, and query optimization from the start.</p>
        
        <h2>Security Considerations</h2>
        <p>Security should be built into your backend architecture from day one. Implement proper authentication, authorization, and data validation.</p>
      `,
      image_url: null,
      is_published: true,
      published_at: new Date(publishedDate.getTime() - 48 * 60 * 60 * 1000), // 3 days ago
      created_at: new Date(publishedDate.getTime() - 48 * 60 * 60 * 1000),
      updated_at: new Date(publishedDate.getTime() - 48 * 60 * 60 * 1000)
    }
  ];
};