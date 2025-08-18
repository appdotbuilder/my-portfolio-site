import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type GetBlogPostBySlugInput } from '../schema';
import { getBlogPostBySlug } from '../handlers/get_blog_post_by_slug';

describe('getBlogPostBySlug', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  const createTestBlogPost = async (overrides: Partial<{
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    image_url: string | null;
    is_published: boolean;
    published_at: Date | null;
  }> = {}) => {
    const defaultPost = {
      title: 'Test Blog Post',
      slug: 'test-blog-post',
      excerpt: 'This is a test excerpt',
      content: 'This is the full content of the test blog post.',
      image_url: 'https://example.com/image.jpg',
      is_published: true,
      published_at: new Date(),
      ...overrides
    };

    const result = await db.insert(blogPostsTable)
      .values(defaultPost)
      .returning()
      .execute();

    return result[0];
  };

  it('should return published blog post by slug', async () => {
    // Create a published blog post
    const createdPost = await createTestBlogPost({
      slug: 'published-post',
      title: 'Published Post',
      is_published: true,
      published_at: new Date()
    });

    const input: GetBlogPostBySlugInput = {
      slug: 'published-post'
    };

    const result = await getBlogPostBySlug(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdPost.id);
    expect(result!.title).toEqual('Published Post');
    expect(result!.slug).toEqual('published-post');
    expect(result!.excerpt).toEqual('This is a test excerpt');
    expect(result!.content).toEqual('This is the full content of the test blog post.');
    expect(result!.image_url).toEqual('https://example.com/image.jpg');
    expect(result!.is_published).toEqual(true);
    expect(result!.published_at).toBeInstanceOf(Date);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent slug', async () => {
    const input: GetBlogPostBySlugInput = {
      slug: 'non-existent-slug'
    };

    const result = await getBlogPostBySlug(input);

    expect(result).toBeNull();
  });

  it('should return null for unpublished blog post', async () => {
    // Create an unpublished blog post
    await createTestBlogPost({
      slug: 'unpublished-post',
      is_published: false,
      published_at: null
    });

    const input: GetBlogPostBySlugInput = {
      slug: 'unpublished-post'
    };

    const result = await getBlogPostBySlug(input);

    expect(result).toBeNull();
  });

  it('should return null for published post without published_at date', async () => {
    // Create a blog post that is marked as published but has no published_at date
    await createTestBlogPost({
      slug: 'published-no-date',
      is_published: true,
      published_at: null
    });

    const input: GetBlogPostBySlugInput = {
      slug: 'published-no-date'
    };

    const result = await getBlogPostBySlug(input);

    expect(result).toBeNull();
  });

  it('should return null for unpublished post even with published_at date', async () => {
    // Create a blog post that has published_at but is not marked as published
    await createTestBlogPost({
      slug: 'not-published-with-date',
      is_published: false,
      published_at: new Date()
    });

    const input: GetBlogPostBySlugInput = {
      slug: 'not-published-with-date'
    };

    const result = await getBlogPostBySlug(input);

    expect(result).toBeNull();
  });

  it('should handle blog post with null optional fields', async () => {
    // Create a published blog post with minimal fields
    const createdPost = await createTestBlogPost({
      slug: 'minimal-post',
      title: 'Minimal Post',
      excerpt: null,
      image_url: null,
      is_published: true,
      published_at: new Date()
    });

    const input: GetBlogPostBySlugInput = {
      slug: 'minimal-post'
    };

    const result = await getBlogPostBySlug(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdPost.id);
    expect(result!.title).toEqual('Minimal Post');
    expect(result!.slug).toEqual('minimal-post');
    expect(result!.excerpt).toBeNull();
    expect(result!.image_url).toBeNull();
    expect(result!.content).toEqual('This is the full content of the test blog post.');
    expect(result!.is_published).toEqual(true);
    expect(result!.published_at).toBeInstanceOf(Date);
  });

  it('should return correct post when multiple posts exist', async () => {
    // Create multiple blog posts
    await createTestBlogPost({
      slug: 'first-post',
      title: 'First Post'
    });
    
    const targetPost = await createTestBlogPost({
      slug: 'target-post',
      title: 'Target Post'
    });
    
    await createTestBlogPost({
      slug: 'third-post',
      title: 'Third Post'
    });

    const input: GetBlogPostBySlugInput = {
      slug: 'target-post'
    };

    const result = await getBlogPostBySlug(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(targetPost.id);
    expect(result!.title).toEqual('Target Post');
    expect(result!.slug).toEqual('target-post');
  });
});