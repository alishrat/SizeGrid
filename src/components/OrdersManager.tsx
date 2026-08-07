import React, { useState, useEffect } from 'react';
import { storageManager } from '../storage/index';
import { Order, OrderItem, Product, InventoryItem, Color, Size, CreateOrderItemInput, OrderStatus } from '../types';
import { ShoppingCart, Plus, Trash2, Eye, Printer, CheckCircle2, AlertCircle, Search, Receipt, Package, X, RefreshCw, Layers } from 'lucide-react';

interface OrdersManagerProps {
  t: (key: string) => string;
  lang: 'fa' | 'en';
}

interface DraftCartItem {
  id: string; // temp unique id
  inventory_id: number;
  product_id: number;
  product_name: string;
  color_name: string;
  color_hex?: string;
  size_name: string;
  quantity: number;
  price: number;
  available_stock: number;
}

export const OrdersManager: React.FC<OrdersManagerProps> = ({ t, lang }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Modals & Views
  const [showNewOrderModal, setShowNewOrderModal] = useState<boolean>(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  // New Order Form state
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [selectedInventoryId, setSelectedInventoryId] = useState<number | ''>('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemUnitPrice, setItemUnitPrice] = useState<number>(0);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('published');
  const [draftCart, setDraftCart] = useState<DraftCartItem[]>([]);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [fetchedOrders, fetchedProds, fetchedInv, fetchedColors, fetchedSizes] = await Promise.all([
        storageManager.getOrders(),
        storageManager.getProducts(),
        storageManager.getInventory(),
        storageManager.getColors(),
        storageManager.getSizes()
      ]);

      setOrders(fetchedOrders);
      setProducts(fetchedProds);
      setInventory(fetchedInv);
      setColors(fetchedColors);
      setSizes(fetchedSizes);
    } catch (err) {
      console.error("Error loading order management data:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper resolvers for displaying inventory items
  const resolveInventoryDetails = (invId: number) => {
    const inv = inventory.find(i => i.id === invId);
    if (!inv) return null;
    const prod = products.find(p => p.id === inv.product_id);
    const col = colors.find(c => c.id === inv.color_id);
    const sz = sizes.find(s => s.id === inv.size_id);
    return {
      inv,
      productName: prod ? (lang === 'fa' ? prod.name_fa : prod.name_en || prod.name_fa) : `کالا کد ${inv.product_id}`,
      colorName: col ? col.name_fa : `رنگ کد ${inv.color_id}`,
      colorHex: col?.hex_code,
      sizeName: sz ? sz.name : `سایز کد ${inv.size_id}`,
      stock: inv.stock,
      price: inv.price || prod?.base_price || 0
    };
  };

  // Available inventory variants for currently selected product
  const availableProductVariants = selectedProductId
    ? inventory.filter(inv => inv.product_id === Number(selectedProductId))
    : [];

  const handleProductChange = (prodId: number) => {
    setSelectedProductId(prodId);
    setSelectedInventoryId('');
    setItemQuantity(1);
    
    // Auto-select first variant if available
    const vars = inventory.filter(i => i.product_id === prodId);
    if (vars.length > 0) {
      const firstVar = vars[0];
      setSelectedInventoryId(firstVar.id);
      const prod = products.find(p => p.id === prodId);
      setItemUnitPrice(firstVar.price || prod?.base_price || 0);
    }
  };

  const handleVariantChange = (invId: number) => {
    setSelectedInventoryId(invId);
    const details = resolveInventoryDetails(invId);
    if (details) {
      setItemUnitPrice(details.price);
    }
  };

  const handleAddItemToCart = () => {
    if (!selectedInventoryId) {
      showToast('لطفاً یک متغیر رنگ و سایز انتخاب کنید.', 'error');
      return;
    }
    const details = resolveInventoryDetails(Number(selectedInventoryId));
    if (!details) return;

    if (itemQuantity <= 0) {
      showToast('تعداد باید حداقل ۱ باشد.', 'error');
      return;
    }

    if (itemQuantity > details.stock) {
      showToast(`${t('insufficient_stock')} (موجودی فعلی: ${details.stock})`, 'error');
      return;
    }

    // Check if item already exists in draft cart
    const existingIndex = draftCart.findIndex(c => c.inventory_id === Number(selectedInventoryId));
    if (existingIndex !== -1) {
      const newQty = draftCart[existingIndex].quantity + itemQuantity;
      if (newQty > details.stock) {
        showToast(`مجموع تعداد انتخابی در فاکتور (${newQty}) بیشتر از موجودی انبار (${details.stock}) است!`, 'error');
        return;
      }
      const updatedCart = [...draftCart];
      updatedCart[existingIndex].quantity = newQty;
      updatedCart[existingIndex].price = itemUnitPrice;
      setDraftCart(updatedCart);
    } else {
      const newItem: DraftCartItem = {
        id: Date.now().toString() + Math.random().toString(),
        inventory_id: Number(selectedInventoryId),
        product_id: details.inv.product_id,
        product_name: details.productName,
        color_name: details.colorName,
        color_hex: details.colorHex,
        size_name: details.sizeName,
        quantity: itemQuantity,
        price: itemUnitPrice,
        available_stock: details.stock
      };
      setDraftCart([...draftCart, newItem]);
    }

    // Reset item quantity input
    setItemQuantity(1);
    showToast('قلم به فاکتور اضافه شد', 'success');
  };

  const handleRemoveItemFromCart = (cartItemId: string) => {
    setDraftCart(draftCart.filter(item => item.id !== cartItemId));
  };

  const calculateCartTotal = () => {
    return draftCart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleSubmitOrder = async () => {
    if (draftCart.length === 0) {
      showToast(t('empty_cart'), 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const itemsInput: CreateOrderItemInput[] = draftCart.map(c => ({
        item_inventory: c.inventory_id,
        item_quantity: c.quantity,
        item_price: c.price
      }));

      await storageManager.createOrder({
        status: orderStatus,
        order_total: calculateCartTotal(),
        items: itemsInput
      });

      showToast(t('order_success'), 'success');
      setShowNewOrderModal(false);
      setDraftCart([]);
      setSelectedProductId('');
      setSelectedInventoryId('');

      // Refresh orders list and inventory
      await loadAllData();
    } catch (err: any) {
      console.error("Failed to submit order:", err);
      showToast(err?.message || 'خطا در ثبت سفارش', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (window.confirm('آیا از حذف این سفارش اطمینان دارید؟')) {
      try {
        await storageManager.deleteOrder(id);
        showToast('سفارش با موفقیت حذف شد', 'success');
        await loadAllData();
      } catch (err) {
        showToast('خطا در حذف سفارش', 'error');
      }
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toString().includes(searchQuery) ||
      (order.order_items || []).some(item => 
        item.product_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price: number) => {
    return price.toLocaleString('fa-IR');
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '-';
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white font-medium transition-all transform animate-bounce ${
          notification.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            {t('orders_management')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            ثبت فاکتور، مدیریت فروش و کسر مستقیم از موجودی ماتریسی انبار
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            title="بروزرسانی لیست"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          <button
            onClick={() => setShowNewOrderModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-5 h-5" />
            <span>{t('new_order')}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="جستجو با شماره فاکتور یا نام کالا..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">وضعیت:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="published">تکمیل شده (Published)</option>
            <option value="draft">پیش‌نویس (Draft)</option>
            <option value="archived">بایگانی شده (Archived)</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
            <p>{t('loading')}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
            <Package className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="font-semibold">{t('no_orders')}</p>
            <p className="text-xs text-slate-400">برای ایجاد اولین فاکتور فروش، دکمه «ثبت سفارش جدید» را بزنید.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <th className="py-4 px-5">{t('order_id')}</th>
                  <th className="py-4 px-5">{t('order_date')}</th>
                  <th className="py-4 px-5">{t('order_items')}</th>
                  <th className="py-4 px-5">{t('order_total')}</th>
                  <th className="py-4 px-5">{t('order_status')}</th>
                  <th className="py-4 px-5 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm">
                {filteredOrders.map((order) => {
                  const itemsCount = order.order_items?.length || 0;
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-5 font-mono font-bold text-slate-800 dark:text-slate-200">
                        #{order.id}
                      </td>
                      <td className="py-4 px-5 text-slate-600 dark:text-slate-300 text-xs dir-ltr">
                        {formatDate(order.date_created)}
                      </td>
                      <td className="py-4 px-5 text-slate-700 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                          <Layers className="w-3.5 h-3.5 text-indigo-500" />
                          {itemsCount} قلم کالا
                        </span>
                      </td>
                      <td className="py-4 px-5 font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatPrice(order.order_total || 0)} تومان
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'published' || order.status === 'completed'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            : order.status === 'draft'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          {order.status === 'published' || order.status === 'completed' ? 'تکمیل شده' : order.status === 'draft' ? 'پیش‌نویس' : 'بایگانی'}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedOrderForInvoice(order)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                            title="مشاهده فاکتور"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                            title="حذف سفارش"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Create New Order (POS) */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/80 rounded-2xl text-indigo-600 dark:text-indigo-400">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {t('new_order')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    انتخاب کالا، تعیین تعداد و ثبت فاکتور نهایی با کسر هوشمند از انبار
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowNewOrderModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Product & Variant Selector Box */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  افزودن کالا به سبد فاکتور
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Select Product */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      {t('select_product')}
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleProductChange(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- انتخاب محصول --</option>
                      {products.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {lang === 'fa' ? prod.name_fa : prod.name_en || prod.name_fa}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Inventory Variant */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      {t('select_variant')}
                    </label>
                    <select
                      value={selectedInventoryId}
                      onChange={(e) => handleVariantChange(Number(e.target.value))}
                      disabled={!selectedProductId}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      <option value="">-- انتخاب رنگ و سایز --</option>
                      {availableProductVariants.map((inv) => {
                        const col = colors.find(c => c.id === inv.color_id);
                        const sz = sizes.find(s => s.id === inv.size_id);
                        return (
                          <option key={inv.id} value={inv.id}>
                            {col?.name_fa || `رنگ ${inv.color_id}`} / {sz?.name || `سایز ${inv.size_id}`} (موجودی: {inv.stock})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Quantity & Add button */}
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                        {t('quantity')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddItemToCart}
                      disabled={!selectedInventoryId}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
                    >
                      {t('add_item')}
                    </button>
                  </div>
                </div>

                {/* Stock Indicator Banner */}
                {selectedInventoryId && (
                  <div className="pt-2 text-xs flex items-center justify-between text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span>قیمت واحد تعیین‌شده: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatPrice(itemUnitPrice)} تومان</strong></span>
                    {(() => {
                      const details = resolveInventoryDetails(Number(selectedInventoryId));
                      return details ? (
                        <span className={`font-semibold ${details.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {t('available_stock')}: {details.stock} عدد
                        </span>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>

              {/* Draft Cart Items Table */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>اقلام اضافه شده به فاکتور ({draftCart.length})</span>
                  <span className="text-xs font-normal text-slate-500">
                    مبلغ کل: <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">{formatPrice(calculateCartTotal())} تومان</strong>
                  </span>
                </h4>

                {draftCart.length === 0 ? (
                  <div className="py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-center text-slate-400 text-sm">
                    {t('empty_cart')}
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="py-3 px-4">نام کالا</th>
                          <th className="py-3 px-4">رنگ و سایز</th>
                          <th className="py-3 px-4">تعداد</th>
                          <th className="py-3 px-4">قیمت واحد</th>
                          <th className="py-3 px-4">مبلغ کل</th>
                          <th className="py-3 px-4 text-center">حذف</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {draftCart.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                            <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                              {item.product_name}
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                              <div className="flex items-center gap-1.5">
                                {item.color_hex && (
                                  <span className="w-3 h-3 rounded-full border border-slate-300 inline-block" style={{ backgroundColor: item.color_hex }} />
                                )}
                                <span>{item.color_name} - سایز {item.size_name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                              {item.quantity} عدد
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                              {formatPrice(item.price)} تومان
                            </td>
                            <td className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                              {formatPrice(item.quantity * item.price)} تومان
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleRemoveItemFromCart(item.id)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-right w-full sm:w-auto">
                <span className="text-xs text-slate-500 dark:text-slate-400">جمع فاکتور:</span>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {formatPrice(calculateCartTotal())} تومان
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  انصراف
                </button>

                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || draftCart.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none text-sm transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{t('submit_order')}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal 2: View Order Invoice Details & Print */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Printable Invoice Container */}
            <div className="p-8 space-y-6" id="invoice-printable-area">
              
              {/* Invoice Header */}
              <div className="flex items-center justify-between border-b pb-6 border-slate-200 dark:border-slate-700">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">
                    فاکتور فروش کالا
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    پلتفرم هوشمند مدیریت پوشاک تن‌خور (tankhor.com)
                  </p>
                </div>

                <div className="text-left font-mono">
                  <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    شماره سفارش: #{selectedOrderForInvoice.id}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 dir-ltr">
                    {formatDate(selectedOrderForInvoice.date_created)}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  اقلام فاکتور
                </h4>

                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="py-2.5 px-3">کد / عنوان متغیر</th>
                        <th className="py-2.5 px-3 text-center">تعداد</th>
                        <th className="py-2.5 px-3">قیمت واحد</th>
                        <th className="py-2.5 px-3">جمع کل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {(selectedOrderForInvoice.order_items || []).map((item, idx) => {
                        const details = resolveInventoryDetails(item.item_inventory);
                        return (
                          <tr key={idx}>
                            <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                              {details ? (
                                <span>{details.productName} ({details.colorName} - {details.sizeName})</span>
                              ) : (
                                <span>متغیر کالا ID #{item.item_inventory}</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                              {item.item_quantity}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                              {formatPrice(item.item_price)} تومان
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                              {formatPrice(item.item_total || (item.item_quantity * item.item_price))} تومان
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Invoice Summary */}
              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-700">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('order_total')}:
                </span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {formatPrice(selectedOrderForInvoice.order_total)} تومان
                </span>
              </div>

            </div>

            {/* Modal Controls */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>{t('print_invoice')}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrderForInvoice(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                بستن
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default OrdersManager;
