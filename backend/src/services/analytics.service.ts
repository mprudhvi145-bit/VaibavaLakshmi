
import { EntityManager } from "typeorm";
import { AnalyticsEvent } from "../models/analytics-event";

export class AnalyticsService {
  private manager: EntityManager;

  constructor(container: any) {
    this.manager = container.manager;
  }

  async track(eventType: string, payload: string, userId?: string) {
    // Fire and forget (don't await) in route, but await here for logic
    const event = this.manager.create(AnalyticsEvent, {
      event_type: eventType,
      payload,
      user_id: userId
    });
    await this.manager.save(event);
  }

  async getDashboardStats() {
    // Simple aggregations
    const searches = await this.manager.count(AnalyticsEvent, { where: { event_type: 'search' } });
    const views = await this.manager.count(AnalyticsEvent, { where: { event_type: 'pdp_view' } });
    const carts = await this.manager.count(AnalyticsEvent, { where: { event_type: 'add_to_cart' } });
    
    // Top Searches
    const topSearchesRaw = await this.manager.query(`
      SELECT payload, COUNT(*) as count 
      FROM analytics_event 
      WHERE event_type = 'search' 
      GROUP BY payload 
      ORDER BY count DESC 
      LIMIT 5
    `);

    // Top Products
    const topProductsRaw = await this.manager.query(`
      SELECT payload, COUNT(*) as count 
      FROM analytics_event 
      WHERE event_type = 'pdp_view' 
      GROUP BY payload 
      ORDER BY count DESC 
      LIMIT 5
    `);

    return {
      overview: { searches, views, carts },
      topSearches: topSearchesRaw,
      topProducts: topProductsRaw
    };
  }
}
