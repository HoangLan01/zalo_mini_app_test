import cron from 'node-cron';
import { prisma } from '../server';
import { getOAArticles, getOAArticleDetail } from '../services/zaloOA.service';
import logger from '../utils/logger';

export const syncOAArticles = async () => {
  logger.info('Starting OA Articles sync job...');
  try {
    const limit = 10; // Zalo OA API max limit is 10
    let offset = 0;
    let allItems: any[] = [];
    
    // Fetch up to 3 pages (30 articles max)
    for (let page = 0; page < 3; page++) {
      const oaData = await getOAArticles(offset, limit);
      
      // Debug: Log raw API response
      logger.info(`OA API Response (page ${page}): error=${oaData?.error}, medias=${oaData?.data?.medias?.length || 0}`);
      
      // Zalo OA API trả về data.medias (không phải data.items)
      const mediaItems = oaData?.data?.medias;
      
      if (!oaData || oaData.error !== 0 || !mediaItems || mediaItems.length === 0) {
        if (page === 0) {
          logger.warn(`Sync job: No articles returned. Error code: ${oaData?.error}, Message: ${oaData?.message}`);
        }
        break; // No more articles
      }
      
      allItems = allItems.concat(mediaItems);
      offset += limit;
      
      // If we got fewer items than limit, we've reached the end
      if (mediaItems.length < limit) break;
    }
    
    if (allItems.length === 0) {
      logger.warn('Sync job: No articles to process after fetching all pages.');
      return;
    }

    const items = allItems;
    let syncedCount = 0;

    for (const item of items) {
      // Log first item structure for debugging
      if (syncedCount === 0) {
        logger.info(`First article sample: ${JSON.stringify(item).substring(0, 300)}`);
      }
      
      // Check if article already exists
      const existing = await prisma.article.findUnique({ where: { id: item.id } });
      
      if (existing) {
        await prisma.article.update({
          where: { id: item.id },
          data: {
            title: item.title,
            description: item.description || '',
            thumbnailUrl: item.cover?.photo_url || item.thumb || existing.thumbnailUrl,
          }
        });
        continue;
      }

      // If new article, we must fetch details to get the full HTML content
      const detailData = await getOAArticleDetail(item.id);
      
      let contentHtml = '';
      if (detailData && detailData.error === 0 && detailData.data) {
        const detailItem = detailData.data;
        if (Array.isArray(detailItem.body)) {
          contentHtml = detailItem.body.map((block: any) => {
            if (block.type === 'text') return `<p>${block.content}</p>`;
            if (block.type === 'image') return `<img src="${block.url}" alt="${block.caption || ''}" style="width:100%; border-radius: 8px; margin: 10px 0;" />`;
            if (block.type === 'video') return `<video src="${block.url}" controls style="width:100%; margin: 10px 0;"></video>`;
            return '';
          }).join('');
        }
      }

      // Zalo trả về create_date (milliseconds timestamp)
      const publishedDate = item.create_date ? new Date(Number(item.create_date)) : new Date();

      await prisma.article.create({
        data: {
          id: item.id,
          title: item.title,
          description: item.description || '',
          content: contentHtml || item.description || '',
          thumbnailUrl: item.cover?.photo_url || item.thumb || 'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?w=800',
          category: 'Tin tức', // Default category
          publishedAt: publishedDate,
          author: item.author || 'Admin'
        }
      });
      syncedCount++;
    }

    logger.info(`OA Articles sync completed. Total: ${items.length}, Added: ${syncedCount} new articles.`);
  } catch (error) {
    logger.error('Error during OA Articles sync job:', error);
  }
};

export const startSyncNewsJob = () => {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', () => {
    syncOAArticles();
  });
  
  // Also run once immediately on startup
  setTimeout(() => {
    syncOAArticles();
  }, 5000); // Wait 5 seconds after startup
};
