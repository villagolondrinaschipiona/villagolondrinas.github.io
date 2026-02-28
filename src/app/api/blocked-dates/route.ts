import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const content = await prisma.siteContent.findUnique({
            where: { id: 'main' },
            select: { blockedDates: true }
        });

        const manualBlockedDates = (content?.blockedDates as string[]) || [];

        const acceptedBookings = await prisma.booking.findMany({
            where: { status: 'ACCEPTED' },
            select: { checkIn: true, checkOut: true }
        });

        let dates = new Set<string>(manualBlockedDates);

        acceptedBookings.forEach(b => {
            let curr = new Date(b.checkIn + 'T00:00:00');
            const end = new Date(b.checkOut + 'T00:00:00');
            while (curr <= end) {
                dates.add(curr.toISOString().split('T')[0]);
                curr.setDate(curr.getDate() + 1);
            }
        });

        return NextResponse.json(Array.from(dates));
    } catch (error) {
        console.error('Failed to get blocked dates:', error);
        return NextResponse.json([], { status: 500 });
    }
}
