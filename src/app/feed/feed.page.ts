import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, 
  IonCard, IonItem, IonAvatar, IonLabel, IonCardContent, 
  IonFab, IonFabButton, IonModal, IonInput, IonTextarea 
} from '@ionic/angular/standalone';
import { MmaDataService, Post } from '../services/mma-data';
import { DatabaseService } from '../services/database';
import { AuthService } from '../services/auth';
import { FooterTabsComponent } from '../footer-tabs/footer-tabs.component';
import { addIcons } from 'ionicons';
import { notificationsOutline, heart, heartOutline, chatbubbleOutline, add, logOutOutline } from 'ionicons/icons';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
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
    IonCard, 
    IonItem, 
    IonAvatar, 
    IonLabel, 
    IonCardContent,
    IonFab, 
    IonFabButton, 
    IonModal, 
    IonInput, 
    IonTextarea
  ]
})
export class FeedPage implements OnInit {
  private readonly mmaData = inject(MmaDataService);
  private readonly backendLocal = inject(DatabaseService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  posts: Post[] = [];
  
  // Variables del Formulario
  isModalOpen = false;
  newDescription = '';
  newDisciplina = 'MMA';
  
  // Imagen por defecto si no suben nada
  defaultImage = 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=500&auto=format&fit=crop';
  previewImage = this.defaultImage;

  constructor() {
    addIcons({ notificationsOutline, heart, heartOutline, chatbubbleOutline, add, logOutOutline });
  }

  async ngOnInit() {
    this.posts = this.mmaData.getPosts();

    for (const post of this.posts) {
      const localData = await this.backendLocal.getPostLikes(post.id);
      if (localData && typeof localData.likes_count === 'number') {
        post.likes = localData.likes_count;
        post.liked = localData.is_liked === 1;
      }
    }
  }

  async toggleLike(post: Post) {
    post.liked = !post.liked;
    post.liked ? post.likes++ : post.likes--;

    await this.backendLocal.updatePostLikes(post.id, post.likes, post.liked);
  }

  openCreateModal() {
    this.isModalOpen = true;
    this.previewImage = this.defaultImage;
  }

  closeCreateModal() {
    this.isModalOpen = false;
    this.newDescription = '';
    this.newDisciplina = 'MMA';
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.previewImage = reader.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  async publicarPost() {
    if (!this.newDescription.trim()) return;

    const currentUser = this.authService.currentUser();

    const nuevoPost: Post = {
      id: 'post_' + Date.now(),
      author: currentUser?.name || 'Chris "La Makina"',
      avatar: currentUser?.avatar || 'https://ionicframework.com/docs/img/demos/avatar.svg',
      discipline: this.newDisciplina.toUpperCase(),
      time: 'Hace un momento',
      image: this.previewImage,
      description: this.newDescription,
      likes: 0,
      liked: false
    };

    this.posts.unshift(nuevoPost);
    await this.backendLocal.updatePostLikes(nuevoPost.id, 0, false);
    this.closeCreateModal();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
