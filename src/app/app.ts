import { Component, signal, computed, inject, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpEventType, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div class="flex items-center gap-3">
            <div class="bg-red-600 p-2 rounded-lg shadow-lg shadow-red-200">
              <svg class="text-white w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold tracking-tight">YouTube AI Studio ✨</h1>
              <p class="text-slate-500 text-sm">Phân tích video trực tiếp bằng Gemini AI Vision</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            @if (isAuthenticated()) {
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200 shadow-sm">
                  <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span class="text-sm font-medium">Đã kết nối YouTube</span>
                </div>
                <button (click)="handleLogout()" class="text-slate-400 hover:text-red-500 p-2 transition-colors" title="Ngắt kết nối">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            } @else {
              <button (click)="handleLogin()" class="bg-white border border-slate-300 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 text-sm">
                <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                Kết nối YouTube
              </button>
            }
          </div>
        </header>

        <!-- Error Alert -->
        @if (error()) {
          <div class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p class="text-sm font-medium">{{ error() }}</p>
          </div>
        }

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-8 space-y-6">
            <!-- Video Upload Area -->
            <div
              class="relative border-2 border-dashed rounded-3xl p-10 transition-all flex flex-col items-center justify-center min-h-[250px] bg-white shadow-sm cursor-pointer hover:border-red-400 hover:bg-red-50/30 group"
              [class.border-red-500]="dragActive()"
              [class.bg-red-50]="dragActive()"
              [class.border-slate-200]="!dragActive()"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
              (click)="fileInput.click()"
            >
              <input #fileInput type="file" class="hidden" accept="video/*" (change)="onFileSelected($event)" />

              @if (!file()) {
                <div class="bg-slate-50 p-6 rounded-full mb-4 border border-slate-100 group-hover:scale-110 transition-transform">
                  <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                </div>
                <h3 class="text-xl font-bold">Tải video lên</h3>
                <p class="text-slate-400 text-sm mt-1">AI sẽ trực tiếp xem và phân tích nội dung của bạn</p>
              } @else {
                <div class="w-full flex items-center gap-6 p-6 bg-slate-900 text-white rounded-2xl shadow-xl animate-in zoom-in">
                  <div class="bg-red-600 p-4 rounded-xl shadow-lg relative overflow-hidden">
                    <svg class="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v8a2 2 0 002 2z"></path></svg>
                  </div>
                  <div class="flex-1 overflow-hidden">
                    <p class="font-bold text-lg truncate">{{ file()?.name }}</p>
                    <div class="flex gap-4 mt-1">
                      <span class="text-xs text-slate-400 font-mono uppercase">{{ fileSizeMb() }} MB</span>
                      <span class="text-xs text-red-400 font-bold uppercase tracking-widest">Video đã tải</span>
                    </div>
                  </div>
                  <button (click)="resetFile(); $event.stopPropagation()" class="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              }
            </div>

            <!-- AI Content Studio -->
            <div class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div class="flex items-center gap-3">
                   <div class="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                   </div>
                   <h2 class="font-bold text-lg">Phân tích nội dung AI</h2>
                </div>
                <div class="flex gap-2">
                  <button
                    (click)="askGemini('suggest_all')"
                    [disabled]="!file() || isSuggesting()"
                    class="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-all disabled:opacity-50 shadow-md shadow-slate-200"
                  >
                    @if (isSuggesting()) {
                      <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Đang phân tích...
                    } @else {
                      Tối ưu toàn diện ✨
                    }
                  </button>
                </div>
              </div>

              <div class="p-8 space-y-8">
                <!-- Thumbnail Upload -->
                <div>
                  <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Ảnh bìa video (Thumbnail)</label>
                  <div class="flex gap-6 items-start">
                    <div
                      (click)="thumbInput.click()"
                      class="w-48 aspect-video bg-slate-100 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200/50 transition-all overflow-hidden relative group"
                    >
                      <input #thumbInput type="file" class="hidden" accept="image/*" (change)="onThumbnailSelected($event)" />
                      @if (thumbnailPreview()) {
                        <img [src]="thumbnailPreview()" class="w-full h-full object-cover" />
                        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span class="text-white text-xs font-bold uppercase">Thay đổi ảnh</span>
                        </div>
                      } @else {
                        <svg class="w-8 h-8 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span class="text-[10px] font-bold text-slate-400 uppercase">Chọn ảnh bìa</span>
                      }
                    </div>
                    <div class="flex-1 space-y-2">
                      <p class="text-xs text-slate-500 leading-relaxed">Một ảnh bìa thu hút giúp video của bạn có tỷ lệ nhấp chuột cao hơn. Bạn có thể tự tải lên hoặc đợi AI gợi ý phong cách.</p>
                      @if (thumbnailPreview()) {
                        <button (click)="thumbnail.set(null); thumbnailPreview.set(null)" class="text-[10px] font-bold text-red-500 uppercase hover:underline">Xóa ảnh bìa</button>
                      }
                    </div>
                  </div>
                </div>

                <!-- Row 1: Tiêu đề -->
                <div>
                  <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tiêu đề video</label>
                  <div class="relative group">
                    <input type="text" [(ngModel)]="metadata.title" placeholder="AI sẽ gợi ý tiêu đề sau khi xem video..."
                      class="w-full border border-slate-200 rounded-xl p-4 pr-12 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all shadow-sm font-medium" />
                    <button (click)="askGemini('title_only')" [disabled]="!file() || isSuggesting()" class="absolute right-3 top-3 p-1.5 text-slate-300 hover:text-indigo-500 transition-colors disabled:opacity-30">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </button>
                  </div>
                </div>

                <!-- Row 2: Mô tả -->
                <div>
                  <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Mô tả chi tiết</label>
                  <div class="relative">
                    <textarea rows="5" [(ngModel)]="metadata.description" placeholder="Mô tả tự động được tạo từ nội dung hình ảnh và âm thanh trong video..."
                      class="w-full border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none resize-none transition-all shadow-sm"></textarea>
                    <div class="absolute bottom-4 right-4 flex gap-2">
                      <button (click)="askGemini('summarize')" [disabled]="!file() || isSuggesting()" class="bg-white/80 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 shadow-sm flex items-center gap-1 disabled:opacity-50">
                        Tóm tắt ✨
                      </button>
                      <button (click)="askGemini('chapters')" [disabled]="!file() || isSuggesting()" class="bg-white/80 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 shadow-sm flex items-center gap-1 disabled:opacity-50">
                        Tạo Timeline ✨
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Row 3: Tags -->
                <div>
                  <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Thẻ Tags (SEO)</label>
                  <div class="flex flex-wrap gap-2 p-4 min-h-[60px] bg-slate-50 rounded-2xl border border-slate-100 shadow-inner mb-2">
                    @for (tag of metadata.tags; track tag) {
                      <span class="bg-white border border-slate-200 px-4 py-1.5 rounded-xl text-xs font-bold text-slate-700 shadow-sm flex items-center gap-2 group">
                        #{{ tag }}
                        <button (click)="removeTag(tag)" class="text-slate-300 hover:text-red-500 transition-colors">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </span>
                    } @empty {
                      <button (click)="askGemini('tags_only')" [disabled]="!file() || isSuggesting()" class="text-slate-400 text-sm italic hover:text-indigo-500 transition-colors disabled:opacity-50">
                        {{ isSuggesting() ? 'Đang phân tích hình ảnh...' : 'Nhấn để AI tự động trích xuất tags từ video...' }}
                      </button>
                    }
                  </div>
                </div>

                <!-- Row 4: Trạng thái hiển thị -->
                <div class="pt-4 border-t border-slate-100">
                  <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Cài đặt hiển thị</label>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    @for (opt of privacyOptions; track opt.id) {
                      <button
                        (click)="metadata.privacyStatus = opt.id"
                        [class.border-red-500]="metadata.privacyStatus === opt.id"
                        [class.bg-red-50]="metadata.privacyStatus === opt.id"
                        [class.text-red-600]="metadata.privacyStatus === opt.id"
                        class="flex items-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold text-sm text-slate-500 bg-white hover:bg-slate-50"
                      >
                        <div class="w-4 h-4 rounded-full border-4 flex-shrink-0" [class.border-red-500]="metadata.privacyStatus === opt.id" [class.border-slate-200]="metadata.privacyStatus !== opt.id"></div>
                        {{ opt.label }}
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-4 space-y-6">
            <div class="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-6 sticky top-8">
              <h2 class="text-sm font-bold text-slate-400 uppercase tracking-widest">Trung tâm xuất bản</h2>

              <div class="space-y-4">
                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span class="text-xs font-bold text-slate-500">Tên file:</span>
                  <span class="text-xs font-black text-slate-700 max-w-[150px] truncate">{{ file()?.name || '---' }}</span>
                </div>
                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span class="text-xs font-bold text-slate-500">Kích thước:</span>
                  <span class="text-xs font-black text-slate-700">{{ fileSizeMb() }} MB</span>
                </div>
                <!-- CẬP NHẬT: Thêm thông tin chế độ hiển thị -->
                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span class="text-xs font-bold text-slate-500">Chế độ hiển thị:</span>
                  <span class="text-xs font-black px-2 py-1 rounded bg-white border border-slate-200" [ngClass]="{
                    'text-green-600': metadata.privacyStatus === 'public',
                    'text-orange-600': metadata.privacyStatus === 'unlisted',
                    'text-slate-600': metadata.privacyStatus === 'private'
                  }">
                    {{ getPrivacyLabel() }}
                  </span>
                </div>
                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span class="text-xs font-bold text-slate-500">Ảnh bìa:</span>
                  <span class="text-xs font-black" [class.text-green-600]="thumbnail()" [class.text-slate-400]="!thumbnail()">{{ thumbnail() ? 'Đã chọn ✅' : 'Chưa có ❌' }}</span>
                </div>
              </div>

              <div class="pt-4">
                @if (uploadStatus() === 'idle') {
                  <button (click)="handleUpload()" [disabled]="!file() || !isAuthenticated() || !metadata.title"
                          class="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-5 rounded-2xl shadow-xl shadow-red-100 transition-all uppercase tracking-widest text-sm active:scale-95">
                    {{ isAuthenticated() ? 'Đưa video lên YouTube' : 'Kết nối YouTube để đăng' }}
                  </button>
                } @else if (uploadStatus() === 'uploading') {
                  <div class="space-y-5 bg-slate-900 p-6 rounded-2xl shadow-xl">
                    <div class="flex justify-between items-end">
                      <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest text-red-400 animate-pulse">Đang tải...</span>
                      <span class="text-2xl font-black text-white italic">{{ progress() }}%</span>
                    </div>
                    <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div class="bg-red-500 h-full transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.5)]" [style.width.%]="progress()"></div>
                    </div>
                  </div>
                } @else if (uploadStatus() === 'success') {
                  <div class="text-center bg-green-50 p-8 rounded-3xl border border-green-100">
                    <div class="bg-green-500 text-white p-4 rounded-full w-fit mx-auto mb-4">
                      <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <p class="font-black text-green-800 text-lg uppercase">Thành công!</p>
                    <button (click)="resetAll()" class="mt-4 text-xs font-bold text-green-600 uppercase hover:underline">Tiếp tục tối ưu video khác</button>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
  `]
})
export class App {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:5000';
  private readonly apiKey = "AIzaSyBvZLI52YsfO3XqiwJ5euYLjpsYYjvUpLA";

  file = signal<File | null>(null);
  thumbnail = signal<File | null>(null);
  thumbnailPreview = signal<string | null>(null);
  dragActive = signal(false);
  uploadStatus = signal<'idle' | 'uploading' | 'success' | 'error'>('idle');
  progress = signal(0);
  error = signal('');
  isAuthenticated = signal(false);
  isSuggesting = signal(false);

  metadata = {
    title: '',
    description: '',
    tags: [] as string[],
    privacyStatus: 'public'
  };

  privacyOptions = [
    { id: 'public', label: 'Công khai' },
    { id: 'unlisted', label: 'Không công khai' },
    { id: 'private', label: 'Riêng tư' }
  ];

  fileSizeMb = computed(() => {
    const f = this.file();
    return f ? (f.size / (1024 * 1024)).toFixed(2) : '0';
  });

  // Cải thiện hàm lấy nhãn hiển thị
  getPrivacyLabel() {
    return this.privacyOptions.find(o => o.id === this.metadata.privacyStatus)?.label || 'Công khai';
  }

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    if (event.data === 'auth_success') {
      this.isAuthenticated.set(true);
    }
  }

  constructor() {
    this.checkAuth();
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  }

  async askGemini(mode: 'suggest_all' | 'title_only' | 'tags_only' | 'summarize' | 'chapters') {
    const videoFile = this.file();
    if (!videoFile) {
      this.error.set('Vui lòng chọn file video để AI có thể phân tích.');
      return;
    }

    this.isSuggesting.set(true);
    this.error.set('');

    try {
      const base64Data = await this.fileToBase64(videoFile);
      const systemPrompt = `Bạn là một chuyên gia YouTube Vision AI. Bạn sẽ được cung cấp một tệp video.
      Nhiệm vụ của bạn là xem video này và tạo Metadata dựa TRỰC TIẾP trên những gì diễn ra trong video.

      BẮT BUỘC trả về JSON với cấu trúc:
      {
        "title": "Tiêu đề hấp dẫn, chuẩn SEO",
        "description": "Mô tả chi tiết nội dung video",
        "tags": ["tag1", "tag2", "tag3"]
      }
      Ngôn ngữ: Tiếng Việt.`;

      let userQuery = "";
      switch(mode) {
        case 'suggest_all': userQuery = "Hãy xem video này và đề xuất tiêu đề, mô tả và bộ tags tối ưu nhất dựa trên nội dung thực tế."; break;
        case 'title_only': userQuery = "Dựa trên nội dung video, hãy đặt một tiêu đề thu hút."; break;
        case 'tags_only': userQuery = "Liệt kê các từ khóa (tags) quan trọng nhất xuất hiện trong video này."; break;
        case 'summarize': userQuery = "Tóm tắt ngắn gọn nội dung video này trong 3 câu."; break;
        case 'chapters': userQuery = "Phân tích video và tạo các mốc thời gian (chapters) quan trọng."; break;
      }

      const result = await this.callGeminiVisionAPI(systemPrompt, userQuery, base64Data, videoFile.type);

      if (result) {
        if (result.title && (mode === 'title_only' || mode === 'suggest_all')) this.metadata.title = result.title;
        if (result.description) this.metadata.description = result.description;
        if (result.tags && Array.isArray(result.tags)) {
          if (mode === 'tags_only' || mode === 'suggest_all') {
            this.metadata.tags = result.tags;
          } else {
            this.metadata.tags = [...new Set([...this.metadata.tags, ...result.tags])];
          }
        }
      }
    } catch (err) {
      this.error.set('Không thể phân tích video. Hãy thử lại.');
      console.error(err);
    } finally {
      this.isSuggesting.set(false);
    }
  }

  private async callGeminiVisionAPI(systemPrompt: string, userQuery: string, base64Data: string, mimeType: string) {
    let retries = 0;
    const delays = [1000, 2000, 4000, 8000, 16000];

    while (retries < 5) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${this.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: userQuery },
                { inlineData: { mimeType: mimeType, data: base64Data } }
              ]
            }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                required: ["title", "description", "tags"],
                properties: {
                  title: { type: "STRING" },
                  description: { type: "STRING" },
                  tags: { type: "ARRAY", items: { type: "STRING" } }
                }
              }
            }
          })
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return JSON.parse(rawText);
      } catch (err) {
        retries++;
        if (retries === 5) throw err;
        await new Promise(r => setTimeout(r, delays[retries-1]));
      }
    }
  }

  checkAuth() {
    this.http.get<{authenticated: boolean}>(`${this.API_URL}/check-auth`).subscribe({
      next: (res) => this.isAuthenticated.set(res.authenticated),
      error: () => this.isAuthenticated.set(false)
    });
  }

  handleLogin() {
    this.http.get<{url: string}>(`${this.API_URL}/auth-url`).subscribe(res => {
      window.open(res.url, 'YouTube Login', 'width=500,height=600');
    });
  }

  handleLogout() {
    this.http.post(`${this.API_URL}/logout`, {}).subscribe({
      next: () => {
        this.isAuthenticated.set(false);
        this.resetAll();
      },
      error: () => this.isAuthenticated.set(false)
    });
  }

  onFileSelected(event: any) {
    const f = event.target.files[0];
    if (f) this.processFile(f);
  }

  onThumbnailSelected(event: any) {
    const f = event.target.files[0];
    if (f && f.type.startsWith('image/')) {
      this.thumbnail.set(f);
      const reader = new FileReader();
      reader.onload = () => this.thumbnailPreview.set(reader.result as string);
      reader.readAsDataURL(f);
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragActive.set(false);
    const f = event.dataTransfer?.files[0];
    if (f) this.processFile(f);
  }

  private processFile(f: File) {
    if (f.type.startsWith('video/')) {
      if (f.size > 20 * 1024 * 1024) {
        this.error.set('File quá lớn (Giới hạn: 20MB).');
        return;
      }
      this.file.set(f);
      this.metadata.title = f.name.replace(/\.[^/.]+$/, "");
      this.error.set('');
    } else {
      this.error.set('Chỉ chấp nhận video.');
    }
  }

  removeTag(tag: string) {
    this.metadata.tags = this.metadata.tags.filter(t => t !== tag);
  }

  handleUpload() {
    const f = this.file();
    if (!f) return;

    this.uploadStatus.set('uploading');
    const formData = new FormData();
    formData.append('video', f);
    formData.append('title', this.metadata.title);
    formData.append('description', this.metadata.description);
    formData.append('privacyStatus', this.metadata.privacyStatus);

    const thumb = this.thumbnail();
    if (thumb) formData.append('thumbnail', thumb);

    if (this.metadata.tags.length > 0) formData.append('tags', this.metadata.tags.join(','));

    this.http.post(`${this.API_URL}/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress.set(Math.round((100 * event.loaded) / event.total));
        } else if (event.type === HttpEventType.Response) {
          this.uploadStatus.set('success');
        }
      },
      error: (err) => {
        this.uploadStatus.set('idle');
        this.error.set(err.error?.error || 'Lỗi tải lên.');
      }
    });
  }

  resetFile() {
    this.file.set(null);
    this.thumbnail.set(null);
    this.thumbnailPreview.set(null);
    this.progress.set(0);
    this.uploadStatus.set('idle');
  }

  resetAll() {
    this.resetFile();
    this.metadata = { title: '', description: '', tags: [], privacyStatus: 'public' };
  }

  onDragOver(e: DragEvent) { e.preventDefault(); this.dragActive.set(true); }
  onDragLeave(e: DragEvent) { e.preventDefault(); this.dragActive.set(false); }
}
