import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
    try {
        let content = await prisma.siteContent.findUnique({
            where: { id: 'main' }
        });

        if (!content) {
            // Create default if it doesn't exist
            content = await prisma.siteContent.create({
                data: { id: 'main' }
            });
        }

        return NextResponse.json(content);
    } catch (error) {
        console.error('Error fetching content:', error);
        return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Ensure JSON fields are parsed correctly if sent as array
        const updateData: any = { ...data };

        if (updateData.galleryImages) {
            updateData.galleryImages = updateData.galleryImages as Prisma.InputJsonValue;
        }
        if (updateData.blockedDates) {
            updateData.blockedDates = updateData.blockedDates as Prisma.InputJsonValue;
        }

        const updated = await prisma.siteContent.upsert({
            where: { id: 'main' },
            update: updateData,
            create: { id: 'main', ...updateData }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error saving content:', error);
        return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
    }
}
