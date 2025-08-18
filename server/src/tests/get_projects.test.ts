import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { getProjects, getAllProjects } from '../handlers/get_projects';

describe('getProjects', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no projects exist', async () => {
    const result = await getProjects();
    expect(result).toEqual([]);
  });

  it('should return only active projects ordered by order_index', async () => {
    // Create test projects with different order_index and active status
    await db.insert(projectsTable).values([
      {
        title: 'Project C',
        description: 'Third project',
        image_url: null,
        order_index: 2,
        is_active: true
      },
      {
        title: 'Project A',
        description: 'First project',
        image_url: 'https://example.com/image1.jpg',
        order_index: 0,
        is_active: true
      },
      {
        title: 'Inactive Project',
        description: 'This should not appear',
        image_url: null,
        order_index: 1,
        is_active: false
      },
      {
        title: 'Project B',
        description: 'Second project',
        image_url: 'https://example.com/image2.jpg',
        order_index: 1,
        is_active: true
      }
    ]).execute();

    const result = await getProjects();

    // Should return 3 active projects in order_index order
    expect(result).toHaveLength(3);
    expect(result[0].title).toEqual('Project A');
    expect(result[0].order_index).toEqual(0);
    expect(result[1].title).toEqual('Project B');
    expect(result[1].order_index).toEqual(1);
    expect(result[2].title).toEqual('Project C');
    expect(result[2].order_index).toEqual(2);

    // Verify all returned projects are active
    result.forEach(project => {
      expect(project.is_active).toBe(true);
    });
  });

  it('should return projects with all required fields', async () => {
    await db.insert(projectsTable).values({
      title: 'Test Project',
      description: 'Test description',
      image_url: 'https://example.com/test.jpg',
      order_index: 0,
      is_active: true
    }).execute();

    const result = await getProjects();

    expect(result).toHaveLength(1);
    const project = result[0];
    
    // Verify all fields are present and have correct types
    expect(project.id).toBeDefined();
    expect(typeof project.id).toBe('number');
    expect(project.title).toEqual('Test Project');
    expect(project.description).toEqual('Test description');
    expect(project.image_url).toEqual('https://example.com/test.jpg');
    expect(project.order_index).toEqual(0);
    expect(project.is_active).toBe(true);
    expect(project.created_at).toBeInstanceOf(Date);
    expect(project.updated_at).toBeInstanceOf(Date);
  });

  it('should handle null values correctly', async () => {
    await db.insert(projectsTable).values({
      title: 'Minimal Project',
      description: null,
      image_url: null,
      order_index: 0,
      is_active: true
    }).execute();

    const result = await getProjects();

    expect(result).toHaveLength(1);
    const project = result[0];
    
    expect(project.title).toEqual('Minimal Project');
    expect(project.description).toBeNull();
    expect(project.image_url).toBeNull();
    expect(project.is_active).toBe(true);
  });

  it('should not return inactive projects', async () => {
    // Create only inactive projects
    await db.insert(projectsTable).values([
      {
        title: 'Inactive Project 1',
        description: 'Should not appear',
        image_url: null,
        order_index: 0,
        is_active: false
      },
      {
        title: 'Inactive Project 2',
        description: 'Should not appear',
        image_url: null,
        order_index: 1,
        is_active: false
      }
    ]).execute();

    const result = await getProjects();
    expect(result).toHaveLength(0);
  });
});

describe('getAllProjects', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no projects exist', async () => {
    const result = await getAllProjects();
    expect(result).toEqual([]);
  });

  it('should return all projects (active and inactive) ordered by order_index', async () => {
    // Create test projects with different order_index and active status
    await db.insert(projectsTable).values([
      {
        title: 'Project C',
        description: 'Third project',
        image_url: null,
        order_index: 2,
        is_active: true
      },
      {
        title: 'Project A',
        description: 'First project',
        image_url: 'https://example.com/image1.jpg',
        order_index: 0,
        is_active: true
      },
      {
        title: 'Inactive Project',
        description: 'Inactive project',
        image_url: null,
        order_index: 1,
        is_active: false
      },
      {
        title: 'Project D',
        description: 'Fourth project',
        image_url: 'https://example.com/image4.jpg',
        order_index: 3,
        is_active: false
      }
    ]).execute();

    const result = await getAllProjects();

    // Should return all 4 projects in order_index order
    expect(result).toHaveLength(4);
    expect(result[0].title).toEqual('Project A');
    expect(result[0].order_index).toEqual(0);
    expect(result[0].is_active).toBe(true);
    
    expect(result[1].title).toEqual('Inactive Project');
    expect(result[1].order_index).toEqual(1);
    expect(result[1].is_active).toBe(false);
    
    expect(result[2].title).toEqual('Project C');
    expect(result[2].order_index).toEqual(2);
    expect(result[2].is_active).toBe(true);
    
    expect(result[3].title).toEqual('Project D');
    expect(result[3].order_index).toEqual(3);
    expect(result[3].is_active).toBe(false);
  });

  it('should return projects with all required fields', async () => {
    await db.insert(projectsTable).values({
      title: 'Admin Test Project',
      description: 'Test description for admin',
      image_url: 'https://example.com/admin-test.jpg',
      order_index: 5,
      is_active: false
    }).execute();

    const result = await getAllProjects();

    expect(result).toHaveLength(1);
    const project = result[0];
    
    // Verify all fields are present and have correct types
    expect(project.id).toBeDefined();
    expect(typeof project.id).toBe('number');
    expect(project.title).toEqual('Admin Test Project');
    expect(project.description).toEqual('Test description for admin');
    expect(project.image_url).toEqual('https://example.com/admin-test.jpg');
    expect(project.order_index).toEqual(5);
    expect(project.is_active).toBe(false);
    expect(project.created_at).toBeInstanceOf(Date);
    expect(project.updated_at).toBeInstanceOf(Date);
  });

  it('should include both active and inactive projects', async () => {
    await db.insert(projectsTable).values([
      {
        title: 'Active Project',
        description: 'Active description',
        image_url: null,
        order_index: 0,
        is_active: true
      },
      {
        title: 'Inactive Project',
        description: 'Inactive description',
        image_url: null,
        order_index: 1,
        is_active: false
      }
    ]).execute();

    const result = await getAllProjects();

    expect(result).toHaveLength(2);
    
    const activeProjects = result.filter(p => p.is_active);
    const inactiveProjects = result.filter(p => !p.is_active);
    
    expect(activeProjects).toHaveLength(1);
    expect(inactiveProjects).toHaveLength(1);
    
    expect(activeProjects[0].title).toEqual('Active Project');
    expect(inactiveProjects[0].title).toEqual('Inactive Project');
  });

  it('should maintain correct order with mixed active status', async () => {
    // Create projects with order_index not matching insertion order
    await db.insert(projectsTable).values([
      {
        title: 'Last Order',
        description: 'Should be last',
        image_url: null,
        order_index: 10,
        is_active: false
      },
      {
        title: 'First Order',
        description: 'Should be first',
        image_url: null,
        order_index: 1,
        is_active: true
      },
      {
        title: 'Middle Order',
        description: 'Should be middle',
        image_url: null,
        order_index: 5,
        is_active: false
      }
    ]).execute();

    const result = await getAllProjects();

    expect(result).toHaveLength(3);
    expect(result[0].title).toEqual('First Order');
    expect(result[0].order_index).toEqual(1);
    expect(result[1].title).toEqual('Middle Order');
    expect(result[1].order_index).toEqual(5);
    expect(result[2].title).toEqual('Last Order');
    expect(result[2].order_index).toEqual(10);
  });
});

describe('getProjects vs getAllProjects comparison', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should show difference between public and admin views', async () => {
    // Create mixed active/inactive projects
    await db.insert(projectsTable).values([
      {
        title: 'Public Project 1',
        description: 'Visible to public',
        image_url: null,
        order_index: 0,
        is_active: true
      },
      {
        title: 'Draft Project',
        description: 'Not ready for public',
        image_url: null,
        order_index: 1,
        is_active: false
      },
      {
        title: 'Public Project 2',
        description: 'Also visible to public',
        image_url: null,
        order_index: 2,
        is_active: true
      }
    ]).execute();

    const publicProjects = await getProjects();
    const adminProjects = await getAllProjects();

    // Public view should only show active projects
    expect(publicProjects).toHaveLength(2);
    expect(publicProjects.every(p => p.is_active)).toBe(true);

    // Admin view should show all projects
    expect(adminProjects).toHaveLength(3);
    expect(adminProjects.filter(p => p.is_active)).toHaveLength(2);
    expect(adminProjects.filter(p => !p.is_active)).toHaveLength(1);

    // Both should maintain proper ordering
    expect(publicProjects[0].title).toEqual('Public Project 1');
    expect(publicProjects[1].title).toEqual('Public Project 2');
    
    expect(adminProjects[0].title).toEqual('Public Project 1');
    expect(adminProjects[1].title).toEqual('Draft Project');
    expect(adminProjects[2].title).toEqual('Public Project 2');
  });
});