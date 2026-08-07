"use client";

import React, { useState, useEffect } from "react";
import { Order, WindowItem } from "@/lib/pencereEngine";
import { FolderOpen, Save, Trash2, RotateCcw, History } from "lucide-react";

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: WindowItem[];
  customerName: string;
  onLoadOrder: (items: WindowItem[]) => void;
}

const STORAGE_KEY = "app_saved_orders";

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  items,
  customerName,
  onLoadOrder,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderTitle, setOrderTitle] = useState<string>("");
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setOrders(JSON.parse(saved));
      } catch (e) {}
    }
  }, [isOpen]);

  const persist = (next: Order[]) => {
    setOrders(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleSaveOrder = () => {
    const title = orderTitle.trim() || `Sipariş ${new Date().toLocaleDateString("tr-TR")}`;
    const newOrder: Order = {
      id: `order-${crypto.randomUUID()}`,
      customerId: customerName,
      orderNo: `SIP-${String(orders.length + 1).padStart(3, "0")}`,
      title,
      items: JSON.parse(JSON.stringify(items)) as WindowItem[],
      createdAt: new Date().toISOString(),
    };
    persist([newOrder, ...orders]);
    setOrderTitle("");
    setSavedFlash(`"${title}" kaydedildi`);
    setTimeout(() => setSavedFlash(null), 2500);
  };

  const handleLoadOrder = (order: Order) => {
    onLoadOrder(order.items);
    onClose();
  };

  const handleDeleteOrder = (id: string) => {
    persist(orders.filter((o) => o.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Sipariş Geçmişi & Kayıtlı Teklifler
              </h2>
              <p className="text-xs text-slate-400">
                Mevcut siparişi kaydedin, kayıtlı pozları geri yükleyin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-lg flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900/60">
          {/* Mevcut Siparişi Kaydet */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              💾 Mevcut Siparişi Kaydet
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Sipariş adı (ör. Salon Pencereleri)"
                value={orderTitle}
                onChange={(e) => setOrderTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveOrder()}
                className="flex-1 min-w-[200px] bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSaveOrder}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-600/25 transition"
              >
                <Save className="w-4 h-4" />
                Siparişi Kaydet
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              {items.length} poz kaydedilecek · Cari: {customerName}
            </p>
            {savedFlash && (
              <p className="text-xs font-semibold text-emerald-400">{savedFlash}</p>
            )}
          </div>

          {/* Kayıtlı Siparişler */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-3">
              🗂️ Kayıtlı Siparişler ({orders.length})
            </span>
            {orders.length === 0 ? (
              <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl p-8 text-center">
                <FolderOpen className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-sm text-slate-500">
                  Henüz kayıtlı sipariş yok. Üstteki form ile mevcut siparişinizi kaydedin.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-indigo-500/40 transition"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{order.title}</span>
                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[10px] font-mono font-bold">
                          {order.orderNo}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {new Date(order.createdAt).toLocaleString("tr-TR")} · {order.items.length} poz ·{" "}
                        {order.items.reduce((s, i) => s + (i.quantity || 1), 0)} adet
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleLoadOrder(order)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/15 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Geri Yükle
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/10 hover:bg-red-600/25 text-red-300 border border-red-500/20 rounded-lg text-xs font-semibold transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
