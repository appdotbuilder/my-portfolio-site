import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type UpdateProjectInput } from '../schema';
import { updateProject } from '../handlers/update_project';
import { eq } from 'drizzle-orm';

// Helper to create a test project
const createTestProject = async () => {
  const result = await db.insert(projectsTable)
    .values({
      title: 'Original Project',
      description: 'Original description',
      image_url: 'https://example.com/original.jpg',
      order_index: 5,
      is_active: true
    })
    .returning()
    .execute();
  return result[0];
};

describe('updateProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all project fields', async () => {
    const project = await createTestProject();
    
    const updateInput: UpdateProjectInput = {
      id: project.id,
      title: 'Updated Project',
      description: 'Updated description',
      image_url: 'https://example.com/updated.jpg',
      order_index: 10,
      is_active: false
    };

    const result = await updateProject(updateInput);

    // Verify all fields are updated
    expect(result.id).toEqual(project.id);
    expect(result.title).toEqual('Updated Project');
    expect(result.description).toEqual('Updated description');
    expect(result.image_url).toEqual('https://example.com/updated.jpg');
    expect(result.order_index).toEqual(10);
    expect(result.is_active).toEqual(false);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > project.updated_at).toBe(true);
  });

  it('should update only provided fields', async () => {
    const project = await createTestProject();
    
    const updateInput: UpdateProjectInput = {
      id: project.id,
      title: 'Partially Updated Title'
    };

    const result = await updateProject(updateInput);

    // Verify only title is updated, other fields remain unchanged
    expect(result.title).toEqual('Partially Updated Title');
    expect(result.description).toEqual(project.description);
    expect(result.image_url).toEqual(project.image_url);
    expect(result.order_index).toEqual(project.order_index);
    expect(result.is_active).toEqual(project.is_active);
    expect(result.updated_at > project.updated_at).toBe(true);
  });

  it('should update nullable fields to null', async () => {
    const project = await createTestProject();
    
    const updateInput: UpdateProjectInput = {
      id: project.id,
      description: null,
      image_url: null
    };

    const result = await updateProject(updateInput);

    // Verify nullable fields are set to null
    expect(result.description).toBeNull();
    expect(result.image_url).toBeNull();
    expect(result.title).toEqual(project.title);
    expect(result.updated_at > project.updated_at).toBe(true);
  });

  it('should update order index and active status', async () => {
    const project = await createTestProject();
    
    const updateInput: UpdateProjectInput = {
      id: project.id,
      order_index: 0,
      is_active: false
    };

    const result = await updateProject(updateInput);

    // Verify order and status updates
    expect(result.order_index).toEqual(0);
    expect(result.is_active).toEqual(false);
    expect(result.title).toEqual(project.title);
    expect(result.description).toEqual(project.description);
  });

  it('should persist changes to database', async () => {
    const project = await createTestProject();
    
    const updateInput: UpdateProjectInput = {
      id: project.id,
      title: 'Database Updated Title',
      is_active: false
    };

    await updateProject(updateInput);

    // Query database directly to verify persistence
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, project.id))
      .execute();

    expect(projects).toHaveLength(1);
    expect(projects[0].title).toEqual('Database Updated Title');
    expect(projects[0].is_active).toEqual(false);
    expect(projects[0].updated_at > project.updated_at).toBe(true);
  });

  it('should throw error when project does not exist', async () => {
    const updateInput: UpdateProjectInput = {
      id: 99999, // Non-existent ID
      title: 'Should Not Work'
    };

    await expect(updateProject(updateInput)).rejects.toThrow(/project not found/i);
  });

  it('should always update the updated_at timestamp', async () => {
    const project = await createTestProject();
    
    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 1));
    
    const updateInput: UpdateProjectInput = {
      id: project.id
    };

    const result = await updateProject(updateInput);

    // Even with no field changes, updated_at should be newer
    expect(result.updated_at > project.updated_at).toBe(true);
    expect(result.created_at).toEqual(project.created_at);
  });

  it('should handle multiple projects correctly', async () => {
    // Create multiple projects
    const project1 = await createTestProject();
    const project2 = await db.insert(projectsTable)
      .values({
        title: 'Second Project',
        description: 'Second description',
        order_index: 1,
        is_active: true
      })
      .returning()
      .execute()
      .then(result => result[0]);

    const updateInput: UpdateProjectInput = {
      id: project1.id,
      title: 'Updated First Project'
    };

    const result = await updateProject(updateInput);

    // Verify only the target project was updated
    expect(result.title).toEqual('Updated First Project');

    // Verify second project remains unchanged
    const unchangedProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, project2.id))
      .execute();

    expect(unchangedProject[0].title).toEqual('Second Project');
    expect(unchangedProject[0].updated_at).toEqual(project2.updated_at);
  });
});