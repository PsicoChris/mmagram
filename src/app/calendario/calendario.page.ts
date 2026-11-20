import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonItem, 
  IonLabel, IonIcon, IonButton, IonButtons, IonChip, IonBadge 
} from '@ionic/angular/standalone';
import { Evento } from '../services/mma-data';
import { DatabaseService } from '../services/database';
import { AuthService } from '../services/auth';
import { FooterTabsComponent } from '../footer-tabs/footer-tabs.component';
import { addIcons } from 'ionicons';
import { 
  timeOutline, locationOutline, logOutOutline, 
  checkmarkCircle, checkmark, filterOutline, calendarOutline, medalOutline 
} from 'ionicons/icons';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.page.html',
  styleUrls: ['./calendario.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    FooterTabsComponent,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonButtons,
    IonContent, 
    IonCard, 
    IonItem, 
    IonLabel, 
    IonIcon, 
    IonButton,
    IonChip,
    IonBadge
  ]
})
export class CalendarioPage implements OnInit {
  private readonly backendLocal = inject(DatabaseService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  eventos: Evento[] = [];
  filtroActual: 'todos' | 'mis_eventos' | 'competencia' | 'seminario' | 'entrenamiento' = 'todos';

  constructor() {
    addIcons({ 
      timeOutline, locationOutline, logOutOutline, 
      checkmarkCircle, checkmark, filterOutline, calendarOutline, medalOutline 
    });
  }

  async ngOnInit() {
    await this.cargarEventos();
  }

  async ionViewWillEnter() {
    await this.cargarEventos();
  }

  async cargarEventos() {
    this.eventos = await this.backendLocal.getAllEvents();
  }

  setFiltro(nuevoFiltro: 'todos' | 'mis_eventos' | 'competencia' | 'seminario' | 'entrenamiento') {
    this.filtroActual = nuevoFiltro;
    this.triggerHaptic(ImpactStyle.Light);
  }

  get eventosFiltrados(): Evento[] {
    if (this.filtroActual === 'mis_eventos') {
      return this.eventos.filter(e => e.rsvp);
    }
    if (this.filtroActual !== 'todos') {
      return this.eventos.filter(e => e.tipo === this.filtroActual);
    }
    return this.eventos;
  }

  get totalInscritos(): number {
    return this.eventos.filter(e => e.rsvp).length;
  }

  private async triggerHaptic(style: ImpactStyle = ImpactStyle.Light) {
    try {
      await Haptics.impact({ style });
    } catch {
      // Ignora en plataformas sin soporte
    }
  }

  async toggleRsvp(ev: Evento) {
    await this.triggerHaptic(ImpactStyle.Medium);
    this.eventos = await this.backendLocal.toggleEventRsvp(ev.id);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
