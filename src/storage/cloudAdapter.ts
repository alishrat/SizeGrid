import { Product, Category, Size, Color, SizeGuideTemplate, InventoryItem, ClothingTypeSlug, DiffSyncPayload } from '../types';
import { DirectusAPI } from '../directus';
import { IStorageAdapter, StorageMode, SyncQueueItem, SyncStats } from './types';

export class DirectusCloudAdapter implements IStorageAdapter {
  private mode: StorageMode = 'cloud_synced';

  getMode(): StorageMode {
    return this.mode;
  }

  setMode(mode: StorageMode): void {
    this.mode = mode;
  }

  async getProducts(): Promise<Product[]> {
    return DirectusAPI.getProducts();
  }

  async getProductById(id: number): Promise<Product | null> {
    const products = await DirectusAPI.getProducts();
    return products.find(p => p.id === id) || null;
  }

  async saveProduct(product: Partial<Product> & { name_fa: string; base_price: number }): Promise<Product> {
    if (product.id) {
      return DirectusAPI.updateProduct(product.id, product);
    } else {
      return DirectusAPI.addProduct(product as any);
    }
  }

  async deleteProduct(id: number): Promise<boolean> {
    await DirectusAPI.deleteProduct(id);
    return true;
  }

  async getCategories(): Promise<Category[]> {
    return DirectusAPI.getCategories();
  }

  async saveCategory(name: string, systemType: number = 1, clothingTypeSlug: ClothingTypeSlug = 'tops'): Promise<Category> {
    return DirectusAPI.createCategory(name, systemType, clothingTypeSlug);
  }

  async deleteCategory(id: number): Promise<boolean> {
    await DirectusAPI.deleteCategory(id);
    return true;
  }

  async getSizes(): Promise<Size[]> {
    return DirectusAPI.getSizes();
  }

  async saveSize(name: string, sortOrder: number = 10): Promise<Size> {
    return DirectusAPI.createSize(name, sortOrder);
  }

  async getColors(): Promise<Color[]> {
    return DirectusAPI.getColors();
  }

  async saveColor(nameFa: string, nameEn: string, hexCode: string): Promise<Color> {
    const colors = await DirectusAPI.getColors();
    const existing = colors.find(c => c.name_fa === nameFa);
    if (existing) return existing;
    return {
      id: Math.floor(Math.random() * 1000) + 100,
      name_fa: nameFa,
      name_en: nameEn || nameFa,
      hex_code: hexCode
    };
  }

  async getSizeGuideTemplates(): Promise<SizeGuideTemplate[]> {
    return DirectusAPI.getSizeGuideTemplates();
  }

  async saveSizeGuideTemplate(template: Omit<SizeGuideTemplate, 'id'> & { id?: number }): Promise<SizeGuideTemplate> {
    if (template.id) {
      return DirectusAPI.createSizeGuideTemplate(template.name, template.measurements || [], template.clothing_type_slug || 'tops');
    } else {
      return DirectusAPI.createSizeGuideTemplate(template.name, template.measurements || [], template.clothing_type_slug || 'tops');
    }
  }

  async deleteSizeGuideTemplate(id: number): Promise<boolean> {
    await DirectusAPI.deleteSizeGuideTemplate(id);
    return true;
  }

  async getInventory(productId?: number): Promise<InventoryItem[]> {
    if (productId !== undefined) {
      return DirectusAPI.getInventoryForProduct(productId);
    }
    return DirectusAPI.getAllInventory();
  }

  async updateInventory(items: InventoryItem[]): Promise<boolean> {
    if (items.length === 0) return true;
    const productId = items[0].product_id;
    await DirectusAPI.syncInventory(productId, items);
    return true;
  }

  async syncInventoryDiff(productId: number, payload: DiffSyncPayload): Promise<boolean> {
    const current = await DirectusAPI.getInventoryForProduct(productId);
    let updated = [...current];

    if (payload.delete && payload.delete.length > 0) {
      updated = updated.filter(i => !payload.delete.includes(i.id));
    }
    if (payload.update && payload.update.length > 0) {
      for (const u of payload.update) {
        const idx = updated.findIndex(i => i.id === u.id);
        if (idx !== -1) updated[idx] = { ...updated[idx], ...u };
      }
    }
    if (payload.create && payload.create.length > 0) {
      for (const c of payload.create) {
        updated.push({
          id: 0,
          product_id: productId,
          color_id: c.color_id,
          size_id: c.size_id,
          stock: c.stock || 0,
          price: c.price || 0
        });
      }
    }

    await DirectusAPI.syncInventory(productId, updated);
    return true;
  }

  getPendingSyncQueue(): SyncQueueItem[] {
    return [];
  }

  clearPendingSyncQueue(): void {}

  getSyncStats(): SyncStats {
    return {
      mode: this.mode,
      isOnline: navigator.onLine,
      pendingCount: 0,
      lastSyncTime: Date.now(),
      syncInProgress: false,
      lastError: null
    };
  }
}
