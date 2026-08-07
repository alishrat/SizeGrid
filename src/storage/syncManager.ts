import { LocalStorageAdapter } from './localAdapter';
import { DirectusCloudAdapter } from './cloudAdapter';
import { IStorageAdapter, StorageMode, SyncStats, SyncQueueItem } from './types';
import { Product, Category, Size, Color, SizeGuideTemplate, InventoryItem, ClothingTypeSlug, DiffSyncPayload, Order, CreateOrderInput, OrderStatus } from '../types';
import { DirectusAPI } from '../directus';

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
      window.addEventListener('online', () => {
        if (this.activeMode === 'cloud_synced') {
          this.syncLocalToCloud().catch(() => {});
        } else {
          this.notifyListeners();
        }
      });
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
    if (mode === 'cloud_synced') {
      this.syncLocalToCloud().catch(err => console.warn('Sync error on mode switch:', err));
    }
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

    let syncedCount = 0;

    try {
      // 1. Fetch current cloud state and local state
      const [cloudProds, localProds, cloudCats, localCats, cloudTpls, localTpls, localInventory] = await Promise.all([
        this.cloudAdapter.getProducts().catch(() => []),
        this.localAdapter.getProducts().catch(() => []),
        this.cloudAdapter.getCategories().catch(() => []),
        this.localAdapter.getCategories().catch(() => []),
        this.cloudAdapter.getSizeGuideTemplates().catch(() => []),
        this.localAdapter.getSizeGuideTemplates().catch(() => []),
        this.localAdapter.getInventory().catch(() => [])
      ]);

      // 2. Sync Categories created locally
      const catIdMap = new Map<number, number>(); // localId -> cloudId
      for (const lc of localCats) {
        const cloudCatMatch = cloudCats.find(cc => cc.id === lc.id || cc.name === lc.name || cc.name_fa === lc.name);
        if (cloudCatMatch) {
          catIdMap.set(lc.id, cloudCatMatch.id);
        } else {
          try {
            const savedCat = await DirectusAPI.createCategory(lc.name, lc.system_type, lc.clothing_type_slug);
            catIdMap.set(lc.id, savedCat.id);
            syncedCount++;
          } catch (e) {
            console.warn('Failed to push local category to cloud:', e);
          }
        }
      }

      // 3. Sync Size Guide Templates created locally
      const tplIdMap = new Map<number, number>(); // localId -> cloudId
      for (const lt of localTpls) {
        const cloudTplMatch = cloudTpls.find(ct => ct.id === lt.id || ct.name === lt.name);
        if (cloudTplMatch) {
          tplIdMap.set(lt.id, cloudTplMatch.id);
        } else {
          try {
            const savedTpl = await DirectusAPI.createSizeGuideTemplate(lt.name, lt.measurements || [], lt.clothing_type_slug || 'tops');
            tplIdMap.set(lt.id, savedTpl.id);
            syncedCount++;
          } catch (e) {
            console.warn('Failed to push local template to cloud:', e);
          }
        }
      }

      // 4. Sync Products and Inventory
      const prodIdMap = new Map<number, number>(); // localProductId -> cloudProductId

      for (const lp of localProds) {
        const resolvedCatId = lp.category_id ? (catIdMap.get(lp.category_id) || lp.category_id) : undefined;
        const resolvedTplId = lp.size_guide_template_id ? (tplIdMap.get(lp.size_guide_template_id) || lp.size_guide_template_id) : undefined;

        let cloudMatch = cloudProds.find(cp => cp.id === lp.id);
        if (!cloudMatch) {
          cloudMatch = cloudProds.find(cp => cp.name_fa === lp.name_fa || cp.name_en === lp.name_fa);
        }

        let finalCloudProduct: Product | null = null;

        if (cloudMatch) {
          try {
            finalCloudProduct = await DirectusAPI.updateProduct(cloudMatch.id, {
              ...lp,
              category_id: resolvedCatId,
              size_guide_template_id: resolvedTplId
            });
            syncedCount++;
          } catch (e) {
            try {
              finalCloudProduct = await DirectusAPI.addProduct({
                name_fa: lp.name_fa,
                name_en: lp.name_en || lp.name_fa,
                description_fa: lp.description_fa,
                description_en: lp.description_en,
                base_price: lp.base_price,
                category: lp.category,
                category_id: resolvedCatId,
                clothing_type_slug: lp.clothing_type_slug,
                image: lp.image,
                size_guide_template_id: resolvedTplId
              });
              syncedCount++;
            } catch (addErr) {
              console.warn('Failed to add product to cloud:', addErr);
            }
          }
        } else {
          try {
            finalCloudProduct = await DirectusAPI.addProduct({
              name_fa: lp.name_fa,
              name_en: lp.name_en || lp.name_fa,
              description_fa: lp.description_fa,
              description_en: lp.description_en,
              base_price: lp.base_price,
              category: lp.category,
              category_id: resolvedCatId,
              clothing_type_slug: lp.clothing_type_slug,
              image: lp.image,
              size_guide_template_id: resolvedTplId
            });
            syncedCount++;
          } catch (addErr) {
            console.warn('Failed to add product to cloud:', addErr);
          }
        }

        if (finalCloudProduct) {
          prodIdMap.set(lp.id, finalCloudProduct.id);

          // Push local inventory matrix items for this product
          const prodInv = localInventory.filter(inv => inv.product_id === lp.id);
          if (prodInv.length > 0) {
            try {
              const mappedInv = prodInv.map(inv => ({
                ...inv,
                product_id: finalCloudProduct!.id
              }));
              await DirectusAPI.syncInventory(finalCloudProduct.id, mappedInv);
              syncedCount++;
            } catch (e) {
              console.warn(`Failed to sync inventory for product ${finalCloudProduct.id}:`, e);
            }
          }
        }
      }

      // 5. Sync Orders created locally
      const localOrders = await this.localAdapter.getOrders().catch(() => []);
      const cloudOrders = await DirectusAPI.getOrders().catch(() => []);
      for (const lo of localOrders) {
        const cloudOrderMatch = cloudOrders.find(co => co.id === lo.id);
        if (!cloudOrderMatch && lo.order_items && lo.order_items.length > 0) {
          try {
            await DirectusAPI.createOrder({
              status: lo.status,
              order_total: lo.order_total,
              items: lo.order_items.map(item => ({
                item_inventory: item.item_inventory,
                item_quantity: item.item_quantity,
                item_price: item.item_price
              }))
            });
            syncedCount++;
          } catch (e) {
            console.warn('Failed to push local order to cloud:', e);
          }
        }
      }

      // 6. Clear pending sync queue
      this.localAdapter.clearPendingSyncQueue();

      // 6. Fetch fresh full dataset from Cloud and sync local storage cache
      const [freshProds, freshCats, freshSizes, freshColors, freshTpls, freshInv] = await Promise.all([
        DirectusAPI.getProducts().catch(() => []),
        DirectusAPI.getCategories().catch(() => []),
        DirectusAPI.getSizes().catch(() => []),
        DirectusAPI.getColors().catch(() => []),
        DirectusAPI.getSizeGuideTemplates().catch(() => []),
        DirectusAPI.getAllInventory().catch(() => [])
      ]);

      if (freshProds.length > 0) this.localAdapter.setProductsCache(freshProds);
      if (freshCats.length > 0) this.localAdapter.setCategoriesCache(freshCats);
      if (freshSizes.length > 0) this.localAdapter.setSizesCache(freshSizes);
      if (freshColors.length > 0) this.localAdapter.setColorsCache(freshColors);
      if (freshTpls.length > 0) this.localAdapter.setTemplatesCache(freshTpls);
      if (freshInv.length > 0) this.localAdapter.setInventoryCache(freshInv);

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

  async deleteSize(id: number): Promise<boolean> {
    const res = await this.activeAdapter.deleteSize(id);
    this.notifyListeners();
    return res;
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

  // --- ORDERS ---
  async getOrders(): Promise<Order[]> {
    return this.activeAdapter.getOrders();
  }

  async getOrderById(id: number): Promise<Order | null> {
    return this.activeAdapter.getOrderById(id);
  }

  async createOrder(orderInput: CreateOrderInput): Promise<Order> {
    const order = await this.activeAdapter.createOrder(orderInput);
    this.notifyListeners();
    return order;
  }

  async updateOrderStatus(id: number, status: OrderStatus | string): Promise<boolean> {
    const res = await this.activeAdapter.updateOrderStatus(id, status);
    this.notifyListeners();
    return res;
  }

  async deleteOrder(id: number): Promise<boolean> {
    const res = await this.activeAdapter.deleteOrder(id);
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
