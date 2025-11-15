"use client";

import { Plus, Pencil, Trash2 } from "lucide-react";

type ProductManagerProps = {
  type: "sale" | "rent";
};

export default function ProductManager({ type }: ProductManagerProps) {
  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Quản lý sản phẩm</h2>

      {/* Form nhập sản phẩm */}
      <div className="bg-gray-50 p-4 rounded-xl mb-4">
        <h3 className="font-semibold mb-2">
          {type === "sale" ? "Thêm sản phẩm bán" : "Thêm sản phẩm cho thuê"}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <input className="p-2 border rounded" placeholder="Tên sản phẩm" />
          <input className="p-2 border rounded" type="file" accept="image/*" />
          <input
            className="p-2 border rounded"
            type="number"
            placeholder={type === "sale" ? "Giá bán" : "Giá thuê"}
          />
          <input className="p-2 border rounded" type="number" placeholder="Giá giảm" />
          <textarea
            className="p-2 border rounded col-span-2"
            placeholder="Thông tin sản phẩm"
          />
        </div>
        <button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl flex items-center">
          <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm
        </button>
      </div>

      {/* Danh sách sản phẩm mẫu */}
      <div className="space-y-3">
        <div className="p-4 border rounded-xl flex justify-between items-center">
          <div>
            <div className="font-semibold">
              {type === "sale" ? "Vợt Yonex (bán)" : "Vợt Yonex (cho thuê)"}
            </div>
            <div className="text-sm text-gray-600">
              {type === "sale" ? "Giá: 1.200.000đ" : "Giá thuê: 100.000đ/ngày"}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-yellow-400 text-white rounded-lg">
              <Pencil className="w-4 h-4" />
            </button>
            <button className="p-2 bg-red-500 text-white rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
