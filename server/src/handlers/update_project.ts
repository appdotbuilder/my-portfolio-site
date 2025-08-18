import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type UpdateProjectInput, type Project } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateProject(input: UpdateProjectInput): Promise<Project> {
  try {
    // Build update object with only provided fields
    const updateData: Record<string, any> = {
      updated_at: new Date()
    };

    if (input.title !== undefined) {
      updateData['title'] = input.title;
    }
    if (input.description !== undefined) {
      updateData['description'] = input.description;
    }
    if (input.image_url !== undefined) {
      updateData['image_url'] = input.image_url;
    }
    if (input.order_index !== undefined) {
      updateData['order_index'] = input.order_index;
    }
    if (input.is_active !== undefined) {
      updateData['is_active'] = input.is_active;
    }

    // Update the project and return the updated record
    const result = await db.update(projectsTable)
      .set(updateData)
      .where(eq(projectsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error('Project not found');
    }

    return result[0];
  } catch (error) {
    console.error('Project update failed:', error);
    throw error;
  }
}