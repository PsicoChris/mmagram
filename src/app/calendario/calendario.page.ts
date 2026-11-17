import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonItem, 
  IonLabel, IonIcon, IonButton, IonButtons 
} from '@ionic/angular/standalone';
import { MmaDataService, Evento } from '../services/mma-data';
import { AuthService } from '../services/auth';
import { FooterTabsComponent } from '../footer-tabs/footer-tabs.component';
import { addIcons } from 'ionicons';
import { timeOutline, locationOutline, logOutOutline } from 'ionicons/icons';

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
    IonButton
  ]
})
export class CalendarioPage implements OnInit {
  private readonly mmaData = inject(MmaDataService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  eventos: Evento[] = [];

  constructor() {
    addIcons({ timeOutline, locationOutline, logOutOutline });
  }

  ngOnInit() {
    this.eventos = this.mmaData.getEventos();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
