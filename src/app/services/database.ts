import { Injectable, inject } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { MmaDataService, Post, Evento, Rango, Comment, StoryItem } from './mma-data';

export interface PostLikeRecord {
  likes_count: number;
  is_liked: number;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private mmaData = inject(MmaDataService);
  private sqliteConnection: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private dbInstance?: SQLiteDBConnection;
  private isNative: boolean = false;
  private isDbReady: boolean = false;
  private readyPromise: Promise<boolean>;

  // Storage keys para Web / LocalStorage
  private readonly postsStorageKey = 'octastrike_feed_posts_v2';
  private readonly eventsStorageKey = 'octastrike_events_v2';
  private readonly rangosStorageKey = 'octastrike_rangos_v2';
  private readonly storiesStorageKey = 'octastrike_stories_v2';

  constructor() {
    this.readyPromise = this.initDatabase();
  }

  async ready(): Promise<boolean> {
    return this.readyPromise;
  }

  async initDatabase(): Promise<boolean> {
    this.isNative = Capacitor.isNativePlatform();

    if (!this.isNative) {
      this.ensureWebStorageDefaults();
      this.isDbReady = true;
      return true;
    }

    try {
      const isConn = await this.sqliteConnection.isConnection('octastrike_local', false);
      if (isConn.result) {
        this.dbInstance = await this.sqliteConnection.retrieveConnection('octastrike_local', false);
      } else {
        this.dbInstance = await this.sqliteConnection.createConnection(
          'octastrike_local',
          false,
          'no-encryption',
          1,
          false
        );
      }

      await this.dbInstance.open();

      // Tablas para entidades del MVP
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS mma_posts_v2 (
          id TEXT PRIMARY KEY,
          data TEXT
        );
        CREATE TABLE IF NOT EXISTS mma_events (
          id TEXT PRIMARY KEY,
          data TEXT
        );
        CREATE TABLE IF NOT EXISTS mma_rangos (
          disciplina TEXT PRIMARY KEY,
          data TEXT
        );
        CREATE TABLE IF NOT EXISTS mma_stories (
          id TEXT PRIMARY KEY,
          data TEXT
        );
      `;
      await this.dbInstance.execute(createTableQuery);

      // Pre-seed inicial en SQLite si está vacío
      const checkPosts = await this.dbInstance.query('SELECT COUNT(*) as count FROM mma_posts_v2;');
      const rowCount = checkPosts.values && checkPosts.values.length > 0
        ? (checkPosts.values[0].count ?? checkPosts.values[0]['COUNT(*)'] ?? 0)
        : 0;

      if (rowCount === 0) {
        const defaults = this.mmaData.getDefaultPosts();
        for (const post of defaults) {
          await this.dbInstance.run(
            'INSERT INTO mma_posts_v2 (id, data) VALUES (?, ?);',
            [post.id, JSON.stringify(post)]
          );
        }
      }

      this.isDbReady = true;
      return true;
    } catch (error) {
      console.warn('OctaStrike: SQLite nativo no disponible, usando fallback web:', error);
      this.ensureWebStorageDefaults();
      this.isDbReady = true;
      return true;
    }
  }

  private ensureWebStorageDefaults() {
    try {
      if (!localStorage.getItem(this.postsStorageKey)) {
        localStorage.setItem(this.postsStorageKey, JSON.stringify(this.mmaData.getDefaultPosts()));
      }
      
      // Asegurar que si hay menos de 10 eventos, se actualicen con los nuevos dummy events
      const existingEventsRaw = localStorage.getItem(this.eventsStorageKey);
      if (!existingEventsRaw || JSON.parse(existingEventsRaw).length < 8) {
        localStorage.setItem(this.eventsStorageKey, JSON.stringify(this.mmaData.getDefaultEventos()));
      }

      if (!localStorage.getItem(this.rangosStorageKey)) {
        localStorage.setItem(this.rangosStorageKey, JSON.stringify(this.mmaData.getDefaultRangos()));
      }

      if (!localStorage.getItem(this.storiesStorageKey)) {
        localStorage.setItem(this.storiesStorageKey, JSON.stringify(this.mmaData.getDefaultStories()));
      }
    } catch (e) {
      console.error('Error inicializando localStorage:', e);
    }
  }

  // ==================== STORIES ====================

  async getAllStories(): Promise<StoryItem[]> {
    await this.ready();

    if (this.isNative && this.dbInstance) {
      try {
        const result = await this.dbInstance.query('SELECT data FROM mma_stories;');
        if (result.values && result.values.length > 0) {
          return result.values.map(row => JSON.parse(row.data) as StoryItem);
        }
      } catch (e) {
        console.error('Error leyendo historias en SQLite:', e);
      }
    }

    try {
      const raw = localStorage.getItem(this.storiesStorageKey);
      if (raw) {
        return JSON.parse(raw) as StoryItem[];
      }
    } catch (e) {
      console.error('Error leyendo historias en Web:', e);
    }

    return this.mmaData.getDefaultStories();
  }

  async saveStory(story: StoryItem): Promise<StoryItem[]> {
    await this.ready();

    if (this.isNative && this.dbInstance) {
      try {
        await this.dbInstance.run(
          'INSERT OR REPLACE INTO mma_stories (id, data) VALUES (?, ?);',
          [story.id, JSON.stringify(story)]
        );
      } catch (e) {
        console.error(`Error guardando historia ${story.id} en SQLite:`, e);
      }
    }

    const stories = await this.getAllStories();
    // Reemplaza o inserta al inicio (después del estado del usuario si ya existe)
    const existingIndex = stories.findIndex(s => s.id === story.id || (story.isUserStory && s.isUserStory));
    if (existingIndex >= 0) {
      stories[existingIndex] = story;
    } else {
      stories.unshift(story);
    }

    try {
      localStorage.setItem(this.storiesStorageKey, JSON.stringify(stories));
    } catch (e) {
      console.error('Error guardando historia en Web:', e);
    }

    return stories;
  }

  // ==================== POSTS & LIKES ====================

  async getAllPosts(): Promise<Post[]> {
    await this.ready();

    if (this.isNative && this.dbInstance) {
      try {
        const result = await this.dbInstance.query('SELECT data FROM mma_posts_v2;');
        if (result.values && result.values.length > 0) {
          return result.values.map(row => JSON.parse(row.data) as Post);
        }
      } catch (e) {
        console.error('Error leyendo posts en SQLite:', e);
      }
    }

    try {
      const raw = localStorage.getItem(this.postsStorageKey);
      if (raw) {
        return JSON.parse(raw) as Post[];
      }
    } catch (e) {
      console.error('Error leyendo posts en Web:', e);
    }

    return this.mmaData.getDefaultPosts();
  }

  async savePost(post: Post): Promise<void> {
    await this.ready();

    if (this.isNative && this.dbInstance) {
      try {
        await this.dbInstance.run(
          'INSERT OR REPLACE INTO mma_posts_v2 (id, data) VALUES (?, ?);',
          [post.id, JSON.stringify(post)]
        );
      } catch (e) {
        console.error(`Error guardando post ${post.id} en SQLite:`, e);
      }
    }

    try {
      const posts = await this.getAllPosts();
      const index = posts.findIndex(p => p.id === post.id);
      if (index >= 0) {
        posts[index] = post;
      } else {
        posts.unshift(post);
      }
      localStorage.setItem(this.postsStorageKey, JSON.stringify(posts));
    } catch (e) {
      console.error('Error guardando post en Web:', e);
    }
  }

  async getPostLikes(postId: string): Promise<PostLikeRecord> {
    const posts = await this.getAllPosts();
    const found = posts.find(p => p.id === postId);
    if (found) {
      return {
        likes_count: found.likes,
        is_liked: found.liked ? 1 : 0
      };
    }
    return { likes_count: 0, is_liked: 0 };
  }

  async updatePostLikes(postId: string, newCount: number, likedState: boolean): Promise<void> {
    const posts = await this.getAllPosts();
    const target = posts.find(p => p.id === postId);
    if (target) {
      target.likes = newCount;
      target.liked = likedState;
      await this.savePost(target);
    }
  }

  async addComment(postId: string, comment: Comment): Promise<Comment[]> {
    const posts = await this.getAllPosts();
    const target = posts.find(p => p.id === postId);
    if (target) {
      if (!target.comments) {
        target.comments = [];
      }
      target.comments.push(comment);
      await this.savePost(target);
      return target.comments;
    }
    return [];
  }

  // ==================== EVENTOS & RSVP ====================

  async getAllEvents(): Promise<Evento[]> {
    await this.ready();

    if (this.isNative && this.dbInstance) {
      try {
        const result = await this.dbInstance.query('SELECT data FROM mma_events;');
        if (result.values && result.values.length > 0) {
          return result.values.map(row => JSON.parse(row.data) as Evento);
        }
      } catch (e) {
        console.error('Error leyendo eventos en SQLite:', e);
      }
    }

    try {
      const raw = localStorage.getItem(this.eventsStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Evento[];
        if (parsed.length >= 8) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error leyendo eventos en Web:', e);
    }

    const defaults = this.mmaData.getDefaultEventos();
    try {
      localStorage.setItem(this.eventsStorageKey, JSON.stringify(defaults));
    } catch { /* ignore */ }
    return defaults;
  }

  async toggleEventRsvp(eventId: string): Promise<Evento[]> {
    const events = await this.getAllEvents();
    const target = events.find(e => e.id === eventId);
    if (target) {
      target.rsvp = !target.rsvp;
      if (this.isNative && this.dbInstance) {
        try {
          await this.dbInstance.run(
            'INSERT OR REPLACE INTO mma_events (id, data) VALUES (?, ?);',
            [target.id, JSON.stringify(target)]
          );
        } catch (e) {
          console.error('Error actualizando evento en SQLite:', e);
        }
      }
      localStorage.setItem(this.eventsStorageKey, JSON.stringify(events));
    }
    return events;
  }

  // ==================== RANGOS & PROGRESIÓN ====================

  async getAllRangos(): Promise<Rango[]> {
    await this.ready();

    if (this.isNative && this.dbInstance) {
      try {
        const result = await this.dbInstance.query('SELECT data FROM mma_rangos;');
        if (result.values && result.values.length > 0) {
          return result.values.map(row => JSON.parse(row.data) as Rango);
        }
      } catch (e) {
        console.error('Error leyendo rangos en SQLite:', e);
      }
    }

    try {
      const raw = localStorage.getItem(this.rangosStorageKey);
      if (raw) {
        return JSON.parse(raw) as Rango[];
      }
    } catch (e) {
      console.error('Error leyendo rangos en Web:', e);
    }

    return this.mmaData.getDefaultRangos();
  }

  async logMatHours(disciplina: string, hoursToAdd: number): Promise<Rango[]> {
    const rangos = await this.getAllRangos();
    const target = rangos.find(r => r.disciplina.toLowerCase() === disciplina.toLowerCase());
    if (target) {
      target.horasRegistradas = (target.horasRegistradas || 0) + hoursToAdd;
      target.progreso = Math.min(1.0, Number((target.progreso + (hoursToAdd * 0.02)).toFixed(2)));

      if (this.isNative && this.dbInstance) {
        try {
          await this.dbInstance.run(
            'INSERT OR REPLACE INTO mma_rangos (disciplina, data) VALUES (?, ?);',
            [target.disciplina, JSON.stringify(target)]
          );
        } catch (e) {
          console.error('Error actualizando rango en SQLite:', e);
        }
      }
      localStorage.setItem(this.rangosStorageKey, JSON.stringify(rangos));
    }
    return rangos;
  }

  async addNewRango(nuevoRango: Rango): Promise<Rango[]> {
    const rangos = await this.getAllRangos();
    const existingIndex = rangos.findIndex(
      r => r.disciplina.toLowerCase() === nuevoRango.disciplina.toLowerCase()
    );

    if (existingIndex >= 0) {
      rangos[existingIndex] = nuevoRango;
    } else {
      rangos.push(nuevoRango);
    }

    if (this.isNative && this.dbInstance) {
      try {
        await this.dbInstance.run(
          'INSERT OR REPLACE INTO mma_rangos (disciplina, data) VALUES (?, ?);',
          [nuevoRango.disciplina, JSON.stringify(nuevoRango)]
        );
      } catch (e) {
        console.error('Error guardando nuevo rango en SQLite:', e);
      }
    }

    try {
      localStorage.setItem(this.rangosStorageKey, JSON.stringify(rangos));
    } catch (e) {
      console.error('Error guardando nuevo rango en Web:', e);
    }

    return rangos;
  }
}
