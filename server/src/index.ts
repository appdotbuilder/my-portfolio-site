import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { db } from './db';
import { adminUsersTable, pageContentTable } from './db/schema';
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

// Database seeding function
async function seedDatabase() {
  try {
    // Seed admin users
    const existingAdmins = await db.select()
      .from(adminUsersTable)
      .execute();

    if (existingAdmins.length === 0) {
      console.log('No admin users found. Creating default admin user...');
      
      // Hash the default password
      const hashedPassword = await Bun.password.hash('password');
      
      // Create default admin user
      await db.insert(adminUsersTable)
        .values({
          username: 'admin',
          password_hash: hashedPassword
        })
        .execute();
      
      console.log('Default admin user created successfully (username: admin, password: password)');
    }

    // Seed page content
    const existingPageContent = await db.select()
      .from(pageContentTable)
      .execute();

    if (existingPageContent.length === 0) {
      console.log('No page content found. Creating default page content...');
      
      // Create default home page content
      await db.insert(pageContentTable)
        .values({
          page_type: 'home',
          hero_title: 'Welcome to Our Amazing Platform',
          hero_text: 'We create innovative digital solutions that help businesses grow and succeed in the modern world. Our team of experts is passionate about delivering exceptional results.',
          hero_image_url: null,
          content_sections: JSON.stringify({
            sections: [
              {
                title: 'Innovation First',
                content: 'We leverage cutting-edge technologies to build solutions that are not just current, but future-ready.',
                image: null
              },
              {
                title: 'Expert Team',
                content: 'Our diverse team brings together years of experience in design, development, and digital strategy.',
                image: null
              },
              {
                title: 'Results Driven',
                content: 'Every project we undertake is focused on delivering measurable results and exceeding expectations.',
                image: null
              }
            ]
          })
        })
        .execute();

      // Create default about page content
      await db.insert(pageContentTable)
        .values({
          page_type: 'about',
          hero_title: 'About Our Company',
          hero_text: 'We are a team of passionate professionals dedicated to creating exceptional digital experiences. Our story is one of innovation, collaboration, and continuous growth.',
          hero_image_url: null,
          content_sections: JSON.stringify({
            sections: [
              {
                title: 'Our Mission',
                content: 'To empower businesses with cutting-edge technology solutions that drive growth and success.',
                image: null
              },
              {
                title: 'Our Values',
                content: 'We believe in transparency, innovation, and putting our clients first in everything we do.',
                image: null
              },
              {
                title: 'Our Vision',
                content: 'To be the leading provider of digital solutions that transform how businesses operate and grow.',
                image: null
              }
            ]
          })
        })
        .execute();
      
      console.log('Default page content created successfully for Home and About pages');
    }

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Database seeding failed:', error);
    // Don't throw the error to prevent app startup failure
  }
}

async function start() {
  // Run database seeding before starting the server
  await seedDatabase();
  
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