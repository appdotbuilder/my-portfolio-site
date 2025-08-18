import { serial, text, pgTable, timestamp, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';

// Enum for page types
export const pageTypeEnum = pgEnum('page_type', ['home', 'about']);

// Admin users table
export const adminUsersTable = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Page content table for Home and About pages
export const pageContentTable = pgTable('page_content', {
  id: serial('id').primaryKey(),
  page_type: pageTypeEnum('page_type').notNull().unique(),
  hero_title: text('hero_title').notNull(),
  hero_text: text('hero_text').notNull(),
  hero_image_url: text('hero_image_url'), // Nullable by default
  content_sections: text('content_sections').notNull(), // JSON string containing rich text content
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Projects table
export const projectsTable = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'), // Nullable by default
  image_url: text('image_url'), // Nullable by default
  order_index: integer('order_index').notNull().default(0),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Blog posts table
export const blogPostsTable = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'), // Nullable by default
  content: text('content').notNull(),
  image_url: text('image_url'), // Nullable by default
  is_published: boolean('is_published').notNull().default(false),
  published_at: timestamp('published_at'), // Nullable by default
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for the table schemas
export type AdminUser = typeof adminUsersTable.$inferSelect;
export type NewAdminUser = typeof adminUsersTable.$inferInsert;

export type PageContent = typeof pageContentTable.$inferSelect;
export type NewPageContent = typeof pageContentTable.$inferInsert;

export type Project = typeof projectsTable.$inferSelect;
export type NewProject = typeof projectsTable.$inferInsert;

export type BlogPost = typeof blogPostsTable.$inferSelect;
export type NewBlogPost = typeof blogPostsTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = {
  adminUsers: adminUsersTable,
  pageContent: pageContentTable,
  projects: projectsTable,
  blogPosts: blogPostsTable,
};