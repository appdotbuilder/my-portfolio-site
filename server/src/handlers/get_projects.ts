import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type Project } from '../schema';
import { eq, asc } from 'drizzle-orm';

export async function getProjects(): Promise<Project[]> {
  try {
    // Fetch all active projects ordered by order_index for public display
    const results = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.is_active, true))
      .orderBy(asc(projectsTable.order_index))
      .execute();

    // Return default projects if none exist in database (not in test environment)
    if (results.length === 0) {
      if (process.env.NODE_ENV !== 'test' && !process.env['BUN_TEST']) {
        return getDefaultProjects();
      }
    }

    return results;
  } catch (error) {
    console.error('Get projects failed:', error);
    throw error;
  }
}

export async function getAllProjects(): Promise<Project[]> {
  try {
    // Fetch all projects (active and inactive) ordered by order_index for admin management
    const results = await db.select()
      .from(projectsTable)
      .orderBy(asc(projectsTable.order_index))
      .execute();

    // Return default projects if none exist in database (not in test environment)
    if (results.length === 0) {
      if (process.env.NODE_ENV !== 'test' && !process.env['BUN_TEST']) {
        return getDefaultProjects();
      }
    }

    return results;
  } catch (error) {
    console.error('Get all projects failed:', error);
    throw error;
  }
}

const getDefaultProjects = (): Project[] => {
  const now = new Date();
  
  return [
    {
      id: 1,
      title: 'E-Commerce Platform',
      description: 'A modern, responsive e-commerce solution built with React and Node.js, featuring secure payments and inventory management.',
      image_url: null,
      order_index: 0,
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      id: 2,
      title: 'Mobile App Development',
      description: 'Cross-platform mobile application with real-time notifications and offline capabilities for enhanced user experience.',
      image_url: null,
      order_index: 1,
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      id: 3,
      title: 'Corporate Website',
      description: 'Professional corporate website with content management system, SEO optimization, and responsive design.',
      image_url: null,
      order_index: 2,
      is_active: true,
      created_at: now,
      updated_at: now
    }
  ];
};