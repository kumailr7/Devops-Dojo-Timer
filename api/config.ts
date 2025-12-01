import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    if (request.method === 'GET') {
      const { userId } = request.query;
      
      if (!userId || typeof userId !== 'string') {
        return response.status(400).json({ error: 'User ID required' });
      }

      const rows = await sql`
        SELECT * FROM user_config 
        WHERE user_id = ${userId}
      `;

      if (rows.length === 0) {
        // Return default config
        return response.status(200).json({
          timers: { focus: 1500, short_break: 300, long_break: 900, custom: 1200 },
          featureFlags: { experimentalAI: true, slackIntegration: false, plannerIntegration: true }
        });
      }

      return response.status(200).json({
        timers: rows[0].timers,
        featureFlags: rows[0].feature_flags
      });
    }

    if (request.method === 'PUT') {
      const { userId, config } = request.body;

      if (!userId || !config) {
        return response.status(400).json({ error: 'Missing required fields' });
      }

      const rows = await sql`
        INSERT INTO user_config (user_id, timers, feature_flags)
        VALUES (${userId}, ${JSON.stringify(config.timers)}, ${JSON.stringify(config.featureFlags)})
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          timers = ${JSON.stringify(config.timers)},
          feature_flags = ${JSON.stringify(config.featureFlags)},
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      return response.status(200).json({
        timers: rows[0].timers,
        featureFlags: rows[0].feature_flags
      });
    }

    return response.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}

