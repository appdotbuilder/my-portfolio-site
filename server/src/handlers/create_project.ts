import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput, type Project } from '../schema';

export const createProject = async (input: CreateProjectInput): Promise<Project> => {
  try {
    // Insert project record
    const result = await db.insert(projectsTable)
      .values({
        title: input.title,
        description: input.description,
        image_url: input.image_url,
        order_index: input.order_index,
        is_active: input.is_active ?? true // Use default if not provided
      })
      .returning()
      .execute();

    // Return the created project
    const project = result[0];
    return {
      ...project,
      // All fields are already properly typed, no numeric conversions needed
    };
  } catch (error) {
    console.error('Project creation failed:', error);
    throw error;
  }
};