import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pageContentTable } from '../db/schema';
import { getPageContent } from '../handlers/get_page_content';

describe('getPageContent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when no page content exists', async () => {
    const result = await getPageContent('home');
    expect(result).toBeNull();
  });

  it('should return page content for home page', async () => {
    // Create test page content
    const testContent = {
      page_type: 'home' as const,
      hero_title: 'Welcome to Our Site',
      hero_text: 'This is the hero text for the home page',
      hero_image_url: 'https://example.com/hero.jpg',
      content_sections: JSON.stringify([
        { type: 'text', content: 'This is a text section' },
        { type: 'image', src: 'https://example.com/image.jpg' }
      ])
    };

    await db.insert(pageContentTable)
      .values(testContent)
      .execute();

    const result = await getPageContent('home');

    expect(result).not.toBeNull();
    expect(result?.page_type).toEqual('home');
    expect(result?.hero_title).toEqual('Welcome to Our Site');
    expect(result?.hero_text).toEqual('This is the hero text for the home page');
    expect(result?.hero_image_url).toEqual('https://example.com/hero.jpg');
    expect(result?.content_sections).toEqual(testContent.content_sections);
    expect(result?.id).toBeDefined();
    expect(result?.created_at).toBeInstanceOf(Date);
    expect(result?.updated_at).toBeInstanceOf(Date);
  });

  it('should return page content for about page', async () => {
    // Create test page content for about page
    const testContent = {
      page_type: 'about' as const,
      hero_title: 'About Our Company',
      hero_text: 'Learn more about what we do',
      hero_image_url: null, // Test null image URL
      content_sections: JSON.stringify([
        { type: 'text', content: 'Our company story...' }
      ])
    };

    await db.insert(pageContentTable)
      .values(testContent)
      .execute();

    const result = await getPageContent('about');

    expect(result).not.toBeNull();
    expect(result?.page_type).toEqual('about');
    expect(result?.hero_title).toEqual('About Our Company');
    expect(result?.hero_text).toEqual('Learn more about what we do');
    expect(result?.hero_image_url).toBeNull();
    expect(result?.content_sections).toEqual(testContent.content_sections);
    expect(result?.id).toBeDefined();
    expect(result?.created_at).toBeInstanceOf(Date);
    expect(result?.updated_at).toBeInstanceOf(Date);
  });

  it('should return correct page content when both home and about exist', async () => {
    // Create both home and about page content
    const homeContent = {
      page_type: 'home' as const,
      hero_title: 'Home Page Title',
      hero_text: 'Home page hero text',
      hero_image_url: 'https://example.com/home-hero.jpg',
      content_sections: JSON.stringify([{ type: 'text', content: 'Home content' }])
    };

    const aboutContent = {
      page_type: 'about' as const,
      hero_title: 'About Page Title',
      hero_text: 'About page hero text',
      hero_image_url: 'https://example.com/about-hero.jpg',
      content_sections: JSON.stringify([{ type: 'text', content: 'About content' }])
    };

    await db.insert(pageContentTable)
      .values([homeContent, aboutContent])
      .execute();

    // Test home page retrieval
    const homeResult = await getPageContent('home');
    expect(homeResult).not.toBeNull();
    expect(homeResult?.page_type).toEqual('home');
    expect(homeResult?.hero_title).toEqual('Home Page Title');

    // Test about page retrieval
    const aboutResult = await getPageContent('about');
    expect(aboutResult).not.toBeNull();
    expect(aboutResult?.page_type).toEqual('about');
    expect(aboutResult?.hero_title).toEqual('About Page Title');

    // Ensure they are different records
    expect(homeResult?.id).not.toEqual(aboutResult?.id);
  });

  it('should handle page content with complex JSON content sections', async () => {
    const complexContentSections = JSON.stringify([
      {
        type: 'hero',
        title: 'Main Hero',
        subtitle: 'Hero subtitle',
        backgroundImage: 'https://example.com/bg.jpg'
      },
      {
        type: 'features',
        items: [
          { title: 'Feature 1', description: 'First feature' },
          { title: 'Feature 2', description: 'Second feature' }
        ]
      },
      {
        type: 'testimonial',
        quote: 'Great service!',
        author: 'John Doe',
        position: 'CEO'
      }
    ]);

    const testContent = {
      page_type: 'home' as const,
      hero_title: 'Complex Content Page',
      hero_text: 'Page with complex content structure',
      hero_image_url: 'https://example.com/complex-hero.jpg',
      content_sections: complexContentSections
    };

    await db.insert(pageContentTable)
      .values(testContent)
      .execute();

    const result = await getPageContent('home');

    expect(result).not.toBeNull();
    expect(result?.content_sections).toEqual(complexContentSections);
    
    // Verify we can parse the JSON content
    const parsedContent = JSON.parse(result?.content_sections || '[]');
    expect(parsedContent).toHaveLength(3);
    expect(parsedContent[0].type).toEqual('hero');
    expect(parsedContent[1].items).toHaveLength(2);
    expect(parsedContent[2].author).toEqual('John Doe');
  });

  it('should return null for non-existent page type when other content exists', async () => {
    // Create only home content
    const homeContent = {
      page_type: 'home' as const,
      hero_title: 'Home Only',
      hero_text: 'Only home content exists',
      hero_image_url: null,
      content_sections: JSON.stringify([{ type: 'text', content: 'Home only' }])
    };

    await db.insert(pageContentTable)
      .values(homeContent)
      .execute();

    // Request about page (which doesn't exist)
    const aboutResult = await getPageContent('about');
    expect(aboutResult).toBeNull();

    // Verify home page still works
    const homeResult = await getPageContent('home');
    expect(homeResult).not.toBeNull();
    expect(homeResult?.page_type).toEqual('home');
  });
});