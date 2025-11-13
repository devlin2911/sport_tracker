'use client';

import React, { useState } from 'react';
import { ShoppingCart, Repeat2, DollarSign, Zap, Clock, Box, Shield, Heart } from 'lucide-react';

// Dữ liệu giả lập cho sản phẩm (Bán và Cho thuê)
const productData = [
  {
    id: 1,
    type: 'sale',
    name: 'Vợt Pickleball Wika Vigor đen',
    category: 'Vợt',
    price: 3500000,
    imageUrl: 'data:image/jpeg;base64,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',
    description: 'Vợt Pickleball Wika Vigor đen.',
    icon: Zap,
  },
  {
    id: 2,
    type: 'rental',
    name: 'Vợt Tập Luyện (Cơ bản)',
    category: 'Vợt',
    rentalPrice: 50000, // Giá thuê/giờ
    deposit: 100000, // Tiền đặt cọc
    imageUrl: 'https://placehold.co/400x300/3b82f6/ffffff?text=V%E1%BB%A3t+Thu%C3%AA+C%C6%A1+B%E1%BA%A3n',
    description: 'Vợt Pickleball Wika Header đen.',
    icon: Clock,
  },
  {
    id: 3,
    type: 'sale',
    name: 'Giày Cầu Lông Victor P8500 Ace',
    category: 'Giày',
    price: 1890000,
    imageUrl: 'https://placehold.co/400x300/f59e0b/ffffff?text=Gi%C3%A0y+C%E1%BA%A7u+L%C3%B4ng',
    description: 'Độ bám sân hoàn hảo, hỗ trợ tối đa cho cổ chân.',
    icon: Shield,
  },
  {
    id: 4,
    type: 'rental',
    name: 'Bóng Cầu Lông Lông Vũ (Hộp 6 quả)',
    category: 'Phụ kiện',
    rentalPrice: 20000, // Giá thuê/lượt
    deposit: 0,
    imageUrl: 'https://placehold.co/400x300/a855f7/ffffff?text=B%C3%B3ng+Thu%C3%AA',
    description: 'Thuê theo lượt chơi, chất lượng tốt, độ bền cao.',
    icon: Box,
  },
];

// Định dạng tiền tệ
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Component con hiển thị chi tiết sản phẩm
interface ProductCardProps {
  product: typeof productData[0];
}

const SportsEquipApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sale' | 'rental'>('sale');

  const filteredProducts = productData.filter(p => p.type === activeTab);

  const SaleIcon = ShoppingCart;
  const RentalIcon = Repeat2;

  // CUSTOM MODAL ALERT
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleAction = (message: string) => {
    setModalMessage(message);
    setModalOpen(true);
  };

  const Modal = ({ message, onClose }: { message: string, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full transform transition-all duration-300 scale-100">
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

  const CustomProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const isRental = product.type === 'rental';

    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100">
        <div className="relative h-48 bg-gray-50 flex items-center justify-center">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).onerror = null;
              (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/cccccc/333333?text=No+Image';
            }}
          />
          <div className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold uppercase rounded-full shadow-md ${isRental ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'}`}>
            {isRental ? 'CHO THUÊ' : 'ĐANG BÁN'}
          </div>
        </div>

        <div className="p-5 flex flex-col h-full">
          <h3 className="text-xl font-bold text-gray-800 mb-2 truncate" title={product.name}>
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mb-4 flex-grow">{product.description}</p>

          <div className="mt-auto">
            {isRental ? (
              <>
                <div className="flex items-center text-lg font-bold text-yellow-600 mb-1">
                  <Clock className="w-4 h-4 mr-2" />
                  {formatCurrency(product.rentalPrice ?? 0)} / {product.category === 'Phụ kiện' ? 'lượt' : 'giờ'}
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
              ${isRental
                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            onClick={() => handleAction(`Sản phẩm đã được ${isRental ? 'thêm vào danh sách thuê' : 'thêm vào giỏ hàng'}. Vui lòng tiếp tục thanh toán.`)}
          >
            {product.icon && <product.icon className="w-4 h-4 mr-2" />}
            {isRental ? 'Thuê Ngay' : 'Thêm vào Giỏ'}
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

      <div className="flex justify-center mb-10">
        <div className="flex bg-white p-1 rounded-full shadow-inner border border-gray-200">
          <button
            onClick={() => setActiveTab('sale')}
            className={`px-8 py-3 text-lg font-semibold rounded-full transition duration-300 flex items-center
              ${activeTab === 'sale'
                ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            <SaleIcon className="w-5 h-5 mr-2" />
            Mua Sản Phẩm
          </button>

          <button
            onClick={() => setActiveTab('rental')}
            className={`px-8 py-3 text-lg font-semibold rounded-full transition duration-300 flex items-center
              ${activeTab === 'rental'
                ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-200'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            <RentalIcon className="w-5 h-5 mr-2" />
            Dịch Vụ Cho Thuê
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <CustomProductCard key={product.id} product={product as typeof productData[0]} />
            ))}
          </div>
        ) : (
          <div className="text-center p-10 bg-white rounded-xl shadow-md border-t-4 border-gray-300">
            <p className="text-xl font-semibold text-gray-600">
              Không tìm thấy sản phẩm {activeTab === 'sale' ? 'để bán' : 'cho thuê'} nào.
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
