"use client";

import React, { useEffect, useState } from "react";
import { ShoppingCart, Repeat2, DollarSign, Clock, Heart } from "lucide-react";
import { db } from "../../lib/firebase.ts";
import { collection, getDocs } from "firebase/firestore";

// Định dạng tiền tệ
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

// Kiểu dữ liệu sản phẩm
interface Product {
  id: string;
  type: "sale" | "rental";
  name: string;
  category: string;
  price?: number;
  rentalPrice?: number;
  deposit?: number;
  imageUrl?: string;
  description?: string;
}

const SportsEquipApp: React.FC = () => {
  // ✅ Lấy tab từ localStorage khi khởi tạo
  const [activeTab, setActiveTab] = useState<"sale" | "rental">(
    (typeof window !== "undefined" &&
      (localStorage.getItem("activeTab") as "sale" | "rental")) || "sale"
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal thông báo
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleAction = (message: string) => {
    setModalMessage(message);
    setModalOpen(true);
  };

  const Modal = ({ message, onClose }: { message: string; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full">
        <h3 className="text-xl font-bold text-blue-600 mb-3 flex items-center">
          <Heart className="w-5 h-5 mr-2 text-red-500" />
          Thông báo
        </h3>
        <p className="text-gray-700 mb-4">{message}</p>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
        >
          Đã hiểu
        </button>
      </div>
    </div>
  );

  // Lấy dữ liệu từ Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const data: Product[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(data);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ Lưu tab vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const filteredProducts = products.filter((p) => p.type === activeTab);

  const SaleIcon = ShoppingCart;
  const RentalIcon = Repeat2;

  const CustomProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const isRental = product.type === "rental";

    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100">
        <div className="relative h-48 bg-gray-50 flex items-center justify-center">
          <img
            src={product.imageUrl || "https://placehold.co/400x300/cccccc/333333?text=No+Image"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div
            className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold uppercase rounded-full shadow-md ${
              isRental ? "bg-yellow-500 text-white" : "bg-green-500 text-white"
            }`}
          >
            {isRental ? "CHO THUÊ" : "ĐANG BÁN"}
          </div>
        </div>

        <div className="p-5 flex flex-col h-full">
          <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-4 flex-grow">{product.description}</p>

          <div className="mt-auto">
            {isRental ? (
              <>
                <div className="flex items-center text-lg font-bold text-yellow-600 mb-1">
                  <Clock className="w-4 h-4 mr-2" />
                  {formatCurrency(product.rentalPrice ?? 0)} /{" "}
                  {product.category === "Phụ kiện" ? "lượt" : "giờ"}
                </div>
                <p className="text-sm text-gray-600 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                  Đặt cọc: {formatCurrency(product.deposit ?? 0)}
                </p>
              </>
            ) : (
              <div className="flex items-center text-2xl font-extrabold text-green-600">
                <DollarSign className="w-5 h-5 mr-2" />
                {formatCurrency(product.price ?? 0)}
              </div>
            )}
          </div>

          <button
            className={`mt-4 w-full py-2 rounded-lg font-semibold transition duration-200 flex items-center justify-center shadow-md
              ${isRental ? "bg-yellow-500 text-white hover:bg-yellow-600" : "bg-green-600 text-white hover:bg-green-700"}`}
            onClick={() =>
              handleAction(
                `Sản phẩm đã được ${
                  isRental ? "thêm vào danh sách thuê" : "thêm vào giỏ hàng"
                }. Vui lòng tiếp tục thanh toán.`
              )
            }
          >
            {isRental ? "Thuê Ngay" : "Thêm vào Giỏ"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen font-inter">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2 text-center">
        Mua & Thuê Dụng Cụ Thể Thao
      </h1>
      <p className="text-lg text-gray-600 mb-10 text-center">
        Tất cả dụng cụ cần thiết cho trận cầu của bạn, từ Vợt đến Giày, có sẵn để mua hoặc thuê.
      </p>

      {/* Tabs */}
      <div className="flex justify-center mb-10">
        <div className="flex bg-white p-1 rounded-full shadow-inner border border-gray-200">
          <button
            onClick={() => setActiveTab("sale")}
            className={`px-8 py-3 text-lg font-semibold rounded-full transition duration-300 flex items-center
              ${activeTab === "sale" ? "bg-green-500 text-white shadow-lg shadow-green-200" : "text-gray-700 hover:bg-gray-100"}`}
          >
            <SaleIcon className="w-5 h-5 mr-2" />
            Mua Sản Phẩm
          </button>

          <button
            onClick={() => setActiveTab("rental")}
            className={`px-8 py-3 text-lg font-semibold rounded-full transition duration-300 flex items-center
              ${activeTab === "rental" ? "bg-yellow-500 text-white shadow-lg shadow-yellow-200" : "text-gray-700 hover:bg-gray-100"}`}
          >
            <RentalIcon className="w-5 h-5 mr-2" />
            Dịch Vụ Cho Thuê
          </button>
        </div>
      </div>

      {/* Hiển thị sản phẩm */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <p className="text-center text-gray-600">Đang tải dữ liệu...</p>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <CustomProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center p-10 bg-white rounded-xl shadow-md border-t-4 border-gray-300">
            <p className="text-xl font-semibold text-gray-600">
              Không tìm thấy sản phẩm {activeTab === "sale" ? "để bán" : "cho thuê"} nào.
            </p>
            <p className="text-gray-500 mt-2">Vui lòng quay lại sau hoặc chuyển sang tab khác.</p>
          </div>
        )}
      </div>

      {modalOpen && <Modal message={modalMessage} onClose={() => setModalOpen(false)} />}
    </div>
  );
};

export default SportsEquipApp;
