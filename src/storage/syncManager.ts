import { LocalStorageAdapter } from './localAdapter';
import { DirectusCloudAdapter } from './cloudAdapter';
import { IStorageAdapter, StorageMode, SyncStats, SyncQueueItem } from './types';
import { Product, Category, Size, Color, SizeGuideTemplate, InventoryItem, ClothingTypeSlug, DiffSyncPayload } from '../types';

export class StorageSyncManager implements IStorageAdapter {
  private localAdapter: LocalStorageAdapter;
  private cloudAdapter: DirectusCloudAdapter;
  private activeMode: StorageMode = 'local_offline';
  private syncListeners: Array<(stats: SyncStats) => void> = [];
  private syncInProgress: boolean = false;
  private lastError: string | null = null;

  constructor() {
    this.localAdapter = new LocalStorageAdapter();
    this.cloudAdapter = new DirectusCloudAdapter();
    this.activeMode = this.localAdapter.getMode();

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.notifyListeners());
      window.addEventListener('offline', () => this.notifyListeners());
    }
  }

  // --- LISTENER REGISTRATION FOR UI BADGES & NOTIFICATIONS ---
  subscribe(listener: (stats: SyncStats) => void): () => void {
    this.syncListeners.push(listener);
    listener(this.getSyncStats());
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    const stats = this.getSyncStats();
    this.syncListeners.forEach(listener => listener(stats));
  }

  // --- STORAGE MODE MANAGEMENT ---
  getMode(): StorageMode {
    return this.activeMode;
  }

  setMode(mode: StorageMode): void {
    this.activeMode = mode;
    this.localAdapter.setMode(mode);
    this.cloudAdapter.setMode(mode);
    this.notifyListeners();
  }

  private get activeAdapter(): IStorageAdapter {
    // If set to cloud_synced but offline, fallback to localAdapter
    if (this.activeMode === 'cloud_synced' && typeof navigator !== 'undefined' && !navigator.onLine) {
      return this.localAdapter;
    }
    return this.activeMode === 'cloud_synced' ? this.cloudAdapter : this.localAdapter;
  }

  // --- HYBRID CLOUD SYNC OPERATION ---
  async syncLocalToCloud(): Promise<{ success: boolean; syncedCount: number; error?: string }> {
    if (this.syncInProgress) {
      return { success: false, syncedCount: 0, error: 'همگام‌سازی در حال انجام است.' };
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { success: false, syncedCount: 0, error: 'دستگاه به اینترنت متصل نیست.' };
    }

    this.syncInProgress = true;
    this.lastError = null;
    this.notifyListeners();

    const queue = this.localAdapter.getPendingSyncQueue();
    let syncedCount = 0;

    try {
      for (const item of queue) {
        try {
          if (item.entityType === 'product') {
            if (item.operation === 'create' || item.operation === 'update') {
              await this.cloudAdapter.saveProduct(item.payload);
            } else if (item.operation === 'delete') {
              await this.cloudAdapter.deleteProduct(Number(item.entityId));
            }
          } else if (item.entityType === 'category') {
            if (item.operation === 'create') {
              await this.cloudAdapter.saveCategory(item.payload.name, item.payload.system_type, item.payload.clothing_type_slug);
            } else if (item.operation === 'delete') {
              await this.cloudAdapter.deleteCategory(Number(item.entityId));
            }
          } else if (item.entityType === 'size_template') {
            if (item.operation === 'create' || item.operation === 'update') {
              await this.cloudAdapter.saveSizeGuideTemplate(item.payload);
            } else if (item.operation === 'delete') {
              await this.cloudAdapter.deleteSizeGuideTemplate(Number(item.entityId));
            }
          } else if (item.entityType === 'inventory') {
            if (typeof item.payload === 'object' && 'create' in item.payload) {
              await this.cloudAdapter.syncInventoryDiff(Number(item.entityId), item.payload);
            }
          }
          syncedCount++;
        } catch (err: any) {
          console.warn(`Error syncing queue item ${item.id}:`, err);
        }
      }

      // Clear sync queue on local adapter after sync attempt
      this.localAdapter.clearPendingSyncQueue();
      localStorage.setItem('tankhor_local_last_sync_time', Date.now().toString());

      return { success: true, syncedCount };
    } catch (err: any) {
      this.lastError = err?.message || 'خطا در همگام‌سازی با کلود';
      return { success: false, syncedCount, error: this.lastError || undefined };
    } finally {
      this.syncInProgress = false;
      this.notifyListeners();
    }
  }

  // --- DELEGATE STORAGE CALLS TO ACTIVE ADAPTER ---
  async getProducts(): Promise<Product[]> {
    return this.activeAdapter.getProducts();
  }

  async getProductById(id: number): Promise<Product | null> {
    return this.activeAdapter.getProductById(id);
  }

  async saveProduct(product: Partial<Product> & { name_fa: string; base_price: number }): Promise<Product> {
    const saved = await this.activeAdapter.saveProduct(product);
    this.notifyListeners();
    return saved;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const res = await this.activeAdapter.deleteProduct(id);
    this.notifyListeners();
    return res;
  }

  async getCategories(): Promise<Category[]> {
    return this.activeAdapter.getCategories();
  }

  async saveCategory(name: string, systemType: number = 1, clothingTypeSlug: ClothingTypeSlug = 'tops'): Promise<Category> {
    const cat = await this.activeAdapter.saveCategory(name, systemType, clothingTypeSlug);
    this.notifyListeners();
    return cat;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const res = await this.activeAdapter.deleteCategory(id);
    this.notifyListeners();
    return res;
  }

  async getSizes(): Promise<Size[]> {
    return this.activeAdapter.getSizes();
  }

  async saveSize(name: string, sortOrder: number = 10): Promise<Size> {
    const size = await this.activeAdapter.saveSize(name, sortOrder);
    this.notifyListeners();
    return size;
  }

  async getColors(): Promise<Color[]> {
    return this.activeAdapter.getColors();
  }

  async saveColor(nameFa: string, nameEn: string, hexCode: string): Promise<Color> {
    const color = await this.activeAdapter.saveColor(nameFa, nameEn, hexCode);
    this.notifyListeners();
    return color;
  }

  async getSizeGuideTemplates(): Promise<SizeGuideTemplate[]> {
    return this.activeAdapter.getSizeGuideTemplates();
  }

  async saveSizeGuideTemplate(template: Omit<SizeGuideTemplate, 'id'> & { id?: number }): Promise<SizeGuideTemplate> {
    const res = await this.activeAdapter.saveSizeGuideTemplate(template);
    this.notifyListeners();
    return res;
  }

  async deleteSizeGuideTemplate(id: number): Promise<boolean> {
    const res = await this.activeAdapter.deleteSizeGuideTemplate(id);
    this.notifyListeners();
    return res;
  }

  async getInventory(productId?: number): Promise<InventoryItem[]> {
    return this.activeAdapter.getInventory(productId);
  }

  async updateInventory(items: InventoryItem[]): Promise<boolean> {
    const res = await this.activeAdapter.updateInventory(items);
    this.notifyListeners();
    return res;
  }

  async syncInventoryDiff(productId: number, payload: DiffSyncPayload): Promise<boolean> {
    const res = await this.activeAdapter.syncInventoryDiff(productId, payload);
    this.notifyListeners();
    return res;
  }

  getPendingSyncQueue(): SyncQueueItem[] {
    return this.localAdapter.getPendingSyncQueue();
  }

  clearPendingSyncQueue(): void {
    this.localAdapter.clearPendingSyncQueue();
    this.notifyListeners();
  }

  getSyncStats(): SyncStats {
    const localStats = this.localAdapter.getSyncStats();
    return {
      mode: this.activeMode,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      pendingCount: localStats.pendingCount,
      lastSyncTime: localStats.lastSyncTime,
      syncInProgress: this.syncInProgress,
      lastError: this.lastError
    };
  }
}

export const storageManager = new StorageSyncManager();
