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

  // Email Modal States
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedBookingForEmail, setSelectedBookingForEmail] = useState<{ id: string, name: string, email: string, checkIn: string, checkOut: string, status: string } | null>(null);
  const [customEmailMessage, setCustomEmailMessage] = useState('');

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchContent();
    fetchBookings();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const contentRes = await fetch('/api/content');
      setContent(await contentRes.json());
    } catch (e) {
      console.error("Failed to load content data");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const bookingsRes = await fetch('/api/bookings');
      setBookings(await bookingsRes.json());
    } catch (e) {
      console.error("Failed to load bookings data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
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

  const openBookingActionModal = (booking: any, newStatus: string) => {
    setSelectedBookingForEmail({ ...booking, status: newStatus });

    // Pre-fill email template
    const actionText = newStatus === 'ACCEPTED' ? 'aceptada' : 'denegada';
    setCustomEmailMessage(`Estimado ${booking.name},\n\nSu reserva para los días ${booking.checkIn} al ${booking.checkOut} ha sido ${actionText}.\n\nUn saludo,\nVilla Golondrinas.`);

    setEmailModalOpen(true);
  };

  const confirmBookingAction = async () => {
    if (!selectedBookingForEmail) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/bookings/${selectedBookingForEmail.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedBookingForEmail.status,
          customEmailMessage: customEmailMessage
        })
      });
      if (res.ok) {
        fetchBookings(); // Refresh list
        setEmailModalOpen(false);
      } else {
        alert('Error al actualizar reserva o enviar correo');
      }
    } catch (e) {
      alert('Error de red al procesar la reserva');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('¿Eliminar permanentemente este registro?')) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) fetchBookings();
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
      blockedDates: (content.blockedDates || []).filter((d: string) => d !== date)
    });
  };

  // --- Pricing Management ---
  const [newSeason, setNewSeason] = useState({ name: '', startDate: '', endDate: '', price: '' });

  const addSeasonalPrice = () => {
    if (!newSeason.name || !newSeason.startDate || !newSeason.endDate || !newSeason.price) return;
    const priceNum = parseFloat(newSeason.price);
    if (isNaN(priceNum)) return;

    setContent({
      ...content,
      seasonalPrices: [
        ...(content.seasonalPrices || []),
        { ...newSeason, price: priceNum }
      ]
    });
    setNewSeason({ name: '', startDate: '', endDate: '', price: '' });
  };

  const removeSeasonalPrice = (index: number) => {
    const updated = [...(content.seasonalPrices || [])];
    updated.splice(index, 1);
    setContent({ ...content, seasonalPrices: updated });
  };

  // --- Image Processing & Upload Logic ---
  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > height) {
            if (width > maxDim) {
              height *= maxDim / width;
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width *= maxDim / height;
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8)); // Compress gently
          } else {
            reject('Could not get canvas context');
          }
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    setSaving(true);
    const newImages: { url: string, title: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      try {
        const base64Url = await processImage(file);
        newImages.push({ url: base64Url, title: file.name.split('.')[0] });
      } catch (error) {
        console.error("Error processing image", file.name, error);
      }
    }
    if (newImages.length > 0) {
      setContent((prev: any) => ({
        ...prev,
        galleryImages: [...(prev.galleryImages || []), ...newImages]
      }));
    }
    setSaving(false);
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
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-900">Editor Visual (Inicio)</h2>
              <button onClick={handleSaveContent} disabled={saving} className="bg-[#2c3e50] text-white px-6 py-2 rounded-md hover:bg-gray-800 transition flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar Cambios
              </button>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden shadow-xl relative">
              <div className="absolute top-0 right-0 bg-[#d4af37] text-white text-xs px-3 py-1 font-semibold rounded-bl-lg z-50">MODO EDICIÓN VISUAL</div>

              {/* WYSIWYG PREVIEW */}
              <div className="home-page preview-mode">
                <style dangerouslySetInnerHTML={{
                  __html: `
                  .preview-mode input, .preview-mode textarea {
                    background: rgba(255,255,255,0.1); border: 1px dashed rgba(255,255,255,0.5); 
                    transition: all 0.2s; border-radius: 4px; padding: 4px;
                  }
                  .preview-mode input:hover, .preview-mode textarea:hover,
                  .preview-mode input:focus, .preview-mode textarea:focus {
                    background: rgba(255,255,255,0.9); border: 1px solid #d4af37; color: #2c3e50; outline: none;
                  }
                  .preview-mode .dark-text-input {
                     background: rgba(0,0,0,0.02); border: 1px dashed #ccc; color: #2c3e50;
                  }
                  .preview-mode .dark-text-input:focus, .preview-mode .dark-text-input:hover {
                     background: white; border: 1px solid #d4af37;
                  }
                `}} />

                {/* Hero Preview */}
                <div className="relative h-[500px] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 z-0 bg-gray-900 group">
                    <img src={content.heroImage} alt="Hero" className="w-full h-full object-cover opacity-60" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <div className="absolute top-4 left-4 z-50 bg-black/70 p-2 rounded shadow flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                      <span className="text-white text-xs font-semibold">Fondo Portada:</span>
                      <select
                        className="bg-white text-sm text-gray-900 rounded px-2 py-1 outline-none"
                        value={content.heroImage}
                        onChange={(e) => setContent({ ...content, heroImage: e.target.value })}
                      >
                        <option value={content.heroImage}>Actual (URL personalizada)</option>
                        {(content.galleryImages || []).map((img: any, i: number) => (
                          <option key={i} value={img.url}>{img.title || `Imagen Galería ${i + 1}`}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto flex flex-col items-center">
                    <input
                      className="text-[#d4af37] tracking-[0.2em] text-sm md:text-base uppercase font-semibold text-center w-full mb-4"
                      value={content.heroTagline}
                      onChange={e => setContent({ ...content, heroTagline: e.target.value })}
                    />
                    <input
                      className="text-4xl md:text-5xl lg:text-6xl text-white font-bold mb-6 text-center w-full heading-font"
                      value={content.heroTitle}
                      onChange={e => setContent({ ...content, heroTitle: e.target.value })}
                    />
                    <textarea
                      className="text-lg md:text-xl text-white mb-10 w-full text-center font-light resize-none leading-relaxed"
                      rows={3}
                      value={content.heroDescription}
                      onChange={e => setContent({ ...content, heroDescription: e.target.value })}
                    />
                  </div>
                </div>

                {/* About Preview */}
                <section className="py-16 bg-white">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                      <div className="relative group cursor-pointer" onClick={() => setActiveTab('images')}>
                        <img src={content.aboutImage} alt="About" className="rounded-lg shadow-xl z-10 relative object-cover h-[400px] w-full opacity-80" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none group-hover:bg-black/40 transition">
                          <span className="bg-[#2c3e50] text-white px-4 py-2 rounded text-sm shadow-lg border border-white/20">Modificar Imagen Exclusivamente en Galería</span>
                        </div>
                      </div>
                      <div className="px-4 flex flex-col">
                        <span className="text-[#d4af37] tracking-widest text-sm uppercase font-semibold mb-2 block">CASA VILLA GOLONDRINAS</span>
                        <input
                          className="dark-text-input text-3xl md:text-4xl text-[#2c3e50] mb-4 heading-font w-full font-medium"
                          value={content.aboutTitle}
                          onChange={e => setContent({ ...content, aboutTitle: e.target.value })}
                        />
                        <textarea
                          className="dark-text-input text-gray-600 mb-4 text-base font-light resize-none w-full leading-relaxed"
                          rows={4}
                          value={content.aboutIntro}
                          onChange={e => setContent({ ...content, aboutIntro: e.target.value })}
                        />
                        <textarea
                          className="dark-text-input text-gray-600 text-base font-light resize-none w-full leading-relaxed"
                          rows={4}
                          value={content.aboutDetails}
                          onChange={e => setContent({ ...content, aboutDetails: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </section>
                {/* Features Section */}
                <section className="py-24 bg-[#f9f9f9]">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                    <span className="text-[#d4af37] tracking-widest text-sm uppercase font-semibold">Servicios Excepcionales</span>
                    <input
                      className="dark-text-input text-4xl text-[#2c3e50] mt-4 mb-16 heading-font font-medium text-center w-full"
                      value={content.featuresTitle} onChange={e => setContent({ ...content, featuresTitle: e.target.value })}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                        <input className="dark-text-input text-xl font-semibold mb-3 w-full" value={content.feature1Title} onChange={e => setContent({ ...content, feature1Title: e.target.value })} />
                        <textarea className="dark-text-input text-gray-600 font-light w-full resize-none" rows={4} value={content.feature1Desc} onChange={e => setContent({ ...content, feature1Desc: e.target.value })} />
                      </div>
                      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                        <input className="dark-text-input text-xl font-semibold mb-3 w-full" value={content.feature2Title} onChange={e => setContent({ ...content, feature2Title: e.target.value })} />
                        <textarea className="dark-text-input text-gray-600 font-light w-full resize-none" rows={4} value={content.feature2Desc} onChange={e => setContent({ ...content, feature2Desc: e.target.value })} />
                      </div>
                      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                        <input className="dark-text-input text-xl font-semibold mb-3 w-full" value={content.feature3Title} onChange={e => setContent({ ...content, feature3Title: e.target.value })} />
                        <textarea className="dark-text-input text-gray-600 font-light w-full resize-none" rows={4} value={content.feature3Desc} onChange={e => setContent({ ...content, feature3Desc: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-[#2c3e50] relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                  <div className="max-w-4xl mx-auto px-4 relative z-10 text-center text-white flex flex-col items-center">
                    <input className="text-4xl md:text-5xl font-medium heading-font mb-6 text-center w-full" value={content.ctaTitle} onChange={e => setContent({ ...content, ctaTitle: e.target.value })} />
                    <textarea className="text-xl text-white font-light mb-10 text-center w-full resize-none" rows={2} value={content.ctaDesc} onChange={e => setContent({ ...content, ctaDesc: e.target.value })} />
                    <input className="inline-block bg-[#d4af37]/20 border border-[#d4af37] text-white px-10 py-4 rounded-sm text-sm uppercase font-bold text-center w-64" value={content.ctaButton} onChange={e => setContent({ ...content, ctaButton: e.target.value })} />
                  </div>
                </section>

                {/* Footer (Editable Contact Info) */}
                <footer className="bg-white pt-16 pb-8 border-t border-gray-100">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                      <div className="flex flex-col">
                        <span className="heading-font text-2xl font-semibold tracking-wider text-[#2c3e50]">VILLA GOLONDRINAS</span>
                        <textarea className="dark-text-input mt-4 text-gray-500 font-light leading-relaxed max-w-xs resize-none" rows={3} value={content.footerIntro} onChange={e => setContent({ ...content, footerIntro: e.target.value })} />
                      </div>
                      <div className="opacity-70 pointer-events-none">
                        <h4 className="font-semibold text-gray-900 mb-4 uppercase text-sm">Enlaces Rápidos</h4>
                        <ul className="space-y-3 font-light text-gray-500"><li>Inicio</li><li>Galería / Casa</li><li>Reservas</li></ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 uppercase text-sm">Contacto (Datos Editables)</h4>
                        <ul className="space-y-3 font-light text-gray-500 flex flex-col">
                          <li className="flex items-center gap-3 w-full">
                            <span className="text-[#d4af37]">🗺️</span>
                            <input className="dark-text-input w-full text-sm" value={content.contactAddress} onChange={e => setContent({ ...content, contactAddress: e.target.value })} placeholder="Dirección física" />
                          </li>
                          <li className="flex items-center gap-3 w-full">
                            <span className="text-[#d4af37]">📞</span>
                            <input className="dark-text-input w-full text-sm" value={content.contactPhone} onChange={e => setContent({ ...content, contactPhone: e.target.value })} placeholder="Teléfono" />
                          </li>
                          <li className="flex items-center gap-3 w-full">
                            <span className="text-[#d4af37]">✉️</span>
                            <input className="dark-text-input w-full text-sm" value={content.contactEmail} onChange={e => setContent({ ...content, contactEmail: e.target.value })} placeholder="Email público" />
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </footer>
              </div>

            </div>
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
                </div>

                {/* Drag and Drop Upload Zone */}
                <div
                  className={`border-2 border-dashed rounded-lg p-10 text-center mb-6 transition-colors duration-200 cursor-pointer ${isDragging ? 'border-[#d4af37] bg-[#d4af37]/5' : 'border-gray-300 hover:border-[#d4af37] hover:bg-gray-50'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('gallery-upload')?.click()}
                >
                  <input
                    type="file"
                    id="gallery-upload"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  />
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    <p className="text-gray-600 font-medium">Arrastra y suelta fotos aquí para subirlas</p>
                    <p className="text-sm text-gray-500">o haz clic para explorar tus archivos</p>
                    <p className="text-xs text-[#2c3e50] font-semibold bg-[#d4af37]/20 px-3 py-1 rounded inline-block mt-2">Redimensionado y compresión automática online</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4 border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-600">Imágenes Subidas ({content.galleryImages?.length || 0})</h4>
                  <button type="button" onClick={addGalleryImage} className="text-xs bg-gray-100 px-3 py-1.5 rounded hover:bg-gray-200 transition text-gray-800">
                    + Añadir desde URL de internet
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

            {/* Pricing Management */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2 text-[#2c3e50]">Gestión de Precios</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Base por Noche (€)</label>
                  <input type="number" step="0.01" className="border px-4 py-2 rounded-md w-full focus:ring-[#2c3e50] outline-none" value={content.defaultPrice || ''} onChange={e => setContent({ ...content, defaultPrice: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aviso Legal (Calculadora Estimada)</label>
                  <textarea className="border px-4 py-2 rounded-md w-full focus:ring-[#2c3e50] outline-none text-sm h-10 resize-y" value={content.pricingDisclaimer || ''} onChange={e => setContent({ ...content, pricingDisclaimer: e.target.value })} />
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Temporadas Especiales</h4>
                <p className="text-xs text-gray-500 mb-4">Añade rangos de fechas con precios diferentes al base. Si una fecha cae en una temporada, usará este precio.</p>

                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <input type="text" placeholder="Nombre (ej. Verano Alto)" className="border px-3 py-2 rounded-md focus:ring-[#2c3e50] outline-none text-sm flex-1" value={newSeason.name} onChange={e => setNewSeason({ ...newSeason, name: e.target.value })} />
                  <input type="date" className="border px-3 py-2 rounded-md focus:ring-[#2c3e50] outline-none text-sm" value={newSeason.startDate} onChange={e => setNewSeason({ ...newSeason, startDate: e.target.value })} title="Inicio" />
                  <input type="date" className="border px-3 py-2 rounded-md focus:ring-[#2c3e50] outline-none text-sm" value={newSeason.endDate} onChange={e => setNewSeason({ ...newSeason, endDate: e.target.value })} title="Fin" />
                  <input type="number" placeholder="Precio/Noche €" className="border px-3 py-2 rounded-md focus:ring-[#2c3e50] outline-none text-sm w-32" value={newSeason.price} onChange={e => setNewSeason({ ...newSeason, price: e.target.value })} />
                  <button onClick={addSeasonalPrice} className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 transition text-sm whitespace-nowrap">Añadir</button>
                </div>

                <div className="space-y-2">
                  {(content.seasonalPrices || []).map((season: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-100 text-sm">
                      <div>
                        <span className="font-semibold text-gray-800 mr-2">{season.name}</span>
                        <span className="text-gray-500">{season.startDate} al {season.endDate}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-[#2c3e50]">{season.price} € / noche</span>
                        <button onClick={() => removeSeasonalPrice(idx)} className="text-gray-400 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  {(!content.seasonalPrices || content.seasonalPrices.length === 0) && (
                    <div className="text-center text-gray-400 text-sm py-4 italic border border-dashed rounded bg-gray-50">No hay temporadas configuradas.</div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button onClick={handleSaveContent} disabled={saving} className="bg-[#2c3e50] text-white px-6 py-2 rounded-md hover:bg-gray-800 transition flex items-center gap-2 text-sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar Precios
                </button>
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
                      <th className="p-4 font-semibold">Estimado</th>
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
                        <td className="p-4 font-medium text-gray-800">{b.estimatedPrice ? `${b.estimatedPrice}€` : '-'}</td>
                        <td className="p-4">
                          {b.status === 'PENDING' && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pendiente</span>}
                          {b.status === 'ACCEPTED' && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Aceptada</span>}
                          {b.status === 'CANCELLED' && <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Cancelada</span>}
                        </td>
                        <td className="p-4 text-right">
                          {b.status === 'PENDING' ? (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => openBookingActionModal(b, 'ACCEPTED')} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Aceptar"><Check className="w-4 h-4" /></button>
                              <button onClick={() => openBookingActionModal(b, 'CANCELLED')} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Rechazar"><X className="w-4 h-4" /></button>
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

      {/* Email Response Modal */}
      {emailModalOpen && selectedBookingForEmail && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-900">
                Confirmar y Notificar: {selectedBookingForEmail.status === 'ACCEPTED' ? 'Aceptar Reserva' : 'Rechazar Reserva'}
              </h3>
              <button onClick={() => setEmailModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">
                Se enviará el siguiente correo electrónico a <strong>{selectedBookingForEmail.email}</strong>. Puedes editar el texto antes de enviarlo:
              </p>
              <textarea
                className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-[#2c3e50] focus:border-[#2c3e50] outline-none min-h-[200px]"
                value={customEmailMessage}
                onChange={(e) => setCustomEmailMessage(e.target.value)}
              />
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setEmailModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmBookingAction}
                disabled={saving}
                className="px-4 py-2 bg-[#2c3e50] text-white rounded-md hover:bg-gray-800 transition flex items-center gap-2 text-sm"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirmar y Enviar Correo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
