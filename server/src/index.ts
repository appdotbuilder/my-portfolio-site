import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  adminLoginInputSchema,
  updatePageContentInputSchema,
  createProjectInputSchema,
  updateProjectInputSchema,
  deleteInputSchema,
  createBlogPostInputSchema,
  updateBlogPostInputSchema,
  paginationInputSchema,
  getBlogPostBySlugInputSchema
} from './schema';

// Import handlers
import { adminLogin } from './handlers/admin_login';
import { updatePageContent } from './handlers/update_page_content';
import { getPageContent } from './handlers/get_page_content';
import { getProjects, getAllProjects } from './handlers/get_projects';
import { createProject } from './handlers/create_project';
import { updateProject } from './handlers/update_project';
import { deleteProject } from './handlers/delete_project';
import { getBlogPosts, getAllBlogPosts } from './handlers/get_blog_posts';
import { getBlogPostBySlug } from './handlers/get_blog_post_by_slug';
import { createBlogPost } from './handlers/create_blog_post';
import { updateBlogPost } from './handlers/update_blog_post';
import { deleteBlogPost } from './handlers/delete_blog_post';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check endpoint
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Admin authentication
  adminLogin: publicProcedure
    .input(adminLoginInputSchema)
    .mutation(({ input }) => adminLogin(input)),

  // Page content management (Home and About pages)
  getPageContent: publicProcedure
    .input(z.enum(['home', 'about']))
    .query(({ input }) => getPageContent(input)),

  updatePageContent: publicProcedure
    .input(updatePageContentInputSchema)
    .mutation(({ input }) => updatePageContent(input)),

  // Project management
  getProjects: publicProcedure
    .query(() => getProjects()),

  getAllProjects: publicProcedure
    .query(() => getAllProjects()),

  createProject: publicProcedure
    .input(createProjectInputSchema)
    .mutation(({ input }) => createProject(input)),

  updateProject: publicProcedure
    .input(updateProjectInputSchema)
    .mutation(({ input }) => updateProject(input)),

  deleteProject: publicProcedure
    .input(deleteInputSchema)
    .mutation(({ input }) => deleteProject(input)),

  // Blog management
  getBlogPosts: publicProcedure
    .input(paginationInputSchema)
    .query(({ input }) => getBlogPosts(input)),

  getAllBlogPosts: publicProcedure
    .input(paginationInputSchema)
    .query(({ input }) => getAllBlogPosts(input)),

  getBlogPostBySlug: publicProcedure
    .input(getBlogPostBySlugInputSchema)
    .query(({ input }) => getBlogPostBySlug(input)),

  createBlogPost: publicProcedure
    .input(createBlogPostInputSchema)
    .mutation(({ input }) => createBlogPost(input)),

  updateBlogPost: publicProcedure
    .input(updateBlogPostInputSchema)
    .mutation(({ input }) => updateBlogPost(input)),

  deleteBlogPost: publicProcedure
    .input(deleteInputSchema)
    .mutation(({ input }) => deleteBlogPost(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();