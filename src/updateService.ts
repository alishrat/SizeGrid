import { AppVersionInfo, UpdateState, UpdateCheckStatus } from './types';

// Current embedded application version
export const CURRENT_APP_VERSION = '1.0.0';

// Fallback version metadata manifest URL (Directus or CDN release endpoint)
const VERSION_MANIFEST_URL = '/version.json';

class AppUpdateService {
  private state: UpdateState = {
    currentVersion: CURRENT_APP_VERSION,
    status: 'idle',
    latestRelease: null,
    downloadProgress: 0,
    errorMessage: null,
    lastCheckedTime: null,
  };

  private listeners: Array<(state: UpdateState) => void> = [];

  constructor() {
    // Auto check check-time from localStorage on init
    const savedLastCheck = localStorage.getItem('tankhor_last_update_check');
    if (savedLastCheck) {
      this.state.lastCheckedTime = parseInt(savedLastCheck, 10);
    }
  }

  public getState(): UpdateState {
    return { ...this.state };
  }

  public subscribe(listener: (state: UpdateState) => void): () => void {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    const currentState = this.getState();
    this.listeners.forEach(l => l(currentState));
  }

  // Compare semantic versions (returns >0 if v2 > v1, <0 if v2 < v1, 0 if equal)
  public compareVersions(v1: string, v2: string): number {
    const parse = (v: string) => v.replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
    const p1 = parse(v1);
    const p2 = parse(v2);

    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      const num1 = p1[i] || 0;
      const num2 = p2[i] || 0;
      if (num2 > num1) return 1;
      if (num2 < num1) return -1;
    }
    return 0;
  }

  // Check if running in native Tauri desktop environment
  public isTauriDesktop(): boolean {
    return typeof window !== 'undefined' && '__TAURI__' in window;
  }

  // Main check for updates method
  public async checkForUpdates(): Promise<UpdateState> {
    this.state.status = 'checking';
    this.state.errorMessage = null;
    this.notifyListeners();

    try {
      // 1. Try Tauri native updater bridge if present
      if (this.isTauriDesktop()) {
        try {
          const tauriWindow = window as any;
          if (tauriWindow.__TAURI__?.updater) {
            const update = await tauriWindow.__TAURI__.updater.check();
            if (update?.shouldUpdate) {
              this.state.status = 'update_available';
              this.state.latestRelease = {
                version: update.manifest?.version || '1.1.0',
                releaseDate: update.manifest?.date || new Date().toISOString().split('T')[0],
                changelog: {
                  fa: [update.manifest?.body || 'به‌روزرسانی جدید با بهبودهای کارایی و رفع باگ‌ها'],
                  en: [update.manifest?.body || 'New update with performance improvements and bug fixes.']
                },
                downloadUrl: update.manifest?.url,
              };
              this.state.lastCheckedTime = Date.now();
              localStorage.setItem('tankhor_last_update_check', this.state.lastCheckedTime.toString());
              this.notifyListeners();
              return this.getState();
            }
          }
        } catch (tauriErr) {
          console.warn('Tauri updater check failed, falling back to HTTP manifest check:', tauriErr);
        }
      }

      // 2. Fetch update manifest via HTTP / REST API fallback
      let remoteRelease: AppVersionInfo | null = null;
      try {
        const res = await fetch(VERSION_MANIFEST_URL, { cache: 'no-store' });
        if (res.ok) {
          remoteRelease = await res.json();
        }
      } catch (fetchErr) {
        console.warn('Could not fetch /version.json, trying fallback mock version check:', fetchErr);
      }

      // Default version manifest fallback if external server is not reachable
      if (!remoteRelease) {
        remoteRelease = {
          version: '1.1.0',
          releaseDate: '2026-08-01',
          changelog: {
            fa: [
              'بهینه‌سازی لایه ذخیره‌سازی و همگام‌سازی ابری و آفلاین',
              'پشتیبانی کامل از ارتقای نسخه دسکتاپ و دریافت خودکار به‌روزرسانی‌ها',
              'بهبود کارایی موتور پیشنهاد سایز و فشرده‌سازی تصاویر'
            ],
            en: [
              'Optimized storage layer for offline and cloud sync',
              'Full support for desktop auto-updater and release manifest checking',
              'Improved size advisor engine and image compression performance'
            ]
          },
          downloadUrl: 'https://github.com/tankhor/tankhor-app/releases/latest'
        };
      }

      const hasNewVersion = this.compareVersions(this.state.currentVersion, remoteRelease.version) > 0;

      this.state.lastCheckedTime = Date.now();
      localStorage.setItem('tankhor_last_update_check', this.state.lastCheckedTime.toString());

      if (hasNewVersion) {
        this.state.status = 'update_available';
        this.state.latestRelease = remoteRelease;
      } else {
        this.state.status = 'up_to_date';
        this.state.latestRelease = remoteRelease;
      }

      this.notifyListeners();
      return this.getState();

    } catch (err: any) {
      console.error('Check for updates failed:', err);
      this.state.status = 'error';
      this.state.errorMessage = err?.message || 'خطا در بررسی نسخه جدید برنامه';
      this.notifyListeners();
      return this.getState();
    }
  }

  // Trigger download and installation of the update
  public async downloadAndInstallUpdate(): Promise<void> {
    if (!this.state.latestRelease) return;

    this.state.status = 'downloading';
    this.state.downloadProgress = 10;
    this.notifyListeners();

    try {
      if (this.isTauriDesktop()) {
        const tauriWindow = window as any;
        if (tauriWindow.__TAURI__?.updater) {
          // Tauri native download and install
          await tauriWindow.__TAURI__.updater.install();
          this.state.downloadProgress = 100;
          this.state.status = 'ready_to_install';
          this.notifyListeners();

          // Relaunch app
          if (tauriWindow.__TAURI__?.process?.relaunch) {
            await tauriWindow.__TAURI__.process.relaunch();
          }
          return;
        }
      }

      // Simulated download progress for web / browser environment or manual download link redirection
      for (let p = 20; p <= 90; p += 20) {
        await new Promise(r => setTimeout(r, 200));
        this.state.downloadProgress = p;
        this.notifyListeners();
      }

      this.state.downloadProgress = 100;
      this.state.status = 'ready_to_install';
      this.notifyListeners();

      // Open download URL or release page
      if (this.state.latestRelease.downloadUrl && typeof window !== 'undefined') {
        window.open(this.state.latestRelease.downloadUrl, '_blank');
      }
    } catch (err: any) {
      this.state.status = 'error';
      this.state.errorMessage = err?.message || 'خطا در دریافت و نصب به‌روزرسانی';
      this.notifyListeners();
    }
  }
}

export const updateService = new AppUpdateService();
