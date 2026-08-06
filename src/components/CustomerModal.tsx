"use client";

import React, { useState } from "react";
import { Customer } from "@/lib/pencereEngine";

export const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    code: "CARİ-1001",
    name: "Örnek İnşaat Ltd. Şti.",
    phone: "0532 100 20 30",
    email: "info@ornekinsaat.com",
    address: "Organize Sanayi Bölgesi 4. Cadde No: 12, Konya",
  },
  {
    id: "cust-2",
    code: "CARİ-1002",
    name: "Ahmet Yılmaz (Bireysel Müşteri)",
    phone: "0555 444 33 22",
    email: "ahmet.yilmaz@gmail.com",
    address: "Selçuklu Mah. Gül Sokak No: 5/B, Konya",
  },
];

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  activeCustomer: Customer;
  onSelectCustomer: (customer: Customer) => void;
  onAddCustomer: (newCustomer: Customer) => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  customers,
  activeCustomer,
  onSelectCustomer,
  onAddCustomer,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  if (!isOpen) return null;

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      code: `CARİ-${1000 + customers.length + 1}`,
      name: formData.name.trim(),
      phone: formData.phone.trim() || "-",
      email: formData.email.trim(),
      address: formData.address.trim(),
    };

    onAddCustomer(newCust);
    onSelectCustomer(newCust);
    setFormData({ name: "", phone: "", email: "", address: "" });
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-800">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              👤 Cari Kart & Müşteri Yönetimi
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Aktif sipariş için müşteri seçin veya yeni cari kart oluşturun
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Top Bar: Search & Toggle Add Form */}
          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              placeholder="🔍 Müşteri adı veya cari kod ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
            />
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-blue-500/20 flex items-center gap-2 whitespace-nowrap"
            >
              {showAddForm ? "✕ İptal" : "+ Yeni Cari Kart"}
            </button>
          </div>

          {/* New Customer Form */}
          {showAddForm && (
            <form
              onSubmit={handleCreateCustomer}
              className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-5 space-y-4 animate-fadeIn"
            >
              <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                ➕ Yeni Cari Kart Tanımla
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Müşteri / Firma Adı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ör. Özkan İnşaat A.Ş."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Telefon Numarası
                  </label>
                  <input
                    type="text"
                    placeholder="ör. 0532 999 88 77"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    E-Posta Adresi
                  </label>
                  <input
                    type="email"
                    placeholder="ör. teklif@ozkaninsaat.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Teslimat / Fatura Adresi
                  </label>
                  <input
                    type="text"
                    placeholder="ör. Sanayi Sit. 12. Blok No: 4"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition shadow-sm"
                >
                  💾 Cari Kartı Kaydet ve Seç
                </button>
              </div>
            </form>
          )}

          {/* Customer Cards List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kayıtlı Cari Kartlar ({filteredCustomers.length})
            </h3>

            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-sm">
                Aramanızla eşleşen müşteri bulunamadı.
              </div>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = activeCustomer.id === cust.id;
                return (
                  <div
                    key={cust.id}
                    onClick={() => {
                      onSelectCustomer(cust);
                      onClose();
                    }}
                    className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-blue-50/90 border-blue-500 shadow-md ring-2 ring-blue-100"
                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {cust.code}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{cust.name}</h4>
                        {isSelected && (
                          <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                            Aktif Seçili
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>📞 {cust.phone}</span>
                        {cust.email && <span>✉️ {cust.email}</span>}
                      </div>

                      {cust.address && (
                        <p className="text-xs text-slate-400 line-clamp-1">📍 {cust.address}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {isSelected ? "Seçildi" : "Seç"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-sm font-semibold rounded-lg transition"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
