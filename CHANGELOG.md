# Changelog

## [2.2.3] - 2026-04-05

### Desktop — logo app
- Icon **1024×1024** vuông (crop giữa + resize) để không bị méo trên Dock / taskbar.
- Nhận diện mới: nền tối, họa tiết C / mạng nút kiểu 3D, phù hợp bo góc hệ thống trên macOS.

---

## [2.2.2] - 2026-04-05

### System health (tự kiểm tra trước khi đăng nhập)
- **`GET /api/health`** — kiểm tra kết nối PostgreSQL (`SELECT 1`) và **có/không** các biến môi trường (không trả giá trị secret).
- **Trang `/health`** — UI checklist; public (middleware cho phép không session).
- Liên kết từ **Login**, **Setup Guide**, sidebar **System health**, menu Electron **View → System health**.

---

## [2.2.1] - 2026-04-05

### Desktop — fix `spawn ENOTDIR` khi mở app đóng gói (macOS / Windows)
- **Nguyên nhân:** `cwd` của process `next start` trỏ vào **`app.asar`** (là **file**), không phải thư mục → Node báo **`ENOTDIR`**.
- **Cách xử lý:** Bật **`asar: false`** trong `electron-builder.json` để toàn bộ app nằm trong thư mục thật (`Resources/app/...`). Trong `electron/main.js`, khi đã đóng gói dùng **`app.getAppPath()`** làm thư mục gốc + `cwd` cho `spawn`.

---

## [2.2.0] - 2026-04-05

### Organization & phòng ban (multi-workspace + phân quyền)
- **Organization** — mô hình công ty (tenant): một tổ chức chứa nhiều **Workspace** (phòng ban / team). Dữ liệu vận hành (deals, clients, projects, knowledge, …) vẫn **tách theo `workspaceId`**; SSOT nghiệp vụ có thể xây thêm ở tầng org trong các bước sau.
- **OrganizationMember** — vai trò: `org_owner` | `org_admin` | `member`. `org_owner` / `org_admin` **xem được mọi workspace** thuộc tổ chức đó; `member` chỉ thấy workspace được mời (WorkspaceMember).
- **Workspace** — trường `organizationId` (bắt buộc với workspace mới; dữ liệu cũ cần `npm run db:backfill-org`). Tạo workspace mới: hoặc gửi `organizationId` (cần quyền org admin), hoặc **tự tạo Organization** mới và gán user làm `org_owner`.
- **WorkspaceMember.permissions** — trường JSON tùy chọn để phân quyền theo module (`deals`, `clients`, `projects`, `knowledge`, `reports`), giá trị `none` | `read` | `write`. Nếu `null`, áp dụng mặc định theo `role` (helper: `src/lib/workspace-access.ts`).
- **API mới:** `GET/POST /api/organizations` — liệt kê / tạo tổ chức.
- **API cập nhật:** `GET/POST /api/workspace` — trả về kèm `organization`; tạo workspace gắn org.

### Migration cơ sở dữ liệu có sẵn
1. `npx prisma db push` (hoặc migrate tương đương).
2. Nếu đã có bản ghi `Workspace` cũ thiếu org: `npm run db:backfill-org` (script `prisma/backfill-organizations.ts`).

### Desktop (GitHub Releases)
- Bản build **2.2.0** — DMG (macOS arm64 + x64) và installer Windows (NSIS). Đổi app identity / branding theo COSPACEX từ 2.1.0; cài đặt mới hoặc cập nhật từ 2.1.x qua kênh release.

---

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
