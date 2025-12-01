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
        SELECT * FROM session_logs 
        WHERE user_id = ${userId}
        ORDER BY timestamp DESC
        LIMIT 100
      `;

      return response.status(200).json(rows);
    }

    if (request.method === 'POST') {
      const { userId, session } = request.body;

      if (!userId || !session) {
        return response.status(400).json({ error: 'Missing required fields' });
      }

      await sql`
        INSERT INTO users (id, email)
        VALUES (${userId}, ${session.email || 'unknown'})
        ON CONFLICT (id) DO NOTHING
      `;

      const rows = await sql`
        INSERT INTO session_logs (
          id, user_id, timestamp, duration_seconds, 
          mode, session_label, topic, tags
        )
        VALUES (
          ${session.id}, ${userId}, ${session.timestamp}, 
          ${session.durationSeconds}, ${session.mode}, 
          ${session.sessionLabel || null}, ${session.topic}, 
          ${JSON.stringify(session.tags || [])}
        )
        RETURNING *
      `;

      return response.status(201).json(rows[0]);
    }

    return response.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}

