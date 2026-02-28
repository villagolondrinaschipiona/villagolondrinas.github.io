import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const bookings = await prisma.booking.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(bookings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const bookingData = await request.json();

        const newBooking = await prisma.booking.create({
            data: bookingData
        });

        return NextResponse.json({ success: true, booking: newBooking });
    } catch (error) {
        console.error('Failed to create booking:', error);
        return NextResponse.json({ success: false, error: 'Failed to create booking' }, { status: 500 });
    }
}
