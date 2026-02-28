'use client';

import { useState, useEffect } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { es } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import { Send, Loader2 } from 'lucide-react';

export default function BookPage() {
    const [range, setRange] = useState<DateRange | undefined>();
    const [blockedDates, setBlockedDates] = useState<Date[]>([]);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [guests, setGuests] = useState('2');
    const [message, setMessage] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formError, setFormError] = useState('');

    // Fetch blocked dates
    useEffect(() => {
        fetch('/api/blocked-dates')
            .then(res => res.json())
            .then((dates: string[]) => {
                // Convert strings to Date objects
                setBlockedDates(dates.map(d => new Date(d + 'T00:00:00')));
            })
            .catch(err => {
                console.error("Failed to load dates", err);
                setFetchError('Error al cargar disponibilidad.');
            });
    }, []);

    // Is a specific date blocked?
    const isDateBlocked = (date: Date) => {
        return blockedDates.some(blocked =>
            blocked.getFullYear() === date.getFullYear() &&
            blocked.getMonth() === date.getMonth() &&
            blocked.getDate() === date.getDate()
        );
    };

    const isRangeBlocked = (start?: Date, end?: Date) => {
        if (!start || !end) return false;
        let curr = new Date(start);
        while (curr <= end) {
            if (isDateBlocked(curr)) return true;
            curr.setDate(curr.getDate() + 1);
        }
        return false;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (!range?.from || !range?.to) {
            setFormError('Por favor, selecciona fechas de llegada y salida.');
            return;
        }

        if (isRangeBlocked(range.from, range.to)) {
            setFormError('El rango seleccionado incluye fechas no disponibles.');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    guests: parseInt(guests),
                    message,
                    checkIn: range.from.toISOString().split('T')[0],
                    checkOut: range.to.toISOString().split('T')[0]
                }),
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(true);
            } else {
                setFormError(data.error || 'Error al enviar la solicitud.');
            }
        } catch (err) {
            setFormError('Error de conexión.');
        } finally {
            setIsLoading(false);
        }
    };

    // Custom styling for calendar
    const css = `
    .rdp { --rdp-accent-color: #d4af37; --rdp-background-color: #fefce8; margin: 0; }
    .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover { color: white; background-color: var(--rdp-accent-color); font-weight: bold; }
    .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #f3f4f6; }
    .rdp-day_disabled { text-decoration: line-through; color: #9ca3af; }
  `;

    return (
        <div className="bg-[#f9f9f9] min-h-screen flex flex-col">
            <style>{css}</style>

            {/* Header */}
            <header className="bg-[#2c3e50] text-white py-16 text-center animate-fade-in pt-32">
                <h1 className="text-4xl md:text-5xl heading-font font-medium mb-4">Planifica tu Estancia</h1>
                <p className="text-gray-300 font-light text-lg max-w-2xl mx-auto px-4">Selecciona las fechas de tu viaje y envíanos una solicitud de reserva.</p>
            </header>

            {/* Booking Section */}
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
                {success ? (
                    <div className="bg-white p-12 rounded-xl shadow-xl text-center border border-gray-100 max-w-2xl mx-auto animate-fade-in">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Send className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-3xl heading-font font-medium text-[#2c3e50] mb-4">Solicitud Enviada</h2>
                        <p className="text-gray-600 mb-8">
                            Hemos recibido tu petición para las fechas seleccionadas. Nos pondremos en contacto contigo en breve al correo <strong>{email}</strong> para confirmar disponibilidad.
                        </p>
                        <button onClick={() => window.location.reload()} className="text-[#d4af37] border border-[#d4af37] hover:bg-[#d4af37] hover:text-white px-6 py-2 rounded transition">
                            Hacer otra solicitud
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col lg:flex-row border border-gray-100">

                        {/* Calendar Side */}
                        <div className="w-full lg:w-1/2 p-4 sm:p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white flex flex-col items-center">
                            <div className="w-full mb-6">
                                <h2 className="text-2xl heading-font font-medium text-[#2c3e50]">Selecciona tus fechas</h2>
                                {fetchError && <p className="text-red-500 text-sm mt-2">{fetchError}</p>}
                            </div>

                            <div className="overflow-x-auto w-full flex justify-center pb-4">
                                <DayPicker
                                    mode="range"
                                    selected={range}
                                    onSelect={setRange}
                                    disabled={[{ before: new Date() }, ...blockedDates]}
                                    locale={es}
                                    numberOfMonths={1}
                                    className="bg-white border rounded-lg p-4 shadow-sm"
                                />
                            </div>

                            {/* Legend */}
                            <div className="mt-8 flex gap-6 text-sm text-gray-500 font-light w-full justify-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#d4af37]"></div> Seleccionado
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gray-200"></div> No Disponible
                                </div>
                            </div>
                        </div>

                        {/* Form Side */}
                        <div className="w-full lg:w-1/2 p-8 lg:p-12 bg-gray-50/50">
                            <h2 className="text-2xl heading-font font-medium text-[#2c3e50] mb-8">Detalles de la Solicitud</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6 mb-8 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Llegada</label>
                                        <div className="text-lg text-[#2c3e50] font-medium">
                                            {range?.from ? range.from.toLocaleDateString('es-ES') : '-- / -- / ----'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Salida</label>
                                        <div className="text-lg text-[#2c3e50] font-medium">
                                            {range?.to ? range.to.toLocaleDateString('es-ES') : '-- / -- / ----'}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                    <input
                                        type="text" required value={name} onChange={e => setName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition outline-none"
                                        placeholder="Ej. Juan Pérez"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                                    <input
                                        type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition outline-none"
                                        placeholder="juan@ejemplo.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Huéspedes</label>
                                    <select
                                        value={guests} onChange={e => setGuests(e.target.value)}
                                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition outline-none bg-white"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                            <option key={n} value={n}>{n} Huésped{n > 1 ? 'es' : ''}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje (Opcional)</label>
                                    <textarea
                                        rows={3} value={message} onChange={e => setMessage(e.target.value)}
                                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition outline-none resize-none"
                                        placeholder="Peticiones especiales..."
                                    ></textarea>
                                </div>

                                {formError && (
                                    <div className="text-red-500 text-sm mt-2 font-medium bg-red-50 p-3 rounded border border-red-100">
                                        {formError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-[#2c3e50] hover:bg-gray-800 text-white font-medium py-4 rounded-sm transition uppercase tracking-widest text-sm flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
                                    ) : (
                                        <>Solicitar Prereserva <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
