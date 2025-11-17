"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { db } from "../../../lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

type ProductManagerProps = {
  type: "sale" | "rental";
};

interface Product {
  id: string;
  productCode: string;
  name: string;
  category: string;
  price: number;
  rentalPrice: number;
  deposit: number;
  description: string;
  imageUrl: string;
  type: "sale" | "rental";
}

export default function ProductManager({ type }: ProductManagerProps) {
  const [form, setForm] = useState({
    productCode: "",
    name: "",
    category: "",
    price: 0,
    rentalPrice: 0,
    deposit: 0,
    description: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");


  // Load sản phẩm từ Firestore khi mở trang
  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const data: Product[] = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Product, "id">),
      }));
      setProducts(data.filter((p) => p.type === type));
    };
    fetchProducts();
  }, [type]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "product_pic_upload"); // preset của bạn

    const res = await fetch("https://api.cloudinary.com/v1_1/dulub9jq1/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Upload thất bại");
    return data.secure_url;
  };

  const handleSubmit = async () => {
  try {
    setUploading(true);
    let imageUrl = currentImageUrl;

    if (imageFile) {
      imageUrl = await uploadToCloudinary(imageFile);
    }

    const newProduct = {
      ...form,
      type: type === "sale" ? "sale" : "rental",
      imageUrl,
      price: Number(form.price),
      rentalPrice: Number(form.rentalPrice),
      deposit: Number(form.deposit),
    };

    if (editingId) {
      // ✅ Update sản phẩm cũ
      await updateDoc(doc(db, "products", editingId), newProduct);
      setProducts((prev) =>
        prev.map((p) => (p.id === editingId ? { id: editingId, ...newProduct } : p))
      );
      alert("Cập nhật sản phẩm thành công!");
      setEditingId(null);
    } else {
      // ✅ Thêm sản phẩm mới
      const docRef = await addDoc(collection(db, "products"), newProduct);
      setProducts((prev) => [...prev, { id: docRef.id, ...newProduct }]);
      alert("Thêm sản phẩm thành công!");
    }

    // Reset form
    setForm({
      productCode: "",
      name: "",
      category: "",
      price: 0,
      rentalPrice: 0,
      deposit: 0,
      description: "",
    });
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  } catch (err) {
    console.error(err);
    alert("Lỗi khi thêm/cập nhật sản phẩm");
  } finally {
    setUploading(false);
  }
};

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa sản phẩm");
    }
  };

  const handleEdit = (id: string) => {
  const product = products.find((p) => p.id === id);
  if (product) {
    setForm({
      productCode: product.productCode,
      name: product.name,
      category: product.category,
      price: product.price,
      rentalPrice: product.rentalPrice,
      deposit: product.deposit,
      description: product.description,
    });
    setEditingId(id); // ✅ đánh dấu đang sửa
    setImageFile(null);
    setCurrentImageUrl(product.imageUrl); // ✅ giữ lại ảnh cũ
    if (fileInputRef.current) fileInputRef.current.value = "";
  }
};

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">
        {type === "sale" ? "Thêm sản phẩm bán" : "Thêm sản phẩm cho thuê"}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <input
          name="productCode"
          value={form.productCode}
          onChange={handleChange}
          className="p-2 border rounded"
          placeholder="Mã sản phẩm"
        />
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="p-2 border rounded"
          placeholder="Tên sản phẩm"
        />
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          className="p-2 border rounded"
          placeholder="Danh mục"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={fileInputRef}
          className="p-2 border rounded col-span-2"
        />

        {type === "sale" ? (
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            type="number"
            className="p-2 border rounded"
            placeholder="Giá bán"
          />
        ) : (
          <>
            <input
              name="rentalPrice"
              value={form.rentalPrice}
              onChange={handleChange}
              type="number"
              className="p-2 border rounded"
              placeholder="Giá thuê"
            />
            <input
              name="deposit"
              value={form.deposit}
              onChange={handleChange}
              type="number"
              className="p-2 border rounded"
              placeholder="Đặt cọc"
            />
          </>
        )}

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="p-2 border rounded col-span-2"
          placeholder="Thông tin sản phẩm"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={uploading}
        className={`mt-3 px-4 py-2 rounded-xl flex items-center cursor-pointer ${
          uploading ? "bg-gray-400" : "bg-indigo-600 text-white hover:bg-indigo-700"
        }`}
      >
        <Plus className="w-4 h-4 mr-2" />
        {uploading ? "Đang xử lý..." : editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
      </button>

      {products.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4">Danh sách sản phẩm</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((p) => (
              <div key={p.id} className="border rounded p-4 shadow">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <h4 className="font-bold text-lg">{p.name}</h4>
                <p className="text-sm text-gray-600">Mã: {p.productCode}</p>
                <p className="text-sm text-gray-600">Loại: {p.type}</p>
                <p className="text-sm text-gray-600">Danh mục: {p.category}</p>
                <p className="text-sm text-gray-600">
                  {p.type === "sale"
                    ? `Giá bán: ${p.price}₫`
                    : `Giá thuê: ${p.rentalPrice}₫ - Đặt cọc: ${p.deposit}₫`}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(p.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
                  >
                    <Pencil className="w-4 h-4" />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}