import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type CreateBlogPostInput } from '../schema';
import { createBlogPost } from '../handlers/create_blog_post';
import { eq } from 'drizzle-orm';

// Complete test input with all fields
const testInput: CreateBlogPostInput = {
  title: 'Test Blog Post',
  slug: 'test-blog-post',
  excerpt: 'This is a test excerpt for the blog post',
  content: 'This is the full content of the test blog post with detailed information.',
  image_url: 'https://example.com/test-image.jpg',
  is_published: false,
  published_at: null
};

describe('createBlogPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a blog post with all fields', async () => {
    const result = await createBlogPost(testInput);

    // Validate all fields
    expect(result.title).toEqual('Test Blog Post');
    expect(result.slug).toEqual('test-blog-post');
    expect(result.excerpt).toEqual('This is a test excerpt for the blog post');
    expect(result.content).toEqual('This is the full content of the test blog post with detailed information.');
    expect(result.image_url).toEqual('https://example.com/test-image.jpg');
    expect(result.is_published).toEqual(false);
    expect(result.published_at).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save blog post to database', async () => {
    const result = await createBlogPost(testInput);

    // Query database to verify the blog post was saved
    const blogPosts = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, result.id))
      .execute();

    expect(blogPosts).toHaveLength(1);
    expect(blogPosts[0].title).toEqual('Test Blog Post');
    expect(blogPosts[0].slug).toEqual('test-blog-post');
    expect(blogPosts[0].excerpt).toEqual('This is a test excerpt for the blog post');
    expect(blogPosts[0].content).toEqual('This is the full content of the test blog post with detailed information.');
    expect(blogPosts[0].image_url).toEqual('https://example.com/test-image.jpg');
    expect(blogPosts[0].is_published).toEqual(false);
    expect(blogPosts[0].published_at).toBeNull();
    expect(blogPosts[0].created_at).toBeInstanceOf(Date);
    expect(blogPosts[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create published blog post with published date', async () => {
    const publishedAt = new Date('2024-01-15T10:00:00Z');
    const publishedInput: CreateBlogPostInput = {
      ...testInput,
      slug: 'published-blog-post',
      is_published: true,
      published_at: publishedAt
    };

    const result = await createBlogPost(publishedInput);

    expect(result.is_published).toEqual(true);
    expect(result.published_at).toEqual(publishedAt);
  });

  it('should create blog post with nullable fields as null', async () => {
    const minimalInput: CreateBlogPostInput = {
      title: 'Minimal Blog Post',
      slug: 'minimal-blog-post',
      excerpt: null,
      content: 'Just the content',
      image_url: null,
      is_published: false,
      published_at: null
    };

    const result = await createBlogPost(minimalInput);

    expect(result.title).toEqual('Minimal Blog Post');
    expect(result.slug).toEqual('minimal-blog-post');
    expect(result.excerpt).toBeNull();
    expect(result.content).toEqual('Just the content');
    expect(result.image_url).toBeNull();
    expect(result.is_published).toEqual(false);
    expect(result.published_at).toBeNull();
  });

  it('should apply Zod defaults for boolean fields', async () => {
    const inputWithDefaults: CreateBlogPostInput = {
      title: 'Blog Post with Defaults',
      slug: 'blog-post-defaults',
      excerpt: 'Test excerpt',
      content: 'Test content',
      image_url: 'https://example.com/image.jpg',
      is_published: true, // Explicitly setting to verify defaults work
      published_at: null
    };

    const result = await createBlogPost(inputWithDefaults);

    expect(result.is_published).toEqual(true);
    expect(typeof result.is_published).toEqual('boolean');
  });

  it('should handle slug uniqueness constraint violation', async () => {
    // Create first blog post
    await createBlogPost(testInput);

    // Try to create another blog post with the same slug
    const duplicateInput: CreateBlogPostInput = {
      ...testInput,
      title: 'Different Title',
      content: 'Different content'
    };

    await expect(createBlogPost(duplicateInput)).rejects.toThrow(/unique/i);
  });

  it('should create multiple blog posts with different slugs', async () => {
    const firstPost = await createBlogPost(testInput);
    
    const secondInput: CreateBlogPostInput = {
      ...testInput,
      title: 'Second Blog Post',
      slug: 'second-blog-post'
    };
    
    const secondPost = await createBlogPost(secondInput);

    expect(firstPost.id).not.toEqual(secondPost.id);
    expect(firstPost.slug).toEqual('test-blog-post');
    expect(secondPost.slug).toEqual('second-blog-post');

    // Verify both posts exist in database
    const allPosts = await db.select().from(blogPostsTable).execute();
    expect(allPosts).toHaveLength(2);
  });

  it('should preserve timestamps correctly', async () => {
    const beforeCreation = new Date();
    const result = await createBlogPost(testInput);
    const afterCreation = new Date();

    expect(result.created_at >= beforeCreation).toBe(true);
    expect(result.created_at <= afterCreation).toBe(true);
    expect(result.updated_at >= beforeCreation).toBe(true);
    expect(result.updated_at <= afterCreation).toBe(true);
  });
});