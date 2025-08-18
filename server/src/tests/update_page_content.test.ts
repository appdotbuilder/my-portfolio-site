import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pageContentTable } from '../db/schema';
import { type UpdatePageContentInput } from '../schema';
import { updatePageContent } from '../handlers/update_page_content';
import { eq } from 'drizzle-orm';

// Test input for home page
const homePageInput: UpdatePageContentInput = {
  page_type: 'home',
  hero_title: 'Welcome to Our Site',
  hero_text: 'This is the hero text for the home page',
  hero_image_url: 'https://example.com/hero-home.jpg',
  content_sections: JSON.stringify([
    { type: 'text', content: 'Main content section' },
    { type: 'image', url: 'https://example.com/section.jpg', alt: 'Section image' }
  ])
};

// Test input for about page
const aboutPageInput: UpdatePageContentInput = {
  page_type: 'about',
  hero_title: 'About Our Company',
  hero_text: 'Learn more about who we are',
  hero_image_url: null,
  content_sections: JSON.stringify([
    { type: 'text', content: 'About us content' },
    { type: 'text', content: 'Our mission statement' }
  ])
};

describe('updatePageContent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create new page content when none exists', async () => {
    const result = await updatePageContent(homePageInput);

    // Verify returned data
    expect(result.page_type).toEqual('home');
    expect(result.hero_title).toEqual('Welcome to Our Site');
    expect(result.hero_text).toEqual('This is the hero text for the home page');
    expect(result.hero_image_url).toEqual('https://example.com/hero-home.jpg');
    expect(result.content_sections).toEqual(homePageInput.content_sections);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save new page content to database', async () => {
    const result = await updatePageContent(homePageInput);

    // Query database to verify content was saved
    const savedContent = await db.select()
      .from(pageContentTable)
      .where(eq(pageContentTable.id, result.id))
      .execute();

    expect(savedContent).toHaveLength(1);
    expect(savedContent[0].page_type).toEqual('home');
    expect(savedContent[0].hero_title).toEqual('Welcome to Our Site');
    expect(savedContent[0].hero_text).toEqual('This is the hero text for the home page');
    expect(savedContent[0].hero_image_url).toEqual('https://example.com/hero-home.jpg');
    expect(savedContent[0].content_sections).toEqual(homePageInput.content_sections);
    expect(savedContent[0].created_at).toBeInstanceOf(Date);
    expect(savedContent[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update existing page content', async () => {
    // First, create initial content
    const initialResult = await updatePageContent(homePageInput);
    const initialId = initialResult.id;
    const initialCreatedAt = initialResult.created_at;

    // Wait a moment to ensure updated_at will be different
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update with new content
    const updatedInput: UpdatePageContentInput = {
      page_type: 'home',
      hero_title: 'Updated Welcome Title',
      hero_text: 'Updated hero text',
      hero_image_url: 'https://example.com/new-hero.jpg',
      content_sections: JSON.stringify([
        { type: 'text', content: 'Updated main content' }
      ])
    };

    const updateResult = await updatePageContent(updatedInput);

    // Verify the update
    expect(updateResult.id).toEqual(initialId); // Should be same ID
    expect(updateResult.page_type).toEqual('home');
    expect(updateResult.hero_title).toEqual('Updated Welcome Title');
    expect(updateResult.hero_text).toEqual('Updated hero text');
    expect(updateResult.hero_image_url).toEqual('https://example.com/new-hero.jpg');
    expect(updateResult.content_sections).toEqual(updatedInput.content_sections);
    expect(updateResult.created_at).toEqual(initialCreatedAt); // Should remain same
    expect(updateResult.updated_at > initialCreatedAt).toBe(true); // Should be updated
  });

  it('should verify database reflects the update', async () => {
    // Create initial content
    await updatePageContent(homePageInput);

    // Update content
    const updatedInput: UpdatePageContentInput = {
      page_type: 'home',
      hero_title: 'Database Test Title',
      hero_text: 'Database test text',
      hero_image_url: null,
      content_sections: JSON.stringify([{ type: 'text', content: 'Test content' }])
    };

    const updateResult = await updatePageContent(updatedInput);

    // Query database to verify update
    const dbContent = await db.select()
      .from(pageContentTable)
      .where(eq(pageContentTable.page_type, 'home'))
      .execute();

    expect(dbContent).toHaveLength(1);
    expect(dbContent[0].id).toEqual(updateResult.id);
    expect(dbContent[0].hero_title).toEqual('Database Test Title');
    expect(dbContent[0].hero_text).toEqual('Database test text');
    expect(dbContent[0].hero_image_url).toBeNull();
    expect(dbContent[0].content_sections).toEqual(updatedInput.content_sections);
  });

  it('should handle null hero_image_url correctly', async () => {
    const result = await updatePageContent(aboutPageInput);

    expect(result.hero_image_url).toBeNull();
    expect(result.page_type).toEqual('about');
    expect(result.hero_title).toEqual('About Our Company');

    // Verify in database
    const dbContent = await db.select()
      .from(pageContentTable)
      .where(eq(pageContentTable.page_type, 'about'))
      .execute();

    expect(dbContent[0].hero_image_url).toBeNull();
  });

  it('should handle different page types independently', async () => {
    // Create content for both page types
    const homeResult = await updatePageContent(homePageInput);
    const aboutResult = await updatePageContent(aboutPageInput);

    // Verify they are separate records
    expect(homeResult.id).not.toEqual(aboutResult.id);
    expect(homeResult.page_type).toEqual('home');
    expect(aboutResult.page_type).toEqual('about');

    // Verify both exist in database
    const allContent = await db.select()
      .from(pageContentTable)
      .execute();

    expect(allContent).toHaveLength(2);

    const homeContent = allContent.find(c => c.page_type === 'home');
    const aboutContent = allContent.find(c => c.page_type === 'about');

    expect(homeContent).toBeDefined();
    expect(aboutContent).toBeDefined();
    expect(homeContent!.hero_title).toEqual('Welcome to Our Site');
    expect(aboutContent!.hero_title).toEqual('About Our Company');
  });

  it('should update only the specified page type', async () => {
    // Create content for both page types
    await updatePageContent(homePageInput);
    await updatePageContent(aboutPageInput);

    // Update only home page
    const updatedHomeInput: UpdatePageContentInput = {
      page_type: 'home',
      hero_title: 'Updated Home Title',
      hero_text: 'Updated home text',
      hero_image_url: 'https://example.com/updated-home.jpg',
      content_sections: JSON.stringify([{ type: 'text', content: 'Updated home content' }])
    };

    await updatePageContent(updatedHomeInput);

    // Verify home page was updated
    const homeContent = await db.select()
      .from(pageContentTable)
      .where(eq(pageContentTable.page_type, 'home'))
      .execute();

    expect(homeContent[0].hero_title).toEqual('Updated Home Title');

    // Verify about page was not affected
    const aboutContent = await db.select()
      .from(pageContentTable)
      .where(eq(pageContentTable.page_type, 'about'))
      .execute();

    expect(aboutContent[0].hero_title).toEqual('About Our Company'); // Should remain unchanged
  });

  it('should handle complex JSON content_sections', async () => {
    const complexContentSections = JSON.stringify([
      {
        type: 'hero',
        title: 'Main Hero',
        subtitle: 'Secondary text',
        backgroundImage: 'https://example.com/bg.jpg'
      },
      {
        type: 'textBlock',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        alignment: 'center'
      },
      {
        type: 'imageGallery',
        images: [
          { url: 'https://example.com/img1.jpg', caption: 'Image 1' },
          { url: 'https://example.com/img2.jpg', caption: 'Image 2' }
        ]
      },
      {
        type: 'callToAction',
        text: 'Contact us today!',
        buttonText: 'Get Started',
        buttonUrl: '/contact'
      }
    ]);

    const complexInput: UpdatePageContentInput = {
      page_type: 'home',
      hero_title: 'Complex Content Test',
      hero_text: 'Testing complex content sections',
      hero_image_url: 'https://example.com/complex-hero.jpg',
      content_sections: complexContentSections
    };

    const result = await updatePageContent(complexInput);

    expect(result.content_sections).toEqual(complexContentSections);

    // Verify JSON parsing works
    const parsedSections = JSON.parse(result.content_sections);
    expect(parsedSections).toHaveLength(4);
    expect(parsedSections[0].type).toEqual('hero');
    expect(parsedSections[2].type).toEqual('imageGallery');
    expect(parsedSections[2].images).toHaveLength(2);
  });
});