import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const body = await request.json();

        if (!body.status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const updated = await prisma.booking.update({
            where: { id },
            data: { status: body.status }
        });

        // Send custom email if provided
        if (body.customEmailMessage && updated.email) {
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
                    to: updated.email,
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

        await prisma.booking.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
    }
}
