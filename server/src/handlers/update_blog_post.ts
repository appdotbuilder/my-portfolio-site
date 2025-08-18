import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type UpdateBlogPostInput, type BlogPost } from '../schema';
import { eq, and, ne } from 'drizzle-orm';

export const updateBlogPost = async (input: UpdateBlogPostInput): Promise<BlogPost> => {
  try {
    // First check if the blog post exists
    const existingPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, input.id))
      .execute();

    if (existingPost.length === 0) {
      throw new Error(`Blog post with id ${input.id} not found`);
    }

    // If slug is being updated, check for uniqueness
    if (input.slug) {
      const conflictingPost = await db.select()
        .from(blogPostsTable)
        .where(
          and(
            eq(blogPostsTable.slug, input.slug),
            ne(blogPostsTable.id, input.id)
          )
        )
        .execute();

      if (conflictingPost.length > 0) {
        throw new Error(`Blog post with slug '${input.slug}' already exists`);
      }
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }

    if (input.slug !== undefined) {
      updateData.slug = input.slug;
    }

    if (input.excerpt !== undefined) {
      updateData.excerpt = input.excerpt;
    }

    if (input.content !== undefined) {
      updateData.content = input.content;
    }

    if (input.image_url !== undefined) {
      updateData.image_url = input.image_url;
    }

    if (input.is_published !== undefined) {
      updateData.is_published = input.is_published;
    }

    if (input.published_at !== undefined) {
      updateData.published_at = input.published_at;
    }

    // Update the blog post
    const result = await db.update(blogPostsTable)
      .set(updateData)
      .where(eq(blogPostsTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Blog post update failed:', error);
    throw error;
  }
};