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
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div class="flex items-center gap-3">
            <div class="bg-red-600 p-2 rounded-lg">
              <svg class="text-white w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold">YouTube Uploader (Angular)</h1>
              <p class="text-slate-500 text-sm">Tải video trực tiếp lên kênh của bạn</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            @if (isAuthenticated()) {
              <div class="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
                <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span class="text-sm font-medium">Đã kết nối</span>
              </div>
            } @else {
              <button 
                (click)="handleLogin()"
                [disabled]="isAuthenticating()"
                class="flex items-center gap-2 bg-white border border-slate-300 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                @if (isAuthenticating()) {
                   <svg class="animate-spin h-4 w-4 text-slate-500" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                } @else {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                }
                Kết nối YouTube
              </button>
            }
          </div>
        </header>

        <!-- Error Message -->
        @if (error()) {
          <div class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-sm">{{ error() }}</p>
          </div>
        }

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-6">
            <!-- Drop Zone -->
            <div 
              class="relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center min-h-[300px] bg-white"
              [class.border-red-500]="dragActive()"
              [class.bg-red-50]="dragActive()"
              [class.border-slate-300]="!dragActive()"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
            >
              @if (!file()) {
                <div class="bg-slate-100 p-4 rounded-full mb-4">
                  <svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold mb-1">Chọn video để bắt đầu</h3>
                <label class="mt-4 cursor-pointer bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors shadow-sm text-center">
                  CHỌN TỆP
                  <input type="file" class="hidden" accept="video/*" (change)="onFileSelected($event)" />
                </label>
              } @else {
                <div class="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div class="bg-red-100 p-3 rounded-lg">
                    <svg class="text-red-600 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-slate-800 truncate">{{ file()?.name }}</p>
                    <p class="text-xs text-slate-500">{{ fileSizeMb() }} MB</p>
                  </div>
                  <button (click)="resetFile()" class="text-xs font-bold text-red-600 uppercase hover:underline">Thay đổi</button>
                </div>
              }
            </div>

            <!-- Metadata Form -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6"
                 [class.opacity-50]="!file() || uploadStatus() === 'uploading'"
                 [class.pointer-events-none]="!file() || uploadStatus() === 'uploading'">
              <h2 class="text-xl font-bold">Thông tin video</h2>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-1">Tiêu đề</label>
                  <input type="text" [(ngModel)]="metadata.title" class="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-red-500 outline-none transition-all" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-1">Mô tả</label>
                  <textarea rows="4" [(ngModel)]="metadata.description" class="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-red-500 outline-none resize-none"></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar Actions -->
          <div class="space-y-6">
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
                 [class.opacity-50]="!file()"
                 [class.pointer-events-none]="!file()">
              <h2 class="text-lg font-bold mb-4">Chế độ hiển thị</h2>
              <div class="space-y-3">
                @for (item of privacyOptions; track item.id) {
                  <label class="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all"
                         [class.border-red-500]="metadata.privacyStatus === item.id"
                         [class.bg-red-50]="metadata.privacyStatus === item.id"
                         [class.border-transparent]="metadata.privacyStatus !== item.id">
                    <input type="radio" name="privacy" [value]="item.id" [(ngModel)]="metadata.privacyStatus" class="accent-red-600" />
                    <span class="text-sm font-medium">{{ item.label }}</span>
                  </label>
                }
              </div>

              <div class="mt-8">
                @if (uploadStatus() === 'idle' || uploadStatus() === 'error') {
                  <button (click)="handleUpload()" [disabled]="!file() || !isAuthenticated()" 
                          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-md shadow transition-all uppercase">
                    {{ isAuthenticated() ? 'Tải lên Youtube' : 'Cần kết nối Youtube' }}
                  </button>
                } @else if (uploadStatus() === 'uploading') {
                  <div class="space-y-3">
                    <div class="flex justify-between text-sm font-semibold">
                      <span>Đang xử lý...</span>
                      <span>{{ progress() }}%</span>
                    </div>
                    <div class="w-full bg-slate-200 rounded-full h-2">
                      <div class="bg-blue-600 h-2 rounded-full transition-all" [style.width.%]="progress()"></div>
                    </div>
                    <p class="text-[10px] text-center text-slate-500 uppercase tracking-tighter animate-pulse">
                      Đang truyền tải dữ liệu trực tiếp đến Google
                    </p>
                  </div>
                } @else if (uploadStatus() === 'success') {
                  <div class="text-center space-y-3">
                    <div class="bg-green-100 p-3 rounded-full w-fit mx-auto">
                      <svg class="text-green-600 w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <p class="font-bold text-green-800 uppercase tracking-wide">Thành công!</p>
                    <button (click)="resetAll()" class="text-xs font-bold text-slate-500 border-b border-slate-300 pb-1 uppercase hover:text-slate-700">
                      Tải lên video khác
                    </button>
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
  private readonly API_BASE_URL = 'http://localhost:5000';

  // State using Signals
  file = signal<File | null>(null);
  dragActive = signal(false);
  uploadStatus = signal<'idle' | 'uploading' | 'success' | 'error'>('idle');
  error = signal('');
  progress = signal(0);
  
  // Auth state
  isAuthenticated = signal(false);
  isAuthenticating = signal(false);
  
  metadata = {
    title: '',
    description: '',
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

  // Lắng nghe thông điệp từ pop-up (khi backend redirect về 1 trang success)
  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    // Trong thực tế, bạn nên kiểm tra event.origin để bảo mật
    if (event.data === 'auth_success') {
      this.isAuthenticated.set(true);
      this.isAuthenticating.set(false);
    }
  }

  handleLogin() {
    this.isAuthenticating.set(true);
    this.http.get<{ url: string }>(`${this.API_BASE_URL}/auth-url`).subscribe({
      next: (res) => {
        // Mở cửa sổ pop-up thay vì nhảy trang hiện tại
        const width = 500;
        const height = 600;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        const popup = window.open(
          res.url, 
          'YouTube Auth', 
          `width=${width},height=${height},top=${top},left=${left}`
        );

        // Kiểm tra xem pop-up có bị chặn không
        if (!popup) {
          this.error.set('Pop-up bị chặn. Vui lòng cho phép trình duyệt mở cửa sổ mới.');
          this.isAuthenticating.set(false);
          return;
        }

        // Tạm thời giả định thành công sau khi mở (hoặc đợi backend redirect về 1 trang báo thành công)
        // Để luồng này hoàn hảo, Backend redirect_uri nên trỏ về một file HTML nhỏ 
        // chứa script: <script>window.opener.postMessage('auth_success', '*'); window.close();</script>
        const checkPopup = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkPopup);
            this.isAuthenticating.set(false);
            // Kiểm tra lại trạng thái auth từ server nếu cần
            this.checkAuthStatus();
          }
        }, 1000);
      },
      error: () => {
        this.error.set('Không thể lấy URL xác thực.');
        this.isAuthenticating.set(false);
      }
    });
  }

  checkAuthStatus() {
    // Một API endpoint giả định để check xem session đã có token chưa
    this.http.get<{ authenticated: boolean }>(`${this.API_BASE_URL}/check-auth`).subscribe({
      next: (res) => this.isAuthenticated.set(res.authenticated),
      error: () => this.isAuthenticated.set(false)
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragActive.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragActive.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragActive.set(false);
    
    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles && droppedFiles.length > 0) {
      this.processFile(droppedFiles[0]);
    }
  }

  onFileSelected(event: any) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      this.processFile(selectedFile);
    }
  }

  private processFile(f: File) {
    if (f.type.startsWith('video/')) {
      this.file.set(f);
      if (!this.metadata.title) {
        this.metadata.title = f.name.split('.')[0];
      }
      this.error.set('');
    } else {
      this.error.set('Vui lòng chọn định dạng video hợp lệ.');
    }
  }

  resetFile() {
    this.file.set(null);
    this.uploadStatus.set('idle');
    this.progress.set(0);
  }

  resetAll() {
    this.resetFile();
    this.metadata = { title: '', description: '', privacyStatus: 'public' };
  }

  handleUpload() {
    const currentFile = this.file();
    if (!currentFile || !this.isAuthenticated()) return;

    this.uploadStatus.set('uploading');
    this.error.set('');
    this.progress.set(0);

    const formData = new FormData();
    formData.append('video', currentFile);
    formData.append('title', this.metadata.title);
    formData.append('description', this.metadata.description);
    formData.append('privacyStatus', this.metadata.privacyStatus);

    this.http.post(`${this.API_BASE_URL}/upload`, formData, {
      reportProgress: true,
      observe: 'events',
      withCredentials: true // Quan trọng để gửi session cookie chứa token
    }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress.set(Math.round((event.loaded / event.total) * 100));
        } else if (event.type === HttpEventType.Response) {
          this.uploadStatus.set('success');
        }
      },
      error: (err) => {
        this.uploadStatus.set('error');
        const errorMsg = err.error?.error || 'Tải lên thất bại. Vui lòng kiểm tra lại kết nối.';
        this.error.set(errorMsg);
      }
    });
  }
}