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