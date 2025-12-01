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
        SELECT * FROM tasks 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;

      return response.status(200).json(rows);
    }

    if (request.method === 'POST') {
      const { userId, task } = request.body;

      if (!userId || !task) {
        return response.status(400).json({ error: 'Missing required fields' });
      }

      const rows = await sql`
        INSERT INTO tasks (
          id, user_id, title, description, status, 
          priority, due_date, tags
        )
        VALUES (
          ${task.id}, ${userId}, ${task.title}, 
          ${task.description || null}, ${task.status},
          ${task.priority || null}, ${task.dueDate || null},
          ${JSON.stringify(task.tags || [])}
        )
        RETURNING *
      `;

      return response.status(201).json(rows[0]);
    }

    if (request.method === 'PUT') {
      const { userId, task } = request.body;
      const { id } = request.query;

      if (!userId || !id || !task || typeof id !== 'string') {
        return response.status(400).json({ error: 'Missing required fields' });
      }

      const rows = await sql`
        UPDATE tasks 
        SET 
          title = ${task.title},
          description = ${task.description || null},
          status = ${task.status},
          priority = ${task.priority || null},
          due_date = ${task.dueDate || null},
          tags = ${JSON.stringify(task.tags || [])},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING *
      `;

      return response.status(200).json(rows[0]);
    }

    if (request.method === 'DELETE') {
      const { userId, id } = request.query;

      if (!userId || !id || typeof id !== 'string' || typeof userId !== 'string') {
        return response.status(400).json({ error: 'Missing required fields' });
      }

      await sql`
        DELETE FROM tasks 
        WHERE id = ${id} AND user_id = ${userId}
      `;

      return response.status(200).json({ success: true });
    }

    return response.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}

