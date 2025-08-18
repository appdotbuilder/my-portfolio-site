import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type UpdateBlogPostInput, type CreateBlogPostInput } from '../schema';
import { updateBlogPost } from '../handlers/update_blog_post';
import { eq } from 'drizzle-orm';

// Helper function to create a test blog post
const createTestBlogPost = async (overrides: Partial<CreateBlogPostInput> = {}): Promise<number> => {
  const defaultBlogPost: CreateBlogPostInput = {
    title: 'Original Title',
    slug: 'original-slug',
    excerpt: 'Original excerpt',
    content: 'Original content',
    image_url: 'https://example.com/image.jpg',
    is_published: false,
    published_at: null
  };

  const blogPostData = { ...defaultBlogPost, ...overrides };

  const result = await db.insert(blogPostsTable)
    .values(blogPostData)
    .returning()
    .execute();

  return result[0].id;
};

describe('updateBlogPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all fields of a blog post', async () => {
    const blogPostId = await createTestBlogPost();
    const publishedDate = new Date('2024-01-15T10:00:00Z');

    const updateInput: UpdateBlogPostInput = {
      id: blogPostId,
      title: 'Updated Title',
      slug: 'updated-slug',
      excerpt: 'Updated excerpt',
      content: 'Updated content',
      image_url: 'https://example.com/updated-image.jpg',
      is_published: true,
      published_at: publishedDate
    };

    const result = await updateBlogPost(updateInput);

    // Verify returned data
    expect(result.id).toBe(blogPostId);
    expect(result.title).toBe('Updated Title');
    expect(result.slug).toBe('updated-slug');
    expect(result.excerpt).toBe('Updated excerpt');
    expect(result.content).toBe('Updated content');
    expect(result.image_url).toBe('https://example.com/updated-image.jpg');
    expect(result.is_published).toBe(true);
    expect(result.published_at).toEqual(publishedDate);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update only provided fields', async () => {
    const blogPostId = await createTestBlogPost();

    const updateInput: UpdateBlogPostInput = {
      id: blogPostId,
      title: 'New Title',
      is_published: true
    };

    const result = await updateBlogPost(updateInput);

    // Verify updated fields
    expect(result.title).toBe('New Title');
    expect(result.is_published).toBe(true);

    // Verify unchanged fields
    expect(result.slug).toBe('original-slug');
    expect(result.excerpt).toBe('Original excerpt');
    expect(result.content).toBe('Original content');
    expect(result.image_url).toBe('https://example.com/image.jpg');
    expect(result.published_at).toBeNull();
  });

  it('should save changes to database', async () => {
    const blogPostId = await createTestBlogPost();

    const updateInput: UpdateBlogPostInput = {
      id: blogPostId,
      title: 'Database Test Title',
      content: 'Database test content'
    };

    await updateBlogPost(updateInput);

    // Query database directly
    const posts = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, blogPostId))
      .execute();

    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe('Database Test Title');
    expect(posts[0].content).toBe('Database test content');
    expect(posts[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update nullable fields to null', async () => {
    const blogPostId = await createTestBlogPost();

    const updateInput: UpdateBlogPostInput = {
      id: blogPostId,
      excerpt: null,
      image_url: null,
      published_at: null
    };

    const result = await updateBlogPost(updateInput);

    expect(result.excerpt).toBeNull();
    expect(result.image_url).toBeNull();
    expect(result.published_at).toBeNull();
  });

  it('should throw error when blog post does not exist', async () => {
    const updateInput: UpdateBlogPostInput = {
      id: 99999,
      title: 'Nonexistent Post'
    };

    await expect(updateBlogPost(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should throw error when slug conflicts with another post', async () => {
    // Create two blog posts
    const firstPostId = await createTestBlogPost({ slug: 'first-post' });
    const secondPostId = await createTestBlogPost({ slug: 'second-post' });

    // Try to update second post to use first post's slug
    const updateInput: UpdateBlogPostInput = {
      id: secondPostId,
      slug: 'first-post'
    };

    await expect(updateBlogPost(updateInput)).rejects.toThrow(/already exists/i);
  });

  it('should allow updating slug to the same value', async () => {
    const blogPostId = await createTestBlogPost({ slug: 'same-slug' });

    const updateInput: UpdateBlogPostInput = {
      id: blogPostId,
      slug: 'same-slug',
      title: 'Updated Title'
    };

    const result = await updateBlogPost(updateInput);

    expect(result.slug).toBe('same-slug');
    expect(result.title).toBe('Updated Title');
  });

  it('should update published_at with date object', async () => {
    const blogPostId = await createTestBlogPost();
    const publishDate = new Date('2024-02-20T15:30:00Z');

    const updateInput: UpdateBlogPostInput = {
      id: blogPostId,
      is_published: true,
      published_at: publishDate
    };

    const result = await updateBlogPost(updateInput);

    expect(result.is_published).toBe(true);
    expect(result.published_at).toEqual(publishDate);
  });

  it('should handle partial updates correctly', async () => {
    const blogPostId = await createTestBlogPost({
      title: 'Initial Title',
      content: 'Initial content',
      is_published: false
    });

    // First partial update
    await updateBlogPost({
      id: blogPostId,
      title: 'First Update'
    });

    // Second partial update
    const result = await updateBlogPost({
      id: blogPostId,
      is_published: true
    });

    // Both updates should be preserved
    expect(result.title).toBe('First Update');
    expect(result.is_published).toBe(true);
    expect(result.content).toBe('Initial content'); // Should remain unchanged
  });

  it('should update updated_at timestamp', async () => {
    const blogPostId = await createTestBlogPost();

    // Get original timestamp
    const originalPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, blogPostId))
      .execute();

    const originalUpdatedAt = originalPost[0].updated_at;

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const result = await updateBlogPost({
      id: blogPostId,
      title: 'Timestamp Test'
    });

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });
});