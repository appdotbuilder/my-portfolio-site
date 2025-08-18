import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type PaginationInput } from '../schema';
import { getBlogPosts, getAllBlogPosts } from '../handlers/get_blog_posts';

// Test inputs
const defaultPaginationInput: PaginationInput = {
  page: 1,
  limit: 10
};

const customPaginationInput: PaginationInput = {
  page: 2,
  limit: 5
};

describe('getBlogPosts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty result when no published posts exist', async () => {
    const result = await getBlogPosts(defaultPaginationInput);

    expect(result.data).toHaveLength(0);
    expect(result.pagination.total).toEqual(0);
    expect(result.pagination.totalPages).toEqual(0);
    expect(result.pagination.hasNext).toBe(false);
    expect(result.pagination.hasPrev).toBe(false);
  });

  it('should return only published posts with published_at date', async () => {
    // Create test posts - mix of published and unpublished
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    await db.insert(blogPostsTable).values([
      {
        title: 'Published Post 1',
        slug: 'published-1',
        content: 'Content 1',
        is_published: true,
        published_at: now
      },
      {
        title: 'Published Post 2',
        slug: 'published-2',
        content: 'Content 2',
        is_published: true,
        published_at: yesterday
      },
      {
        title: 'Draft Post',
        slug: 'draft-1',
        content: 'Draft content',
        is_published: false,
        published_at: null
      },
      {
        title: 'Published No Date',
        slug: 'published-no-date',
        content: 'Content without date',
        is_published: true,
        published_at: null // Should be excluded
      }
    ]);

    const result = await getBlogPosts(defaultPaginationInput);

    expect(result.data).toHaveLength(2);
    expect(result.pagination.total).toEqual(2);
    expect(result.pagination.totalPages).toEqual(1);
    
    // Should be ordered by published_at descending
    expect(result.data[0].title).toEqual('Published Post 1');
    expect(result.data[1].title).toEqual('Published Post 2');
    
    // Verify all returned posts are published with dates
    result.data.forEach(post => {
      expect(post.is_published).toBe(true);
      expect(post.published_at).not.toBeNull();
      expect(post.published_at).toBeInstanceOf(Date);
    });
  });

  it('should handle pagination correctly', async () => {
    // Create 12 published posts
    const posts = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i); // Different dates for proper ordering
      return {
        title: `Post ${i + 1}`,
        slug: `post-${i + 1}`,
        content: `Content ${i + 1}`,
        is_published: true,
        published_at: date
      };
    });

    await db.insert(blogPostsTable).values(posts);

    // Test first page
    const page1 = await getBlogPosts({ page: 1, limit: 5 });
    expect(page1.data).toHaveLength(5);
    expect(page1.pagination.page).toEqual(1);
    expect(page1.pagination.limit).toEqual(5);
    expect(page1.pagination.total).toEqual(12);
    expect(page1.pagination.totalPages).toEqual(3);
    expect(page1.pagination.hasNext).toBe(true);
    expect(page1.pagination.hasPrev).toBe(false);

    // Test middle page
    const page2 = await getBlogPosts({ page: 2, limit: 5 });
    expect(page2.data).toHaveLength(5);
    expect(page2.pagination.page).toEqual(2);
    expect(page2.pagination.hasNext).toBe(true);
    expect(page2.pagination.hasPrev).toBe(true);

    // Test last page
    const page3 = await getBlogPosts({ page: 3, limit: 5 });
    expect(page3.data).toHaveLength(2);
    expect(page3.pagination.page).toEqual(3);
    expect(page3.pagination.hasNext).toBe(false);
    expect(page3.pagination.hasPrev).toBe(true);
  });

  it('should order posts by published_at descending', async () => {
    const baseDate = new Date('2024-01-01');
    const posts = [
      {
        title: 'Oldest Post',
        slug: 'oldest',
        content: 'Content',
        is_published: true,
        published_at: new Date(baseDate.getTime() + 1000) // +1 second
      },
      {
        title: 'Newest Post',
        slug: 'newest',
        content: 'Content',
        is_published: true,
        published_at: new Date(baseDate.getTime() + 3000) // +3 seconds
      },
      {
        title: 'Middle Post',
        slug: 'middle',
        content: 'Content',
        is_published: true,
        published_at: new Date(baseDate.getTime() + 2000) // +2 seconds
      }
    ];

    await db.insert(blogPostsTable).values(posts);

    const result = await getBlogPosts(defaultPaginationInput);

    expect(result.data).toHaveLength(3);
    expect(result.data[0].title).toEqual('Newest Post');
    expect(result.data[1].title).toEqual('Middle Post');
    expect(result.data[2].title).toEqual('Oldest Post');
  });
});

describe('getAllBlogPosts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty result when no posts exist', async () => {
    const result = await getAllBlogPosts(defaultPaginationInput);

    expect(result.data).toHaveLength(0);
    expect(result.pagination.total).toEqual(0);
    expect(result.pagination.totalPages).toEqual(0);
    expect(result.pagination.hasNext).toBe(false);
    expect(result.pagination.hasPrev).toBe(false);
  });

  it('should return all posts regardless of publish status', async () => {
    const now = new Date();
    
    await db.insert(blogPostsTable).values([
      {
        title: 'Published Post',
        slug: 'published',
        content: 'Content',
        is_published: true,
        published_at: now
      },
      {
        title: 'Draft Post',
        slug: 'draft',
        content: 'Content',
        is_published: false,
        published_at: null
      },
      {
        title: 'Published No Date',
        slug: 'published-no-date',
        content: 'Content',
        is_published: true,
        published_at: null
      }
    ]);

    const result = await getAllBlogPosts(defaultPaginationInput);

    expect(result.data).toHaveLength(3);
    expect(result.pagination.total).toEqual(3);
    
    // Should include posts with different publish statuses
    const titles = result.data.map(post => post.title);
    expect(titles).toContain('Published Post');
    expect(titles).toContain('Draft Post');
    expect(titles).toContain('Published No Date');
  });

  it('should order posts by created_at descending', async () => {
    const baseDate = new Date('2024-01-01');
    
    // Insert posts in different order than expected result
    await db.insert(blogPostsTable).values([
      {
        title: 'Second Post',
        slug: 'second',
        content: 'Content',
        is_published: false,
        created_at: new Date(baseDate.getTime() + 2000)
      },
      {
        title: 'First Post',
        slug: 'first',
        content: 'Content',
        is_published: true,
        created_at: new Date(baseDate.getTime() + 1000)
      },
      {
        title: 'Third Post',
        slug: 'third',
        content: 'Content',
        is_published: true,
        created_at: new Date(baseDate.getTime() + 3000)
      }
    ]);

    const result = await getAllBlogPosts(defaultPaginationInput);

    expect(result.data).toHaveLength(3);
    // Should be ordered by created_at descending (newest first)
    expect(result.data[0].title).toEqual('Third Post');
    expect(result.data[1].title).toEqual('Second Post');
    expect(result.data[2].title).toEqual('First Post');
  });

  it('should handle pagination correctly for all posts', async () => {
    // Create mix of published and draft posts
    const posts = Array.from({ length: 8 }, (_, i) => ({
      title: `Post ${i + 1}`,
      slug: `post-${i + 1}`,
      content: `Content ${i + 1}`,
      is_published: i % 2 === 0, // Alternate published/draft
      published_at: i % 2 === 0 ? new Date() : null
    }));

    await db.insert(blogPostsTable).values(posts);

    // Test first page
    const page1 = await getAllBlogPosts({ page: 1, limit: 3 });
    expect(page1.data).toHaveLength(3);
    expect(page1.pagination.total).toEqual(8);
    expect(page1.pagination.totalPages).toEqual(3);
    expect(page1.pagination.hasNext).toBe(true);
    expect(page1.pagination.hasPrev).toBe(false);

    // Test last page
    const page3 = await getAllBlogPosts({ page: 3, limit: 3 });
    expect(page3.data).toHaveLength(2);
    expect(page3.pagination.hasNext).toBe(false);
    expect(page3.pagination.hasPrev).toBe(true);
  });

  it('should handle edge case pagination', async () => {
    // Create exactly 10 posts (matches default limit)
    const posts = Array.from({ length: 10 }, (_, i) => ({
      title: `Post ${i + 1}`,
      slug: `post-${i + 1}`,
      content: `Content ${i + 1}`,
      is_published: true,
      published_at: new Date()
    }));

    await db.insert(blogPostsTable).values(posts);

    const result = await getAllBlogPosts(defaultPaginationInput);
    expect(result.data).toHaveLength(10);
    expect(result.pagination.totalPages).toEqual(1);
    expect(result.pagination.hasNext).toBe(false);
    expect(result.pagination.hasPrev).toBe(false);

    // Test page beyond available data
    const emptyPage = await getAllBlogPosts({ page: 2, limit: 10 });
    expect(emptyPage.data).toHaveLength(0);
    expect(emptyPage.pagination.hasNext).toBe(false);
    expect(emptyPage.pagination.hasPrev).toBe(true);
  });
});