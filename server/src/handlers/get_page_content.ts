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