import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteProject = async (input: DeleteInput): Promise<{ success: boolean; message: string }> => {
  try {
    // First, check if the project exists
    const existingProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, input.id))
      .execute();

    if (existingProject.length === 0) {
      return {
        success: false,
        message: 'Project not found'
      };
    }

    // Delete the project
    await db.delete(projectsTable)
      .where(eq(projectsTable.id, input.id))
      .execute();

    return {
      success: true,
      message: 'Project deleted successfully'
    };
  } catch (error) {
    console.error('Project deletion failed:', error);
    throw error;
  }
};