import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

export interface PostLikeRecord {
  likes_count: number;
  is_liked: number;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private sqliteConnection: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private dbInstance?: SQLiteDBConnection;
  private isNative: boolean = false;
  private isDbReady: boolean = false;
  private readyPromise: Promise<boolean>;

  // Fallback para modo Web / Navegador de desarrollo
  private webStorageKey = 'octastrike_likes_cache';

  constructor() {
    this.readyPromise = this.initDatabase();
  }

  async ready(): Promise<boolean> {
    return this.readyPromise;
  }

  async initDatabase(): Promise<boolean> {
    this.isNative = Capacitor.isNativePlatform();

    if (!this.isNative) {
      // Entorno Web / Navegador: Inicializar almacén local
      this.ensureWebStorageDefaults();
      this.isDbReady = true;
      console.log('OctaStrike: Almacenamiento local Web inicializado (Fallback sin SQLite nativo)');
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

      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS mma_posts (
          id TEXT PRIMARY KEY,
          likes_count INTEGER,
          is_liked INTEGER
        );
      `;
      await this.dbInstance.execute(createTableQuery);

      const checkTable = await this.dbInstance.query('SELECT COUNT(*) as count FROM mma_posts;');
      const rowCount = checkTable.values && checkTable.values.length > 0
        ? (checkTable.values[0].count ?? checkTable.values[0]['COUNT(*)'] ?? 0)
        : 0;

      if (rowCount === 0) {
        await this.dbInstance.execute(`
          INSERT INTO mma_posts (id, likes_count, is_liked) VALUES ('post_01', 24, 0);
          INSERT INTO mma_posts (id, likes_count, is_liked) VALUES ('post_02', 42, 0);
        `);
      }

      this.isDbReady = true;
      console.log('OctaStrike: BBDD Local SQLite Nativa Inicializada');
      return true;
    } catch (error) {
      console.warn('OctaStrike: No se pudo iniciar SQLite nativo, activando fallback local:', error);
      this.ensureWebStorageDefaults();
      this.isDbReady = true;
      return true;
    }
  }

  private ensureWebStorageDefaults() {
    try {
      const stored = localStorage.getItem(this.webStorageKey);
      if (!stored) {
        const defaults: Record<string, PostLikeRecord> = {
          post_01: { likes_count: 24, is_liked: 0 },
          post_02: { likes_count: 42, is_liked: 0 }
        };
        localStorage.setItem(this.webStorageKey, JSON.stringify(defaults));
      }
    } catch (e) {
      console.error('Error accediendo a localStorage:', e);
    }
  }

  async getPostLikes(postId: string): Promise<PostLikeRecord> {
    await this.ready();

    if (this.isNative && this.dbInstance) {
      try {
        const result = await this.dbInstance.query('SELECT likes_count, is_liked FROM mma_posts WHERE id = ?;', [postId]);
        if (result.values && result.values.length > 0) {
          return {
            likes_count: Number(result.values[0].likes_count) || 0,
            is_liked: Number(result.values[0].is_liked) || 0
          };
        }
      } catch (e) {
        console.error(`Error consultando likes para ${postId} en SQLite:`, e);
      }
    }

    // Fallback Web / LocalStorage
    try {
      const cache = JSON.parse(localStorage.getItem(this.webStorageKey) || '{}');
      if (cache[postId]) {
        return cache[postId];
      }
    } catch (e) {
      console.error('Error leyendo del fallback Web:', e);
    }

    return { likes_count: 0, is_liked: 0 };
  }

  async updatePostLikes(postId: string, newCount: number, likedState: boolean): Promise<void> {
    await this.ready();
    const likedValue = likedState ? 1 : 0;

    if (this.isNative && this.dbInstance) {
      try {
        // INSERT OR REPLACE para actualizar existentes o registrar nuevos posts
        await this.dbInstance.run(
          'INSERT OR REPLACE INTO mma_posts (id, likes_count, is_liked) VALUES (?, ?, ?);',
          [postId, newCount, likedValue]
        );
      } catch (e) {
        console.error(`Error guardando likes para ${postId} en SQLite:`, e);
      }
    }

    // Siempre sincronizar con fallback local
    try {
      const cache = JSON.parse(localStorage.getItem(this.webStorageKey) || '{}');
      cache[postId] = { likes_count: newCount, is_liked: likedValue };
      localStorage.setItem(this.webStorageKey, JSON.stringify(cache));
    } catch (e) {
      console.error('Error guardando en fallback Web:', e);
    }
  }
}
