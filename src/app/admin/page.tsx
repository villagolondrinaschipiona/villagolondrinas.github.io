'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Image as ImageIcon, Calendar, LogOut, Check, X, Trash2, Loader2, Save } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'content' | 'images' | 'bookings'>('content');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // Data states
  const [content, setContent] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contentRes, bookingsRes] = await Promise.all([
        fetch('/api/content'),
        fetch('/api/bookings')
      ]);

      setContent(await contentRes.json());
      setBookings(await bookingsRes.json());
    } catch (e) {
      console.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' })
    });
    router.push('/admin/login');
    router.refresh();
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      alert('Cambios guardados correctamente.');
    } catch {
      alert('Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleBookingAction = async (id: string, status: string) => {
    if (!confirm(`¿Seguro que quieres cambiar el estado a ${status}?`)) return;

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchData(); // Refresh list
      }
    } catch (e) {
      alert('Error al actualizar reserva');
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('¿Eliminar permanentemente este registro?')) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (e) {
      alert('Error al eliminar');
    }
  };

  const handleAddBlockedDate = () => {
    if (!newBlockedDate) return;
    const current = content.blockedDates || [];
    if (!current.includes(newBlockedDate)) {
      setContent({ ...content, blockedDates: [...current, newBlockedDate].sort() });
      setNewBlockedDate('');
    } else {
      alert('Fecha ya bloqueada');
    }
  };

  const removeBlockedDate = (date: string) => {
    setContent({
      ...content,
      blockedDates: content.blockedDates.filter((d: string) => d !== date)
    });
  };

  const addGalleryImage = () => {
    setContent({
      ...content,
      galleryImages: [...(content.galleryImages || []), { url: '', title: '' }]
    });
  };

  const updateGalleryImage = (index: number, field: 'url' | 'title', value: string) => {
    const newGa = [...content.galleryImages];
    newGa[index][field] = value;
    setContent({ ...content, galleryImages: newGa });
  };

  const removeGalleryImage = (index: number) => {
    const newGa = [...content.galleryImages];
    newGa.splice(index, 1);
    setContent({ ...content, galleryImages: newGa });
  };

  if (loading || !content) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col sticky top-0 md:h-screen">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="heading-font text-xl font-bold text-[#2c3e50] tracking-wider">Panel Admin</h1>
            <p className="text-xs text-gray-500 mt-1">Gestión del Sitio</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => setActiveTab('content')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition text-left ${activeTab === 'content' ? 'bg-[#2c3e50] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> Textos Principales
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition text-left ${activeTab === 'images' ? 'bg-[#2c3e50] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <ImageIcon className="w-5 h-5" /> Imágenes y Galería
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition text-left ${activeTab === 'bookings' ? 'bg-[#2c3e50] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Calendar className="w-5 h-5" /> Reservas y Calendario
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Areas */}
      <main className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full">

        {/* TAB: CONTENT */}
        {activeTab === 'content' && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">Gestión de Textos</h2>
            <form onSubmit={handleSaveContent} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              {/* Hero Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 bg-gray-50 p-3 rounded border">Sección Principal (Hero)</h3>
                <div className="space-y-4 px-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pequeño titular (Tagline)</label>
                    <input type="text" className="w-full border p-2 rounded" value={content.heroTagline} onChange={e => setContent({ ...content, heroTagline: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título Principal (Soporta HTML)</label>
                    <input type="text" className="w-full border p-2 rounded font-mono text-sm" value={content.heroTitle} onChange={e => setContent({ ...content, heroTitle: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción corta</label>
                    <textarea className="w-full border p-2 rounded" rows={3} value={content.heroDescription} onChange={e => setContent({ ...content, heroDescription: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 bg-gray-50 p-3 rounded border">Sección "Nuestra Casa" (About)</h3>
                <div className="space-y-4 px-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título de la sección</label>
                    <input type="text" className="w-full border p-2 rounded" value={content.aboutTitle} onChange={e => setContent({ ...content, aboutTitle: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Introducción</label>
                    <textarea className="w-full border p-2 rounded" rows={3} value={content.aboutIntro} onChange={e => setContent({ ...content, aboutIntro: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Detalles extendidos</label>
                    <textarea className="w-full border p-2 rounded" rows={3} value={content.aboutDetails} onChange={e => setContent({ ...content, aboutDetails: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button type="submit" disabled={saving} className="bg-[#2c3e50] text-white px-6 py-2 rounded-md hover:bg-gray-800 transition flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar Textos
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB: IMAGES */}
        {activeTab === 'images' && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">Imágenes y Galería</h2>
            <form onSubmit={handleSaveContent} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Hero Image */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Fondo Principal (Hero)</h3>
                  <input type="url" className="w-full border p-2 rounded mb-2 text-sm" value={content.heroImage} onChange={e => setContent({ ...content, heroImage: e.target.value })} placeholder="URL de la imagen" />
                  <img src={content.heroImage} alt="Preview" className="w-full h-32 object-cover rounded border" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x200?text=URL+Invalida')} />
                </div>
                {/* About Image */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Imagen "Nuestra Casa"</h3>
                  <input type="url" className="w-full border p-2 rounded mb-2 text-sm" value={content.aboutImage} onChange={e => setContent({ ...content, aboutImage: e.target.value })} placeholder="URL de la imagen" />
                  <img src={content.aboutImage} alt="Preview" className="w-full h-32 object-cover rounded border" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x200?text=URL+Invalida')} />
                </div>
              </div>

              {/* Gallery List */}
              <div className="pt-6 border-t">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Fotos de la Galería</h3>
                  <button type="button" onClick={addGalleryImage} className="text-sm bg-gray-100 px-3 py-1.5 rounded hover:bg-gray-200 transition text-gray-800">
                    + Añadir Foto
                  </button>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {(content.galleryImages || []).map((img: any, idx: number) => (
                    <div key={idx} className="flex gap-2 items-start bg-gray-50 p-3 rounded border border-gray-100">
                      <div className="flex-1 space-y-2">
                        <input type="url" placeholder="URL de la imagen" className="w-full px-3 py-1.5 border rounded text-sm" value={img.url} onChange={e => updateGalleryImage(idx, 'url', e.target.value)} />
                        <input type="text" placeholder="Título corto (ej. Salón)" className="w-full px-3 py-1.5 border rounded text-sm" value={img.title} onChange={e => updateGalleryImage(idx, 'title', e.target.value)} />
                      </div>
                      <button type="button" onClick={() => removeGalleryImage(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded transition" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(!content.galleryImages || content.galleryImages.length === 0) && (
                    <div className="text-center text-gray-500 py-8 text-sm bg-gray-50 rounded border border-dashed">No hay imágenes en la galería</div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button type="submit" disabled={saving} className="bg-[#2c3e50] text-white px-6 py-2 rounded-md hover:bg-gray-800 transition flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar Imágenes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB: BOOKINGS & CALENDAR */}
        {activeTab === 'bookings' && (
          <div className="animate-fade-in space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">Gestión de Reservas y Calendario</h2>

            {/* Blocked Dates Management */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-[#d4af37]" /> Bloqueo Manual de Fechas</h3>
              <p className="text-sm text-gray-500 mb-4">Añade fechas específicas en las que la propiedad no estará disponible (mantenimiento, uso personal, etc). Las reservas Aceptadas bloquean fechas automáticamente.</p>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input
                  type="date"
                  className="border px-4 py-2 rounded-md focus:ring-[#2c3e50] outline-none"
                  value={newBlockedDate}
                  onChange={e => setNewBlockedDate(e.target.value)}
                />
                <button
                  onClick={() => { handleAddBlockedDate(); handleSaveContent({ preventDefault: () => { } } as any); }}
                  className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
                >
                  Bloquear Fecha
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(content.blockedDates || []).map((date: string) => (
                  <div key={date} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 border">
                    {date}
                    <button onClick={() => { removeBlockedDate(date); handleSaveContent({ preventDefault: () => { } } as any); }} className="text-gray-400 hover:text-red-500 transition">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {(!content.blockedDates || content.blockedDates.length === 0) && (
                  <span className="text-sm text-gray-400 italic">No hay fechas bloqueadas manualmente.</span>
                )}
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900">Historial de Solicitudes</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b">
                      <th className="p-4 font-semibold">Huésped</th>
                      <th className="p-4 font-semibold">Fechas (Llegada / Salida)</th>
                      <th className="p-4 font-semibold">Pax</th>
                      <th className="p-4 font-semibold">Estado</th>
                      <th className="p-4 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {bookings.map(b => (
                      <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{b.name}</div>
                          <div className="text-xs text-gray-500">{b.email}</div>
                          {b.message && <div className="text-xs text-gray-400 mt-1 truncate max-w-[150px]" title={b.message}>{b.message}</div>}
                        </td>
                        <td className="p-4 text-gray-600">{b.checkIn} a <br />{b.checkOut}</td>
                        <td className="p-4 text-gray-600">{b.guests}</td>
                        <td className="p-4">
                          {b.status === 'PENDING' && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pendiente</span>}
                          {b.status === 'ACCEPTED' && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Aceptada</span>}
                          {b.status === 'CANCELLED' && <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Cancelada</span>}
                        </td>
                        <td className="p-4 text-right">
                          {b.status === 'PENDING' ? (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleBookingAction(b.id, 'ACCEPTED')} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Aceptar"><Check className="w-4 h-4" /></button>
                              <button onClick={() => handleBookingAction(b.id, 'CANCELLED')} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Rechazar"><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <button onClick={() => handleDeleteBooking(b.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500 bg-gray-50 italic">
                          No hay solicitudes de reserva todavía.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
