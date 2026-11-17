import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonFooter, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { images, calendar, trophy } from 'ionicons/icons';

@Component({
  selector: 'app-footer-tabs',
  templateUrl: './footer-tabs.component.html',
  styleUrls: ['./footer-tabs.component.scss'],
  standalone: true,
  imports: [IonFooter, IonRow, IonCol, IonIcon]
})
export class FooterTabsComponent {
  private readonly router = inject(Router);

  @Input() selectedTab: string = '';

  imagesIcon = images;
  calendarIcon = calendar;
  trophyIcon = trophy;

  constructor() {
    addIcons({ images, calendar, trophy });
  }

  navegar(ruta: string) { 
    this.router.navigate([ruta]); 
  }
}
