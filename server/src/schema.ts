import { z } from 'zod';

// Admin user schema
export const adminUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  password_hash: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type AdminUser = z.infer<typeof adminUserSchema>;

// Admin login input schema
export const adminLoginInputSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

export type AdminLoginInput = z.infer<typeof adminLoginInputSchema>;

// Admin login response schema
export const adminLoginResponseSchema = z.object({
  success: z.boolean(),
  token: z.string().optional(),
  message: z.string().optional()
});

export type AdminLoginResponse = z.infer<typeof adminLoginResponseSchema>;

// Page content schema for Home and About pages
export const pageContentSchema = z.object({
  id: z.number(),
  page_type: z.enum(['home', 'about']),
  hero_title: z.string(),
  hero_text: z.string(),
  hero_image_url: z.string().nullable(),
  content_sections: z.string(), // JSON string containing rich text content
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type PageContent = z.infer<typeof pageContentSchema>;

// Input schema for updating page content
export const updatePageContentInputSchema = z.object({
  page_type: z.enum(['home', 'about']),
  hero_title: z.string().min(1, "Hero title is required"),
  hero_text: z.string().min(1, "Hero text is required"),
  hero_image_url: z.string().nullable(),
  content_sections: z.string().min(1, "Content sections are required")
});

export type UpdatePageContentInput = z.infer<typeof updatePageContentInputSchema>;

// Project schema
export const projectSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  image_url: z.string().nullable(),
  order_index: z.number().int(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Project = z.infer<typeof projectSchema>;

// Input schema for creating projects
export const createProjectInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable(),
  image_url: z.string().nullable(),
  order_index: z.number().int().nonnegative(),
  is_active: z.boolean().default(true)
});

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;

// Input schema for updating projects
export const updateProjectInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  order_index: z.number().int().nonnegative().optional(),
  is_active: z.boolean().optional()
});

export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;

// Blog post schema
export const blogPostSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  content: z.string(),
  image_url: z.string().nullable(),
  is_published: z.boolean(),
  published_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type BlogPost = z.infer<typeof blogPostSchema>;

// Input schema for creating blog posts
export const createBlogPostInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().nullable(),
  content: z.string().min(1, "Content is required"),
  image_url: z.string().nullable(),
  is_published: z.boolean().default(false),
  published_at: z.coerce.date().nullable()
});

export type CreateBlogPostInput = z.infer<typeof createBlogPostInputSchema>;

// Input schema for updating blog posts
export const updateBlogPostInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required").optional(),
  slug: z.string().min(1, "Slug is required").optional(),
  excerpt: z.string().nullable().optional(),
  content: z.string().min(1, "Content is required").optional(),
  image_url: z.string().nullable().optional(),
  is_published: z.boolean().optional(),
  published_at: z.coerce.date().nullable().optional()
});

export type UpdateBlogPostInput = z.infer<typeof updateBlogPostInputSchema>;

// Pagination schema
export const paginationInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10)
});

export type PaginationInput = z.infer<typeof paginationInputSchema>;

// Paginated response schema
export const paginatedResponseSchema = z.object({
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean()
  })
});

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

// Get blog post by slug input schema
export const getBlogPostBySlugInputSchema = z.object({
  slug: z.string().min(1, "Slug is required")
});

export type GetBlogPostBySlugInput = z.infer<typeof getBlogPostBySlugInputSchema>;

// Delete input schema (generic for projects and blog posts)
export const deleteInputSchema = z.object({
  id: z.number()
});

export type DeleteInput = z.infer<typeof deleteInputSchema>;