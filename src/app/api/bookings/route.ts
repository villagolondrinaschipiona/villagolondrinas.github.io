import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

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

        // 1. Save to database
        const newBooking = await prisma.booking.create({
            data: bookingData
        });

        // 2. Send Email Notification
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
                to: 'villagolondrinaschipiona@gmail.com',
                subject: `Nueva Solicitud de Reserva - ${bookingData.name}`,
                html: `
                    <h2>Nueva solicitud recibida en Villa Golondrinas</h2>
                    <p><strong>Huésped:</strong> ${bookingData.name}</p>
                    <p><strong>Email:</strong> ${bookingData.email}</p>
                    <p><strong>Llegada:</strong> ${bookingData.checkIn}</p>
                    <p><strong>Salida:</strong> ${bookingData.checkOut}</p>
                    <p><strong>Personas:</strong> ${bookingData.guests}</p>
                    <p><strong>Mensaje:</strong> ${bookingData.message || 'Sin observaciones'}</p>
                    <br>
                    <p>Accede al panel de administración para ACEPTAR o CANCELAR esta reserva.</p>
                `
            };

            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error('Email failed to send, but booking was saved:', emailError);
            // We don't throw, we still want to return success for the booking.
        }

        return NextResponse.json({ success: true, booking: newBooking });
    } catch (error) {
        console.error('Failed to create booking:', error);
        return NextResponse.json({ success: false, error: 'Failed to create booking' }, { status: 500 });
    }
}
