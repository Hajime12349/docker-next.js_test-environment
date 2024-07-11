import { query } from '../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    try {
        const { rows } = await query('SELECT * FROM tasks ORDER BY id ASC');
        return new Response(JSON.stringify(rows), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch tasks' }), { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    // check if session is not null
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized: session does not exist' }), { status: 401 });
    }
    if (!session.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized: session user does not exist' }), { status: 401 });
    }
    if (!("id" in session.user)) {
        return new Response(JSON.stringify({ error: 'Unauthorized: session user does not have an id' }), { status: 401 });
    }
    const session_user_id = session.user.id;
    const { user_id, task_name, deadline, total_set, current_set, is_complete } = await req.json();

    // check if user_id is same as session.user.id
    if (user_id !== session_user_id) {
        return new Response(JSON.stringify({ error: 'Unauthorized: the requested user does not match the session user' }), { status: 401 });
    }

    try {
        const { rows } = await query('INSERT INTO tasks (user_id, task_name, deadline, total_set, current_set, is_complete) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [user_id, task_name, deadline, total_set, current_set, is_complete]);
        return new Response(JSON.stringify(rows[0]), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to add task' }), { status: 500 });
    }
}
