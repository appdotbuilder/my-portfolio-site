import { type Project } from '../schema';

export async function getProjects(): Promise<Project[]> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to fetch all active projects from the database,
    // ordered by order_index for display on the Projects page.
    // Only returns projects where is_active = true for public display.
    return Promise.resolve([]);
}

export async function getAllProjects(): Promise<Project[]> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to fetch all projects (active and inactive)
    // for admin panel management, ordered by order_index.
    // Requires admin authentication.
    return Promise.resolve([]);
}