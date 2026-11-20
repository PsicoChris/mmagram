import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonButton, IonIcon, IonModal, IonItem, 
  IonLabel, IonInput, IonSelect, IonSelectOption 
} from '@ionic/angular/standalone';
import { Rango } from '../services/mma-data';
import { DatabaseService } from '../services/database';
import { AuthService, UserProfile } from '../services/auth';
import { FooterTabsComponent } from '../footer-tabs/footer-tabs.component';
import { addIcons } from 'ionicons';
import { 
  logOutOutline, createOutline, addCircleOutline, 
  timeOutline, fitnessOutline, trophyOutline, sparklesOutline, saveOutline,
  cameraOutline, add, colorPaletteOutline
} from 'ionicons/icons';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-rangos',
  templateUrl: './rangos.page.html',
  styleUrls: ['./rangos.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    FooterTabsComponent,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonModal,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption
  ]
})
export class RangosPage implements OnInit {
  private readonly backendLocal = inject(DatabaseService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  rangos: Rango[] = [];
  currentUser: UserProfile | null = null;

  // Modal Editar Perfil & Foto
  isProfileModalOpen = false;
  editName = '';
  editDiscipline = '';
  editGym = '';
  editRecord = '';
  editAvatar = '';

  avatarPresets: string[] = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    'https://ionicframework.com/docs/img/demos/avatar.svg'
  ];

  // Modal Agregar Nuevo Deporte
  isNewSportModalOpen = false;
  newSportDisciplina = '';
  newSportNivel = '';
  newSportDetalle = '';
  newSportColor = '#8b5cf6';
  newSportProgreso = 0.25;
  newSportHoras = 15;

  colorOptions = [
    { label: 'Púrpura / Morado', value: '#8b5cf6' },
    { label: 'Azul BJJ', value: '#3b82f6' },
    { label: 'Naranja / Prajied', value: '#f97316' },
    { label: 'Rojo Carmesí', value: '#ef4444' },
    { label: 'Verde Esmeralda', value: '#10b981' },
    { label: 'Amarillo Striking', value: '#eab308' },
    { label: 'Negro Élite', value: '#27272a' }
  ];

  constructor() {
    addIcons({ 
      logOutOutline, createOutline, addCircleOutline, 
      timeOutline, fitnessOutline, trophyOutline, sparklesOutline, saveOutline,
      cameraOutline, add, colorPaletteOutline
    });
  }

  async ngOnInit() {
    await this.cargarDatos();
  }

  async ionViewWillEnter() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    this.rangos = await this.backendLocal.getAllRangos();
    this.currentUser = this.authService.currentUser();
  }

  get totalHoras(): number {
    return this.rangos.reduce((acc, curr) => acc + (curr.horasRegistradas || 0), 0);
  }

  private async triggerHaptic(style: ImpactStyle = ImpactStyle.Light) {
    try {
      await Haptics.impact({ style });
    } catch {
      // Ignora en plataformas sin soporte
    }
  }

  async registrarSesion(r: Rango, horas: number = 2) {
    await this.triggerHaptic(ImpactStyle.Medium);
    this.rangos = await this.backendLocal.logMatHours(r.disciplina, horas);
  }

  // Modal Perfil & Foto
  openEditProfile() {
    if (this.currentUser) {
      this.editName = this.currentUser.name;
      this.editDiscipline = this.currentUser.discipline;
      this.editGym = this.currentUser.gym || 'Team Octagon MMA';
      this.editRecord = this.currentUser.record || '4-1-0';
      this.editAvatar = this.currentUser.avatar;
    }
    this.isProfileModalOpen = true;
    this.triggerHaptic(ImpactStyle.Light);
  }

  closeEditProfile() {
    this.isProfileModalOpen = false;
  }

  onAvatarSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.editAvatar = reader.result;
          this.triggerHaptic(ImpactStyle.Light);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  selectPresetAvatar(url: string) {
    this.editAvatar = url;
    this.triggerHaptic(ImpactStyle.Light);
  }

  async guardarPerfil() {
    if (!this.editName.trim()) return;

    await this.triggerHaptic(ImpactStyle.Heavy);
    this.authService.updateProfile({
      name: this.editName.trim(),
      discipline: this.editDiscipline.trim(),
      gym: this.editGym.trim(),
      record: this.editRecord.trim(),
      avatar: this.editAvatar || this.currentUser?.avatar
    });
    this.currentUser = this.authService.currentUser();
    this.closeEditProfile();
  }

  // Modal Agregar Nuevo Deporte
  openNewSportModal() {
    this.newSportDisciplina = '';
    this.newSportNivel = '';
    this.newSportDetalle = '';
    this.newSportColor = '#8b5cf6';
    this.newSportProgreso = 0.25;
    this.newSportHoras = 10;
    this.isNewSportModalOpen = true;
    this.triggerHaptic(ImpactStyle.Light);
  }

  closeNewSportModal() {
    this.isNewSportModalOpen = false;
  }

  async guardarNuevoDeporte() {
    if (!this.newSportDisciplina.trim() || !this.newSportNivel.trim()) return;

    await this.triggerHaptic(ImpactStyle.Heavy);

    const nuevoRango: Rango = {
      disciplina: this.newSportDisciplina.trim(),
      nivel: this.newSportNivel.trim(),
      detalle: this.newSportDetalle.trim() || 'Grado Inicial',
      color: this.newSportColor,
      progreso: Math.min(1.0, Math.max(0.05, this.newSportProgreso)),
      horasRegistradas: Number(this.newSportHoras) || 0
    };

    this.rangos = await this.backendLocal.addNewRango(nuevoRango);
    this.closeNewSportModal();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
