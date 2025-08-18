import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type BlogPost, type PaginationInput, type PaginatedResponse } from '../schema';
import { eq, desc, and, isNotNull, count } from 'drizzle-orm';

export async function getBlogPosts(input: PaginationInput): Promise<PaginatedResponse<BlogPost>> {
  try {
    const { page, limit } = input;
    const offset = (page - 1) * limit;

    // Build query for published posts only
    let query = db.select()
      .from(blogPostsTable)
      .where(
        and(
          eq(blogPostsTable.is_published, true),
          isNotNull(blogPostsTable.published_at)
        )
      )
      .orderBy(desc(blogPostsTable.published_at))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalQuery = db.select({ count: count() })
      .from(blogPostsTable)
      .where(
        and(
          eq(blogPostsTable.is_published, true),
          isNotNull(blogPostsTable.published_at)
        )
      );

    // Execute both queries
    const [results, totalResults] = await Promise.all([
      query.execute(),
      totalQuery.execute()
    ]);

    const total = totalResults[0].count;
    const totalPages = Math.ceil(total / limit);

    return {
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    throw error;
  }
}

export async function getAllBlogPosts(input: PaginationInput): Promise<PaginatedResponse<BlogPost>> {
  try {
    const { page, limit } = input;
    const offset = (page - 1) * limit;

    // Build query for all posts (published and unpublished)
    let query = db.select()
      .from(blogPostsTable)
      .orderBy(desc(blogPostsTable.created_at))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalQuery = db.select({ count: count() })
      .from(blogPostsTable);

    // Execute both queries
    const [results, totalResults] = await Promise.all([
      query.execute(),
      totalQuery.execute()
    ]);

    const total = totalResults[0].count;
    const totalPages = Math.ceil(total / limit);

    return {
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    console.error('Failed to fetch all blog posts:', error);
    throw error;
  }
}