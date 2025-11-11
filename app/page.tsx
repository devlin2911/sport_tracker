// app/page.tsx (Server Component)
import { Suspense } from 'react';
import HomePage from '../app/home'; // Thay thế bằng đường dẫn chính xác của file HomePage

// Fallback là nội dung sẽ hiển thị ngay lập tức khi Server Component được render 
// trong khi Client Hook (useSearchParams) đang được chờ đợi trên trình duyệt.
const HomeFallback = () => (
    <div className="min-h-screen flex items-center justify-center">
        Đang tải...
    </div>
);

export default function Page() {
    return (
        // Bọc component Client (HomePage) trong Suspense
        <Suspense fallback={<HomeFallback />}>
            <HomePage />
        </Suspense>
    );
}