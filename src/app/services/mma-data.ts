import { Injectable } from '@angular/core';

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
}

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
  comments?: Comment[];
}

export interface Evento {
  id: string;
  titulo: string;
  tipo: string;
  fecha: string;
  hora: string;
  ubicacion: string;
  color: string;
  rsvp?: boolean;
}

export interface Rango {
  disciplina: string;
  nivel: string;
  detalle: string;
  progreso: number;
  color: string;
  horasRegistradas?: number;
}

export interface StoryItem {
  id: string;
  author: string;
  avatar: string;
  discipline: string;
  image: string;
  caption: string;
  isUserStory?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MmaDataService {

  private defaultPosts: Post[] = [
    {
      id: 'post_01',
      author: 'Leo Silva',
      discipline: 'BJJ - CINTURÓN AZUL',
      time: 'Hace 2 horas',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=600',
      description: '¡Sesión pesada de sparring completada el día de hoy! 🥊🔥 Alistando el cardio.',
      likes: 24,
      liked: false,
      comments: [
        {
          id: 'comm_01',
          author: 'Carlos M.',
          avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
          text: '¡Esa guardia cerrada estuvo intratable hoy hermano! Gran entreno.',
          time: 'Hace 1 hora'
        }
      ]
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
      liked: false,
      comments: [
        {
          id: 'comm_02',
          author: 'Prof. Silva',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          text: 'Excelente velocidad en las patadas circulares. Mantén la guardia alta al salir.',
          time: 'Hace 2 horas'
        }
      ]
    }
  ];

  private defaultEventos: Evento[] = [
    // Competencias
    { id: '1', titulo: 'Pan-American Championship', tipo: 'competencia', fecha: '18 MAY', hora: '9:00 AM', ubicacion: 'Toronto, Canada', color: 'primary', rsvp: false },
    { id: '4', titulo: 'ADCC North American Trials', tipo: 'competencia', fecha: '04 JUN', hora: '8:30 AM', ubicacion: 'Las Vegas, NV', color: 'primary', rsvp: false },
    { id: '5', titulo: 'Torneo Abierto Nacional Striking & MMA', tipo: 'competencia', fecha: '18 JUN', hora: '10:00 AM', ubicacion: 'Arena CDMX, México', color: 'primary', rsvp: false },
    { id: '6', titulo: 'Campeonato Submission Only Pro', tipo: 'competencia', fecha: '02 JUL', hora: '11:00 AM', ubicacion: 'Sao Paulo, Brasil', color: 'primary', rsvp: false },

    // Seminarios
    { id: '2', titulo: 'Seminario de Leglocks - Coach Silva', tipo: 'seminario', fecha: '22 MAY', hora: '6:30 PM', ubicacion: 'Alpha Gym Hq', color: 'warning', rsvp: true },
    { id: '7', titulo: 'Masterclass de Clinch y Codos Muay Thai', tipo: 'seminario', fecha: '08 JUN', hora: '5:00 PM', ubicacion: 'Bangkok Combat Hub', color: 'warning', rsvp: false },
    { id: '8', titulo: 'Transiciones de Lucha a MMA - Dan H.', tipo: 'seminario', fecha: '20 JUN', hora: '4:00 PM', ubicacion: 'Warrior Academy', color: 'warning', rsvp: false },
    { id: '9', titulo: 'Defensa de Guardia & Escapes de Espalda', tipo: 'seminario', fecha: '05 JUL', hora: '6:00 PM', ubicacion: 'Octagon Center', color: 'warning', rsvp: false },

    // Entrenamientos / Sparring
    { id: '3', titulo: 'Sparring Interclubes MMA', tipo: 'entrenamiento', fecha: '28 MAY', hora: '4:00 PM', ubicacion: 'Striker Zone', color: 'success', rsvp: false },
    { id: '10', titulo: 'Open Mat de Viernes Sin Gi', tipo: 'entrenamiento', fecha: '05 JUN', hora: '7:00 PM', ubicacion: 'Gracie Central', color: 'success', rsvp: false },
    { id: '11', titulo: 'Campamento de Golpeo & Pads de Alta Intensidad', tipo: 'entrenamiento', fecha: '14 JUN', hora: '8:30 AM', ubicacion: 'Tiger Muay Thai', color: 'success', rsvp: false },
    { id: '12', titulo: 'Sparring Condicionado de Jaula & Derribos', tipo: 'entrenamiento', fecha: '26 JUN', hora: '5:30 PM', ubicacion: 'Top Team Apex', color: 'success', rsvp: false }
  ];

  private defaultRangos: Rango[] = [
    { disciplina: 'Brazilian Jiu-Jitsu', nivel: 'Cinturón Azul', detalle: '2 Grados', progreso: 0.65, color: '#3b82f6', horasRegistradas: 120 },
    { disciplina: 'Muay Thai', nivel: 'Graduación 4', detalle: 'Prajied Naranja/Blanco', progreso: 0.45, color: '#f97316', horasRegistradas: 85 },
    { disciplina: 'Wrestling', nivel: 'Nivel Avanzado', detalle: 'Nivel 3', progreso: 0.80, color: '#ef4444', horasRegistradas: 160 }
  ];

  private defaultStories: StoryItem[] = [
    {
      id: 'st_1',
      author: 'Tu Estado',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      discipline: 'MMA & BJJ',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
      caption: 'Acondicionamiento matutino: 5 rounds de golpeo al costal. 🥊⚡',
      isUserStory: true
    },
    {
      id: 'st_2',
      author: 'Prof. Silva',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      discipline: 'BJJ Black Belt',
      image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800',
      caption: 'Repasando la transición de Kimura a Armbar en guardia cerrada. 🥋'
    },
    {
      id: 'st_3',
      author: 'Carlos "Toro"',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      discipline: 'Muay Thai',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
      caption: 'Sparring técnico con el equipo de combate. ¡Gran ritmo y timing!'
    },
    {
      id: 'st_4',
      author: 'Valentina Díaz',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      discipline: 'Judo & Sambo',
      image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800',
      caption: 'Perfeccionando el Harai Goshi en el campamento de verano. 🥋⚡'
    }
  ];

  getDefaultPosts(): Post[] {
    return JSON.parse(JSON.stringify(this.defaultPosts));
  }

  getDefaultEventos(): Evento[] {
    return JSON.parse(JSON.stringify(this.defaultEventos));
  }

  getDefaultRangos(): Rango[] {
    return JSON.parse(JSON.stringify(this.defaultRangos));
  }

  getDefaultStories(): StoryItem[] {
    return JSON.parse(JSON.stringify(this.defaultStories));
  }
}
