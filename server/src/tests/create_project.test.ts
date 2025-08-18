import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput } from '../schema';
import { createProject } from '../handlers/create_project';
import { eq } from 'drizzle-orm';

// Complete test input with all required fields
const testInput: CreateProjectInput = {
  title: 'Test Project',
  description: 'A project for testing',
  image_url: 'https://example.com/image.jpg',
  order_index: 10,
  is_active: true
};

describe('createProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a project with all fields', async () => {
    const result = await createProject(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Project');
    expect(result.description).toEqual('A project for testing');
    expect(result.image_url).toEqual('https://example.com/image.jpg');
    expect(result.order_index).toEqual(10);
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save project to database', async () => {
    const result = await createProject(testInput);

    // Query database to verify project was saved
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, result.id))
      .execute();

    expect(projects).toHaveLength(1);
    expect(projects[0].title).toEqual('Test Project');
    expect(projects[0].description).toEqual('A project for testing');
    expect(projects[0].image_url).toEqual('https://example.com/image.jpg');
    expect(projects[0].order_index).toEqual(10);
    expect(projects[0].is_active).toEqual(true);
    expect(projects[0].created_at).toBeInstanceOf(Date);
    expect(projects[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create project with nullable fields as null', async () => {
    const minimalInput: CreateProjectInput = {
      title: 'Minimal Project',
      description: null,
      image_url: null,
      order_index: 0,
      is_active: true
    };

    const result = await createProject(minimalInput);

    expect(result.title).toEqual('Minimal Project');
    expect(result.description).toBeNull();
    expect(result.image_url).toBeNull();
    expect(result.order_index).toEqual(0);
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();

    // Verify in database
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, result.id))
      .execute();

    expect(projects[0].description).toBeNull();
    expect(projects[0].image_url).toBeNull();
  });

  it('should use default is_active value when not provided', async () => {
    // Create input without is_active field to test Zod default
    const inputWithoutIsActive = {
      title: 'Default Active Project',
      description: 'Testing default value',
      image_url: null,
      order_index: 5
      // is_active is not provided, should use Zod default of true
    } as CreateProjectInput;

    const result = await createProject(inputWithoutIsActive);

    expect(result.title).toEqual('Default Active Project');
    expect(result.is_active).toEqual(true); // Should use default value
    expect(result.order_index).toEqual(5);

    // Verify in database
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, result.id))
      .execute();

    expect(projects[0].is_active).toEqual(true);
  });

  it('should create project with is_active set to false', async () => {
    const inactiveInput: CreateProjectInput = {
      title: 'Inactive Project',
      description: 'This project is inactive',
      image_url: null,
      order_index: 0,
      is_active: false
    };

    const result = await createProject(inactiveInput);

    expect(result.title).toEqual('Inactive Project');
    expect(result.is_active).toEqual(false);

    // Verify in database
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, result.id))
      .execute();

    expect(projects[0].is_active).toEqual(false);
  });

  it('should handle different order_index values', async () => {
    const projects = [
      { ...testInput, title: 'Project 1', order_index: 0 },
      { ...testInput, title: 'Project 2', order_index: 100 },
      { ...testInput, title: 'Project 3', order_index: 50 }
    ];

    const results = await Promise.all(
      projects.map(project => createProject(project))
    );

    expect(results[0].order_index).toEqual(0);
    expect(results[1].order_index).toEqual(100);
    expect(results[2].order_index).toEqual(50);

    // Verify all projects are in database
    const allProjects = await db.select()
      .from(projectsTable)
      .execute();

    expect(allProjects).toHaveLength(3);
    
    // Check order indices are preserved
    const orderIndices = allProjects.map(p => p.order_index).sort((a, b) => a - b);
    expect(orderIndices).toEqual([0, 50, 100]);
  });
});