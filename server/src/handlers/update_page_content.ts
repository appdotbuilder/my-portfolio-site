import { db } from '../db';
import { pageContentTable } from '../db/schema';
import { type UpdatePageContentInput, type PageContent } from '../schema';
import { eq } from 'drizzle-orm';

export const updatePageContent = async (input: UpdatePageContentInput): Promise<PageContent> => {
  try {
    const now = new Date();

    // First, check if content already exists for this page type
    const existingContent = await db.select()
      .from(pageContentTable)
      .where(eq(pageContentTable.page_type, input.page_type))
      .execute();

    let result;

    if (existingContent.length > 0) {
      // Update existing content
      result = await db.update(pageContentTable)
        .set({
          hero_title: input.hero_title,
          hero_text: input.hero_text,
          hero_image_url: input.hero_image_url,
          content_sections: input.content_sections,
          updated_at: now
        })
        .where(eq(pageContentTable.page_type, input.page_type))
        .returning()
        .execute();
    } else {
      // Insert new content
      result = await db.insert(pageContentTable)
        .values({
          page_type: input.page_type,
          hero_title: input.hero_title,
          hero_text: input.hero_text,
          hero_image_url: input.hero_image_url,
          content_sections: input.content_sections,
          created_at: now,
          updated_at: now
        })
        .returning()
        .execute();
    }

    return result[0];
  } catch (error) {
    console.error('Page content update failed:', error);
    throw error;
  }
};