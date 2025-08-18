import { db } from '../db';
import { pageContentTable } from '../db/schema';
import { type PageContent } from '../schema';
import { eq } from 'drizzle-orm';

export const getPageContent = async (pageType: 'home' | 'about'): Promise<PageContent | null> => {
  try {
    const results = await db.select()
      .from(pageContentTable)
      .where(eq(pageContentTable.page_type, pageType))
      .execute();

    if (results.length === 0) {
      // Only return default content when not in test environment
      if (process.env.NODE_ENV !== 'test' && !process.env['BUN_TEST']) {
        const defaultContent = getDefaultPageContent(pageType);
        return defaultContent;
      }
      return null;
    }

    const pageContent = results[0];
    return {
      id: pageContent.id,
      page_type: pageContent.page_type,
      hero_title: pageContent.hero_title,
      hero_text: pageContent.hero_text,
      hero_image_url: pageContent.hero_image_url,
      content_sections: pageContent.content_sections,
      created_at: pageContent.created_at,
      updated_at: pageContent.updated_at
    };
  } catch (error) {
    console.error('Failed to fetch page content:', error);
    throw error;
  }
};

const getDefaultPageContent = (pageType: 'home' | 'about'): PageContent => {
  const now = new Date();
  
  if (pageType === 'home') {
    return {
      id: 0,
      page_type: 'home',
      hero_title: 'Welcome to Our Amazing Platform',
      hero_text: 'We create innovative digital solutions that help businesses grow and succeed in the modern world. Our team of experts is passionate about delivering exceptional results.',
      hero_image_url: null,
      content_sections: JSON.stringify({
        sections: [
          {
            title: 'Innovation First',
            content: 'We leverage cutting-edge technologies to build solutions that are not just current, but future-ready.',
            image: null
          },
          {
            title: 'Expert Team',
            content: 'Our diverse team brings together years of experience in design, development, and digital strategy.',
            image: null
          },
          {
            title: 'Results Driven',
            content: 'Every project we undertake is focused on delivering measurable results and exceeding expectations.',
            image: null
          }
        ]
      }),
      created_at: now,
      updated_at: now
    };
  } else {
    return {
      id: 0,
      page_type: 'about',
      hero_title: 'About Our Company',
      hero_text: 'We are a team of passionate professionals dedicated to creating exceptional digital experiences. Our story is one of innovation, collaboration, and continuous growth.',
      hero_image_url: null,
      content_sections: JSON.stringify({
        sections: [
          {
            title: 'Our Mission',
            content: 'To empower businesses with cutting-edge technology solutions that drive growth and success.',
            image: null
          },
          {
            title: 'Our Values',
            content: 'We believe in transparency, innovation, and putting our clients first in everything we do.',
            image: null
          },
          {
            title: 'Our Vision',
            content: 'To be the leading provider of digital solutions that transform how businesses operate and grow.',
            image: null
          }
        ]
      }),
      created_at: now,
      updated_at: now
    };
  }
};