import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type DeleteInput, type CreateProjectInput } from '../schema';
import { deleteProject } from '../handlers/delete_project';
import { eq } from 'drizzle-orm';

// Test inputs
const testProjectInput: CreateProjectInput = {
  title: 'Test Project',
  description: 'A project for testing deletion',
  image_url: 'https://example.com/image.jpg',
  order_index: 0,
  is_active: true
};

describe('deleteProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing project', async () => {
    // Create a project first
    const createdProjects = await db.insert(projectsTable)
      .values({
        title: testProjectInput.title,
        description: testProjectInput.description,
        image_url: testProjectInput.image_url,
        order_index: testProjectInput.order_index,
        is_active: testProjectInput.is_active
      })
      .returning()
      .execute();

    const projectId = createdProjects[0].id;
    const deleteInput: DeleteInput = { id: projectId };

    // Delete the project
    const result = await deleteProject(deleteInput);

    // Verify successful deletion response
    expect(result.success).toBe(true);
    expect(result.message).toBe('Project deleted successfully');

    // Verify project is actually deleted from database
    const deletedProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId))
      .execute();

    expect(deletedProject).toHaveLength(0);
  });

  it('should return failure when project does not exist', async () => {
    const deleteInput: DeleteInput = { id: 999 }; // Non-existent ID

    const result = await deleteProject(deleteInput);

    // Verify failure response
    expect(result.success).toBe(false);
    expect(result.message).toBe('Project not found');
  });

  it('should handle multiple projects correctly', async () => {
    // Create multiple projects
    const projectsToCreate = [
      { ...testProjectInput, title: 'Project 1', order_index: 1 },
      { ...testProjectInput, title: 'Project 2', order_index: 2 },
      { ...testProjectInput, title: 'Project 3', order_index: 3 }
    ];

    const createdProjects = await db.insert(projectsTable)
      .values(projectsToCreate)
      .returning()
      .execute();

    // Delete the middle project
    const projectToDelete = createdProjects[1];
    const deleteInput: DeleteInput = { id: projectToDelete.id };

    const result = await deleteProject(deleteInput);

    // Verify successful deletion
    expect(result.success).toBe(true);
    expect(result.message).toBe('Project deleted successfully');

    // Verify only the targeted project is deleted
    const remainingProjects = await db.select()
      .from(projectsTable)
      .execute();

    expect(remainingProjects).toHaveLength(2);
    expect(remainingProjects.map(p => p.id)).not.toContain(projectToDelete.id);
    expect(remainingProjects.map(p => p.title)).toEqual(['Project 1', 'Project 3']);
  });

  it('should work with projects having null fields', async () => {
    // Create project with minimal required fields
    const minimalProjectInput = {
      title: 'Minimal Project',
      description: null,
      image_url: null,
      order_index: 0,
      is_active: true
    };

    const createdProjects = await db.insert(projectsTable)
      .values(minimalProjectInput)
      .returning()
      .execute();

    const projectId = createdProjects[0].id;
    const deleteInput: DeleteInput = { id: projectId };

    // Delete the project
    const result = await deleteProject(deleteInput);

    // Verify successful deletion
    expect(result.success).toBe(true);
    expect(result.message).toBe('Project deleted successfully');

    // Verify project is deleted
    const deletedProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId))
      .execute();

    expect(deletedProject).toHaveLength(0);
  });

  it('should preserve other projects when deleting one', async () => {
    // Create two projects
    const project1Data = { ...testProjectInput, title: 'Project 1' };
    const project2Data = { ...testProjectInput, title: 'Project 2' };

    const createdProjects = await db.insert(projectsTable)
      .values([project1Data, project2Data])
      .returning()
      .execute();

    const project1Id = createdProjects[0].id;
    const project2Id = createdProjects[1].id;

    // Delete first project
    const deleteInput: DeleteInput = { id: project1Id };
    const result = await deleteProject(deleteInput);

    expect(result.success).toBe(true);

    // Verify first project is deleted
    const deletedProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, project1Id))
      .execute();
    expect(deletedProject).toHaveLength(0);

    // Verify second project still exists
    const remainingProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, project2Id))
      .execute();
    expect(remainingProject).toHaveLength(1);
    expect(remainingProject[0].title).toBe('Project 2');
  });
});