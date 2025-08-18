import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type DeleteInput, type CreateBlogPostInput } from '../schema';
import { deleteBlogPost } from '../handlers/delete_blog_post';
import { eq } from 'drizzle-orm';

// Test input for creating a blog post
const testBlogPostInput: CreateBlogPostInput = {
  title: 'Test Blog Post',
  slug: 'test-blog-post',
  excerpt: 'This is a test excerpt',
  content: 'This is test content for the blog post',
  image_url: 'https://example.com/test-image.jpg',
  is_published: true,
  published_at: new Date()
};

describe('deleteBlogPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing blog post', async () => {
    // Create a blog post first
    const createdPost = await db.insert(blogPostsTable)
      .values({
        title: testBlogPostInput.title,
        slug: testBlogPostInput.slug,
        excerpt: testBlogPostInput.excerpt,
        content: testBlogPostInput.content,
        image_url: testBlogPostInput.image_url,
        is_published: testBlogPostInput.is_published,
        published_at: testBlogPostInput.published_at
      })
      .returning()
      .execute();

    const blogPostId = createdPost[0].id;
    const deleteInput: DeleteInput = { id: blogPostId };

    // Delete the blog post
    const result = await deleteBlogPost(deleteInput);

    // Verify the response
    expect(result.success).toBe(true);
    expect(result.message).toBe('Blog post deleted successfully');

    // Verify the blog post is actually deleted from the database
    const deletedPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, blogPostId))
      .execute();

    expect(deletedPost).toHaveLength(0);
  });

  it('should return failure when blog post does not exist', async () => {
    const deleteInput: DeleteInput = { id: 999 }; // Non-existent ID

    const result = await deleteBlogPost(deleteInput);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Blog post not found');
  });

  it('should handle multiple blog posts correctly', async () => {
    // Create two blog posts
    const post1 = await db.insert(blogPostsTable)
      .values({
        title: 'First Post',
        slug: 'first-post',
        excerpt: 'First excerpt',
        content: 'First content',
        image_url: null,
        is_published: false,
        published_at: null
      })
      .returning()
      .execute();

    const post2 = await db.insert(blogPostsTable)
      .values({
        title: 'Second Post',
        slug: 'second-post',
        excerpt: 'Second excerpt',
        content: 'Second content',
        image_url: null,
        is_published: true,
        published_at: new Date()
      })
      .returning()
      .execute();

    // Delete only the first post
    const deleteInput: DeleteInput = { id: post1[0].id };
    const result = await deleteBlogPost(deleteInput);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Blog post deleted successfully');

    // Verify only the first post is deleted
    const remainingPosts = await db.select()
      .from(blogPostsTable)
      .execute();

    expect(remainingPosts).toHaveLength(1);
    expect(remainingPosts[0].id).toBe(post2[0].id);
    expect(remainingPosts[0].title).toBe('Second Post');
  });

  it('should delete published blog posts', async () => {
    // Create a published blog post
    const publishedPost = await db.insert(blogPostsTable)
      .values({
        title: 'Published Post',
        slug: 'published-post',
        excerpt: 'Published excerpt',
        content: 'Published content',
        image_url: 'https://example.com/published-image.jpg',
        is_published: true,
        published_at: new Date()
      })
      .returning()
      .execute();

    const deleteInput: DeleteInput = { id: publishedPost[0].id };

    const result = await deleteBlogPost(deleteInput);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Blog post deleted successfully');

    // Verify the published post is deleted
    const deletedPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, publishedPost[0].id))
      .execute();

    expect(deletedPost).toHaveLength(0);
  });

  it('should delete draft blog posts', async () => {
    // Create a draft blog post
    const draftPost = await db.insert(blogPostsTable)
      .values({
        title: 'Draft Post',
        slug: 'draft-post',
        excerpt: null,
        content: 'Draft content',
        image_url: null,
        is_published: false,
        published_at: null
      })
      .returning()
      .execute();

    const deleteInput: DeleteInput = { id: draftPost[0].id };

    const result = await deleteBlogPost(deleteInput);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Blog post deleted successfully');

    // Verify the draft post is deleted
    const deletedPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, draftPost[0].id))
      .execute();

    expect(deletedPost).toHaveLength(0);
  });
});