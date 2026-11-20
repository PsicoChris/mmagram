import { Injectable, signal } from '@angular/core';

export interface UserProfile {
  email: string;
  name: string;
  discipline: string;
  avatar: string;
  gym?: string;
  record?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storageKey = 'octastrike_active_user';

  private defaultCredentials = {
    email: 'chris@octastrike.com',
    pass: 'mma123',
    profile: {
      email: 'chris@octastrike.com',
      name: 'Chris "La Makina"',
      discipline: 'MMA & BJJ',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      gym: 'Team Octagon MMA',
      record: '4-1-0'
    }
  };

  currentUser = signal<UserProfile | null>(this.getStoredUser());

  login(email: string, pass: string): boolean {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === this.defaultCredentials.email && pass === this.defaultCredentials.pass) {
      const user = this.getStoredUser() || this.defaultCredentials.profile;
      this.currentUser.set(user);
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(user));
      } catch (e) {
        console.error('Error guardando sesión:', e);
      }
      return true;
    }
    return false;
  }

  updateProfile(updated: Partial<UserProfile>): void {
    const current = this.currentUser();
    if (!current) return;
    const merged: UserProfile = { ...current, ...updated };
    this.currentUser.set(merged);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(merged));
    } catch (e) {
      console.error('Error actualizando perfil:', e);
    }
  }

  logout(): void {
    this.currentUser.set(null);
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      console.error('Error removiendo sesión:', e);
    }
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  private getStoredUser(): UserProfile | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error leyendo sesión almacenada:', e);
    }
    return null;
  }
}
