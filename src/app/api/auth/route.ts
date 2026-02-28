import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { username, password, action } = await request.json();

        const cookieStore = await cookies();

        if (action === 'logout') {
            cookieStore.delete('admin_session');
            return NextResponse.json({ success: true });
        }

        if (username === 'JCMartin' && password === '52336170_S') {
            // Set a simple cookie
            cookieStore.set({
                name: 'admin_session',
                value: 'authenticated',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Bad request' }, { status: 400 });
    }
}
