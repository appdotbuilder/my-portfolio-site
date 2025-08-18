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

    return results;
  } catch (error) {
    console.error('Get all projects failed:', error);
    throw error;
  }
}