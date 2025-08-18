import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type CreateBlogPostInput, type BlogPost } from '../schema';

export async function createBlogPost(input: CreateBlogPostInput): Promise<BlogPost> {
  try {
    // Insert blog post record
    const result = await db.insert(blogPostsTable)
      .values({
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt,
        content: input.content,
        image_url: input.image_url,
        is_published: input.is_published,
        published_at: input.published_at
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Blog post creation failed:', error);
    throw error;
  }
}