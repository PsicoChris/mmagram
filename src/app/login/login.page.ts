import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonItem, IonInput, IonButton, AlertController } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonItem, 
    IonInput, 
    IonButton
  ]
})
export class LoginPage {
  private readonly router = inject(Router);
  private readonly alertController = inject(AlertController);
  private readonly authService = inject(AuthService);

  correo: string = 'chris@octastrike.com';
  contrasena: string = 'mma123';

  async ingresar() {
    const success = this.authService.login(this.correo, this.contrasena);
    if (success) {
      this.router.navigate(['/feed']);
    } else {
      const alert = await this.alertController.create({
        header: 'Acceso Denegado',
        message: 'El correo o la contraseña no son válidos. Usa las credenciales de prueba.',
        buttons: ['Entendido']
      });
      await alert.present();
    }
  }
}
