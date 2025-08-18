import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { eq } from 'drizzle-orm';

export async function deleteBlogPost(input: DeleteInput): Promise<{ success: boolean; message: string }> {
  try {
    // Check if blog post exists first
    const existingPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, input.id))
      .execute();

    if (existingPost.length === 0) {
      return {
        success: false,
        message: 'Blog post not found'
      };
    }

    // Delete the blog post
    await db.delete(blogPostsTable)
      .where(eq(blogPostsTable.id, input.id))
      .execute();

    return {
      success: true,
      message: 'Blog post deleted successfully'
    };
  } catch (error) {
    console.error('Blog post deletion failed:', error);
    throw error;
  }
}