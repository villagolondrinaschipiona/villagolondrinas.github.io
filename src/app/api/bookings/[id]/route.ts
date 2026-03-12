import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { Booking } from "@prisma/client";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const body = await request.json();

        if (!body.status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const updateData: any = { status: body.status };
        if (body.finalPrice !== undefined) {
            // Overwrite the original estimated price so the admin dashboard shows the final amount agreed upon.
            updateData.estimatedPrice = body.finalPrice;
        }

        let updated: Booking | null = null;
        let retries = 3;
        while (retries > 0) {
            try {
                const booking = await prisma.booking.update({
  where: { id },
  data: { status }
});;

if (status === "ACCEPTED") {

  const siteContent = await prisma.siteContent.findUnique({
      where: { id: "main" }
    });

  const start = new Date(booking.checkIn);
  const end = new Date(booking.checkOut);

  let current = new Date(start);
  const newDates: string[] = [];

  while (current <= end) {

    newDates.push(current.toISOString().split("T")[0]);

    current.setDate(current.getDate() + 1);
  }

  await prisma.siteContent.update({
  where: { id: "main" },
  data: {
    blockedDates: [
      ...((siteContent?.blockedDates as string[]) || []),
      ...newDates
    ]
  }
});

}
if (status === "CANCELLED") {

  const siteContent = await prisma.siteContent.findUnique({
    where: { id: "main" }
  });

  const start = new Date(booking.checkIn);
  const end = new Date(booking.checkOut);

  let current = new Date(start);
  let datesToRemove: string[] = [];

  while (current <= end) {

    datesToRemove.push(current.toISOString().split("T")[0]);

    current.setDate(current.getDate() + 1);
  }

  const remainingDates = ((siteContent?.blockedDates as string[]) || [])
    .filter(d => !datesToRemove.includes(d));

  await prisma.siteContent.update({
    where: { id: "main" },
    data: {
      blockedDates: remainingDates
    }
  });

}                
                break;
            } catch (err: any) {
                retries--;
                if (retries === 0) throw err;
                console.warn(`Prisma update failed, retrying in ${4 - retries}s...`, err.message);
                await new Promise(resolve => setTimeout(resolve, (4 - retries) * 1000));
            }
        }

        if (!updated) {
            throw new Error('Failed to update booking');
        }

        // Send custom email if provided
        if (body.customEmailMessage && booking.email) {
            try {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: booking.email,
                    subject: `Actualización de Reserva - Villa Golondrinas`,
                    text: body.customEmailMessage
                };

                await transporter.sendMail(mailOptions);
            } catch (emailError) {
                console.error('Failed to send status email:', emailError);
            }
        }

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;

        let deleteRetries = 3;
        while (deleteRetries > 0) {
            try {
                await prisma.booking.delete({
                    where: { id }
                });
                break;
            } catch (err: any) {
                deleteRetries--;
                if (deleteRetries === 0) throw err;
                console.warn(`Prisma delete failed, retrying in ${4 - deleteRetries}s...`, err.message);
                await new Promise(resolve => setTimeout(resolve, (4 - deleteRetries) * 1000));
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
    }
}
