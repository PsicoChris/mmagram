import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, 
  IonCard, IonItem, IonAvatar, IonLabel, IonCardContent, 
  IonFab, IonFabButton, IonModal, IonInput, IonTextarea, IonList, IonNote
} from '@ionic/angular/standalone';
import { Post, Comment, StoryItem } from '../services/mma-data';
import { DatabaseService } from '../services/database';
import { AuthService } from '../services/auth';
import { FooterTabsComponent } from '../footer-tabs/footer-tabs.component';
import { addIcons } from 'ionicons';
import { 
  notificationsOutline, heart, heartOutline, chatbubbleOutline, 
  add, logOutOutline, send, closeOutline, flameOutline, trophyOutline,
  cameraOutline, playOutline, pauseOutline, cloudUploadOutline, chevronForward, chevronBack
} from 'ionicons/icons';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

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
    IonTextarea,
    IonList,
    IonNote
  ]
})
export class FeedPage implements OnInit, OnDestroy {
  private readonly backendLocal = inject(DatabaseService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  posts: Post[] = [];
  stories: StoryItem[] = [];

  // Story Viewer & Self-Pass Auto Advance
  selectedStory: StoryItem | null = null;
  currentStoryIndex: number = 0;
  isStoryModalOpen = false;
  storyProgress: number = 0; // 0 a 100%
  isStoryPaused: boolean = false;
  autoPassEnabled: boolean = true;
  private storyTimer: any = null;
  private readonly storyDurationMs = 4500; // 4.5 segundos por historia
  private readonly timerIntervalMs = 50;

  // Subir Historia Modal
  isUploadStoryModalOpen = false;
  storyPreviewImage = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800';
  newStoryCaption = '';
  newStoryDiscipline = 'MMA & BJJ';

  // Variables del Formulario de Crear Post
  isModalOpen = false;
  newDescription = '';
  newDisciplina = 'MMA';
  defaultImage = 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=500&auto=format&fit=crop';
  previewImage = this.defaultImage;

  // Comentarios
  isCommentModalOpen = false;
  activePostForComments: Post | null = null;
  newCommentText = '';

  constructor() {
    addIcons({ 
      notificationsOutline, heart, heartOutline, chatbubbleOutline, 
      add, logOutOutline, send, closeOutline, flameOutline, trophyOutline,
      cameraOutline, playOutline, pauseOutline, cloudUploadOutline, chevronForward, chevronBack
    });
  }

  async ngOnInit() {
    await this.cargarDatos();
  }

  async ionViewWillEnter() {
    await this.cargarDatos();
  }

  ngOnDestroy() {
    this.detenerStoryTimer();
  }

  async cargarDatos() {
    this.posts = await this.backendLocal.getAllPosts();
    this.stories = await this.backendLocal.getAllStories();
  }

  private async triggerHaptic(style: ImpactStyle = ImpactStyle.Light) {
    try {
      await Haptics.impact({ style });
    } catch {
      // Ignora en plataformas sin soporte
    }
  }

  async toggleLike(post: Post) {
    await this.triggerHaptic(ImpactStyle.Medium);
    post.liked = !post.liked;
    post.liked ? post.likes++ : post.likes = Math.max(0, post.likes - 1);

    await this.backendLocal.updatePostLikes(post.id, post.likes, post.liked);
  }

  // ==================== STORIES & SELF-PASS ====================

  openStory(story: StoryItem, index?: number) {
    if (typeof index === 'number') {
      this.currentStoryIndex = index;
    } else {
      const idx = this.stories.findIndex(s => s.id === story.id);
      this.currentStoryIndex = idx >= 0 ? idx : 0;
    }

    this.selectedStory = this.stories[this.currentStoryIndex];
    this.isStoryModalOpen = true;
    this.isStoryPaused = false;
    this.iniciarStoryTimer();
    this.triggerHaptic(ImpactStyle.Light);
  }

  closeStory() {
    this.detenerStoryTimer();
    this.isStoryModalOpen = false;
    this.selectedStory = null;
    this.storyProgress = 0;
    this.isStoryPaused = false;
  }

  private iniciarStoryTimer() {
    this.detenerStoryTimer();
    this.storyProgress = 0;

    const step = (this.timerIntervalMs / this.storyDurationMs) * 100;

    this.storyTimer = setInterval(() => {
      if (!this.isStoryPaused && this.autoPassEnabled) {
        this.storyProgress += step;
        if (this.storyProgress >= 100) {
          // Self-pass: avanza automáticamente a la siguiente historia
          this.irASiguienteHistoria();
        }
      }
    }, this.timerIntervalMs);
  }

  private detenerStoryTimer() {
    if (this.storyTimer) {
      clearInterval(this.storyTimer);
      this.storyTimer = null;
    }
  }

  irASiguienteHistoria() {
    if (this.currentStoryIndex < this.stories.length - 1) {
      this.currentStoryIndex++;
      this.selectedStory = this.stories[this.currentStoryIndex];
      this.iniciarStoryTimer();
      this.triggerHaptic(ImpactStyle.Light);
    } else {
      // Fin del carrete de historias
      this.closeStory();
    }
  }

  irAAnteriorHistoria() {
    if (this.storyProgress > 25) {
      // Si ya avanzó más del 25%, reinicia la actual
      this.storyProgress = 0;
    } else if (this.currentStoryIndex > 0) {
      this.currentStoryIndex--;
      this.selectedStory = this.stories[this.currentStoryIndex];
      this.iniciarStoryTimer();
      this.triggerHaptic(ImpactStyle.Light);
    }
  }

  pausarHistoria() {
    this.isStoryPaused = true;
  }

  reanudarHistoria() {
    this.isStoryPaused = false;
  }

  toggleAutoPass() {
    this.autoPassEnabled = !this.autoPassEnabled;
    this.triggerHaptic(ImpactStyle.Light);
  }

  // ==================== SUBIR HISTORIA (PHOTO TO STORY) ====================

  openUploadStoryModal() {
    const user = this.authService.currentUser();
    this.newStoryCaption = '';
    this.newStoryDiscipline = user?.discipline || 'MMA & BJJ';
    this.storyPreviewImage = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800';
    this.isUploadStoryModalOpen = true;
    this.triggerHaptic(ImpactStyle.Light);
  }

  closeUploadStoryModal() {
    this.isUploadStoryModalOpen = false;
  }

  onStoryFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.storyPreviewImage = reader.result;
          this.triggerHaptic(ImpactStyle.Light);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  async publicarHistoria() {
    await this.triggerHaptic(ImpactStyle.Heavy);
    const currentUser = this.authService.currentUser();

    const nuevaHistoria: StoryItem = {
      id: 'st_user_' + Date.now(),
      author: currentUser?.name || 'Tu Estado',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      discipline: this.newStoryDiscipline || 'MMA & BJJ',
      image: this.storyPreviewImage,
      caption: this.newStoryCaption.trim() || '¡Sesión de entreno en el tatami! 🥋🔥',
      isUserStory: true
    };

    this.stories = await this.backendLocal.saveStory(nuevaHistoria);
    this.closeUploadStoryModal();
  }

  // ==================== CREAR POST ====================

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

    await this.triggerHaptic(ImpactStyle.Heavy);
    const currentUser = this.authService.currentUser();

    const nuevoPost: Post = {
      id: 'post_' + Date.now(),
      author: currentUser?.name || 'Chris "La Makina"',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      discipline: this.newDisciplina.toUpperCase(),
      time: 'Hace un momento',
      image: this.previewImage,
      description: this.newDescription.trim(),
      likes: 0,
      liked: false,
      comments: []
    };

    await this.backendLocal.savePost(nuevoPost);
    this.posts.unshift(nuevoPost);
    this.closeCreateModal();
  }

  // ==================== COMENTARIOS ====================

  openComments(post: Post) {
    this.activePostForComments = post;
    this.newCommentText = '';
    this.isCommentModalOpen = true;
    this.triggerHaptic(ImpactStyle.Light);
  }

  closeComments() {
    this.isCommentModalOpen = false;
    this.activePostForComments = null;
    this.newCommentText = '';
  }

  async enviarComentario() {
    if (!this.newCommentText.trim() || !this.activePostForComments) return;

    await this.triggerHaptic(ImpactStyle.Light);
    const currentUser = this.authService.currentUser();

    const comentario: Comment = {
      id: 'comm_' + Date.now(),
      author: currentUser?.name || 'Chris "La Makina"',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      text: this.newCommentText.trim(),
      time: 'Justo ahora'
    };

    const updated = await this.backendLocal.addComment(this.activePostForComments.id, comentario);
    this.activePostForComments.comments = updated;
    this.newCommentText = '';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
