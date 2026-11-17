import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonButton, IonIcon 
} from '@ionic/angular/standalone';
import { MmaDataService, Rango } from '../services/mma-data';
import { AuthService, UserProfile } from '../services/auth';
import { FooterTabsComponent } from '../footer-tabs/footer-tabs.component';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';

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
    IonContent
  ]
})
export class RangosPage implements OnInit {
  private readonly mmaData = inject(MmaDataService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  rangos: Rango[] = [];
  currentUser: UserProfile | null = null;

  constructor() {
    addIcons({ logOutOutline });
  }

  ngOnInit() {
    this.rangos = this.mmaData.getRangos();
    this.currentUser = this.authService.currentUser();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
