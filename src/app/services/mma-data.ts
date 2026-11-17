import { Injectable } from '@angular/core';

export interface Post {
  id: string;
  author: string;
  discipline: string;
  time: string;
  avatar: string;
  image: string;
  description: string;
  likes: number;
  liked: boolean;
}

export interface Evento {
  id: string;
  titulo: string;
  tipo: string;
  fecha: string;
  hora: string;
  ubicacion: string;
  color: string;
}

export interface Rango {
  disciplina: string;
  nivel: string;
  detalle: string;
  progreso: number;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class MmaDataService {

  private posts: Post[] = [
    {
      id: 'post_01',
      author: 'Leo Silva',
      discipline: 'BJJ - CINTURÓN AZUL',
      time: 'Hace 2 horas',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=600',
      description: '¡Sesión pesada de sparring completada el día de hoy! 🥊🔥 Alistando el cardio.',
      likes: 24,
      liked: false
    },
    {
      id: 'post_02',
      author: 'Ana Cruz',
      discipline: 'MUAY THAI - ROJO/BLANCO',
      time: 'Hace 4 horas',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600',
      description: 'Puliendo las combinaciones de striking de cara al próximo torneo. 🩳⚡',
      likes: 42,
      liked: false
    }
  ];

  private eventos: Evento[] = [
    { id: '1', titulo: 'Pan-American Championship', tipo: 'competencia', fecha: '18 MAY', hora: '9:00 AM', ubicacion: 'Toronto, Canada', color: 'primary' },
    { id: '2', titulo: 'Seminario de Leglocks - Coach Silva', tipo: 'seminario', fecha: '22 MAY', hora: '6:30 PM', ubicacion: 'Alpha Gym Hq', color: 'warning' },
    { id: '3', titulo: 'Sparring Interclubes MMA', tipo: 'entrenamiento', fecha: '28 MAY', hora: '4:00 PM', ubicacion: 'Striker Zone', color: 'success' }
  ];

  private misRangos: Rango[] = [
    { disciplina: 'Brazilian Jiu-Jitsu', nivel: 'Cinturón Azul', detalle: '2 Grados', progreso: 0.65, color: 'royalblue' },
    { disciplina: 'Muay Thai', nivel: 'Graduación 4', detalle: 'Prajied Naranja/Blanco', progreso: 0.45, color: 'darkorange' },
    { disciplina: 'Wrestling', nivel: 'Nivel Avanzado', detalle: 'Nivel 3', progreso: 0.80, color: 'crimson' }
  ];

  getPosts(): Post[] {
    return [...this.posts];
  }

  getEventos(): Evento[] {
    return [...this.eventos];
  }

  getRangos(): Rango[] {
    return [...this.misRangos];
  }
}
