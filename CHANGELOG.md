# Changelog

## [2.0.1] - 2026-04-05
### Cập nhật hệ thống & Fix lỗi sau khi Upgrade
- **Framework Upgrade**: Khắc phục lỗi build sau khi framework được cập nhật lên Next.js 16.2.2 và Prisma v7.
- **NextAuth Fix**: Tạo trung gian `src/lib/auth.ts` để fix lỗi module resolving cho NextAuth từ trong `src/` (thay vì path tương đối vỡ `@/../../auth`).
- **Prisma v7 Config Migration**:
  - Chuyển `DATABASE_URL` từ file `schema.prisma` sang file cấu hình mới `prisma.config.ts` thông qua module `@prisma/config`.
  - Cài đặt và tích hợp `@prisma/adapter-pg` cùng thư viện native `pg` để thay thế cho local engine cũ theo yêu cầu của Prisma 7.
- **Routing & API Changes (Next.js 15+)**:
  - Migrate kiểu dữ liệu của `params` thành `Promise` trên các dynamic routes (`[id]/route.ts`) ở module `deals`, `projects`, `tasks`, `skills` và trang `layout`.
- **Typing & Linting**: 
  - Fix các lỗi implicit any trong logic tạo báo cáo ở `src/app/api/reports/weekly/route.ts`.
  - Sửa lỗi mapping option sai ở `chat()` endpoint (`messages` -> `message`) trong Slack event routes và tool routes.
  - Sửa syntax error dấu phẩy thừa ở component UI hiển thị khách hàng.

### Ghi chú cho lần làm việc tiếp theo:
- Đã khắc phục hoàn toàn sự cố build. Hệ thống đang sẵn sàng ở chuẩn cấu trúc và deps version mới nhất.
- Tiếp theo có thể bắt đầu xây dựng tính năng theo Roadmap: Cấu hình Virtual VPN và Phát triển Phase 2 (các integration).
