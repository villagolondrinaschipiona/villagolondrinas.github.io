import fs from 'fs';
import path from 'path';

// Define the shape of our data
export interface Booking {
  id: string;
  name: string;
  email: string;
  guests: number;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  status: 'PENDING' | 'ACCEPTED' | 'CANCELLED';
  message?: string;
  createdAt: string;
}

export interface SiteContent {
  heroTagline: string;
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  aboutTitle: string;
  aboutIntro: string;
  aboutDetails: string;
  aboutImage: string;
  galleryImages: { url: string; title: string }[];
  blockedDates: string[]; // YYYY-MM-DD
}

export interface DBData {
  content: SiteContent;
  bookings: Booking[];
}

const defaultData: DBData = {
  content: {
    heroTagline: 'Escapada Exclusiva',
    heroTitle: 'Donde el Lujo <br /> <span class="text-gradient font-style-italic">Encuentra la Paz</span>',
    heroDescription: 'Desconecta del mundo en nuestra villa privada. Espacios diseñados meticulosamente para una experiencia inolvidable frente al mar.',
    heroImage: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=2600&auto=format&fit=crop',
    aboutTitle: 'Un Refugio Diseñado para los Sentidos',
    aboutIntro: 'Villa Serenity no es solo un lugar para alojarse, es una experiencia completa. Con acabados de primera calidad, luz natural abundante y distribución diáfana, cada rincón está pensado para tu confort.',
    aboutDetails: 'Despierta con el sonido de la brisa, disfruta de desayunos en la terraza cubierta y relájate al atardecer en la piscina infinita climatizada. Tu oasis personal te espera.',
    aboutImage: 'https://images.unsplash.com/photo-1600607688969-a5bfcd64bd40?q=80&w=1400&auto=format&fit=crop',
    galleryImages: [
      { url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=800&auto=format&fit=crop', title: 'Vista Exterior' },
      { url: 'https://images.unsplash.com/photo-1600607688969-a5bfcd64bd40?q=80&w=800&auto=format&fit=crop', title: 'Salón Principal' },
      { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop', title: 'Piscina Infinita' },
      { url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800&auto=format&fit=crop', title: 'Cocina Gourmet' },
      { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop', title: 'Dormitorio Principal' },
      { url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=800&auto=format&fit=crop', title: 'Baño En-Suite' },
      { url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1200&auto=format&fit=crop', title: 'Terraza al Atardecer' }
    ],
    blockedDates: []
  },
  bookings: []
};

// Use a file in the project root to store data
const DB_FILE = path.join(process.cwd(), 'data.json');

// Ensure DB file exists
export function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

// Read whole DB
export function readDB(): DBData {
  initDB();
  const rawData = fs.readFileSync(DB_FILE, 'utf-8');
  try {
    return JSON.parse(rawData) as DBData;
  } catch (e) {
    console.error('Error parsing DB JSON:', e);
    return defaultData;
  }
}

// Write whole DB
export function writeDB(data: DBData) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Helpers
export function getContent(): SiteContent {
  return readDB().content;
}

export function saveContent(updates: Partial<SiteContent>) {
  const db = readDB();
  db.content = { ...db.content, ...updates };
  writeDB(db);
}

export function getBookings(): Booking[] {
  return readDB().bookings;
}

export function addBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>): Booking {
  const db = readDB();
  const newBooking: Booking = {
    ...bookingData,
    id: Math.random().toString(36).substring(2, 9).toUpperCase(),
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };
  db.bookings.push(newBooking);
  writeDB(db);
  return newBooking;
}

export function updateBookingStatus(id: string, status: 'PENDING' | 'ACCEPTED' | 'CANCELLED') {
  const db = readDB();
  const index = db.bookings.findIndex(b => b.id === id);
  if (index !== -1) {
    db.bookings[index].status = status;
    writeDB(db);
    return true;
  }
  return false;
}

export function deleteBooking(id: string) {
    const db = readDB();
    const initialLen = db.bookings.length;
    db.bookings = db.bookings.filter(b => b.id !== id);
    if(db.bookings.length !== initialLen){
        writeDB(db);
        return true;
    }
    return false;
}

// Gets all dates to block on the calendar (Manual + Accepted Bookings)
export function getAllBlockedDates(): string[] {
  const db = readDB();
  const dates = new Set<string>(db.content.blockedDates || []);

  const getDatesBetween = (start: string, end: string) => {
    let arr = [];
    let curr = new Date(start);
    let endD = new Date(end);
    curr.setHours(0, 0, 0, 0);
    endD.setHours(0, 0, 0, 0);
    
    while (curr <= endD) {
      arr.push(new Date(curr).toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }
    return arr;
  };

  db.bookings.forEach(b => {
    if (b.status === 'ACCEPTED') {
      const range = getDatesBetween(b.checkIn, b.checkOut);
      range.forEach(d => dates.add(d));
    }
  });

  return Array.from(dates);
}
