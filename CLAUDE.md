# 🏠 House / Apartment Rental Application — Product Requirements Document

> **Version:** 2.0  
> **Date:** March 22, 2026  
> **Languages:** English (EN) / Tiếng Việt (VI)  
> **Currencies:** USD ($) / VND (₫)  
> **Tech Stack:** Next.js · Docker · Drizzle ORM · PostgreSQL

---

## Table of Contents

1. [Project Overview / Tổng Quan Dự Án](#1-project-overview--tổng-quan-dự-án)
2. [Tech Stack & Architecture / Kiến Trúc Hệ Thống](#2-tech-stack--architecture--kiến-trúc-hệ-thống)
3. [User Roles & Permissions / Vai Trò & Phân Quyền](#3-user-roles--permissions--vai-trò--phân-quyền)
4. [Core Services / Dịch Vụ Chính](#4-core-services--dịch-vụ-chính)
5. [Property Listing Module / Module Danh Sách Bất Động Sản](#5-property-listing-module--module-danh-sách-bất-động-sản)
6. [Rental Service / Dịch Vụ Cho Thuê](#6-rental-service--dịch-vụ-cho-thuê)
7. [Purchase & Sales Service / Dịch Vụ Mua Bán](#7-purchase--sales-service--dịch-vụ-mua-bán)
8. [Installment Plan (Vietnam Regulations) / Trả Góp (Theo Quy Định Việt Nam)](#8-installment-plan-vietnam-regulations--trả-góp-theo-quy-định-việt-nam)
9. [Other Housing Services / Các Dịch Vụ Nhà Ở Khác](#9-other-housing-services--các-dịch-vụ-nhà-ở-khác)
10. [Multi-Currency Support / Hỗ Trợ Đa Tiền Tệ](#10-multi-currency-support--hỗ-trợ-đa-tiền-tệ)
11. [Multi-Language (i18n) / Đa Ngôn Ngữ](#11-multi-language-i18n--đa-ngôn-ngữ)
12. [Database Schema (Drizzle ORM) / Sơ Đồ Cơ Sở Dữ Liệu](#12-database-schema-drizzle-orm--sơ-đồ-cơ-sở-dữ-liệu)
13. [Server Actions / Các Server Action](#13-server-actions--các-server-action)
14. [Docker Configuration / Cấu Hình Docker](#14-docker-configuration--cấu-hình-docker)
15. [Tax & Legal Compliance / Thuế & Tuân Thủ Pháp Luật](#15-tax--legal-compliance--thuế--tuân-thủ-pháp-luật)
16. [Appendix / Phụ Lục](#16-appendix--phụ-lục)

---

## 1. Project Overview / Tổng Quan Dự Án

**EN:** A full-featured real estate platform enabling property rental, purchase, and housing-related services. The application supports bilingual content (English and Vietnamese) and dual-currency transactions (USD and VND). It is designed to comply with Vietnam's Housing Law 2023, Land Law 2024, and Real Estate Business Law 2023 (effective January 1, 2025).

**VI:** Nền tảng bất động sản toàn diện hỗ trợ cho thuê, mua bán và các dịch vụ liên quan đến nhà ở. Ứng dụng hỗ trợ song ngữ (Tiếng Anh và Tiếng Việt) và giao dịch bằng hai loại tiền tệ (USD và VND). Hệ thống được thiết kế tuân thủ Luật Nhà ở 2023, Luật Đất đai 2024 và Luật Kinh doanh Bất động sản 2023 (có hiệu lực từ ngày 01/01/2025).

---

## 2. Tech Stack & Architecture / Kiến Trúc Hệ Thống

| Layer            | Technology                   | Purpose / Mục đích                                                   |
| ---------------- | ---------------------------- | -------------------------------------------------------------------- |
| Frontend         | **Next.js 15+** (App Router) | SSR/SSG, i18n routing, React Server Components, Server Actions       |
| ORM              | **Drizzle ORM**              | Type-safe SQL, zero-abstraction queries, push-based migrations       |
| Database         | **PostgreSQL 16**            | Relational data storage, JSONB for flexible fields                   |
| Containerization | **Docker & Docker Compose**  | Consistent dev/staging/production environments                       |
| Authentication   | NextAuth.js / Auth.js v5     | Role-based access, OAuth, credentials                                |
| Payment          | VNPay / Stripe               | Dual-currency payment processing                                     |
| Storage          | **Cloudflare R2**            | S3-compatible object storage — zero egress fees, global edge caching |
| Caching          | Redis                        | Session management, rate limiting                                    |

### Why Drizzle ORM over Prisma / Tại sao chọn Drizzle thay vì Prisma

| Criteria        | Drizzle ORM                               | Prisma                                    |
| --------------- | ----------------------------------------- | ----------------------------------------- |
| Query engine    | Thin SQL wrapper — no external binary     | Requires Rust-based query engine (~15 MB) |
| Bundle size     | ~50 KB (serverless-friendly)              | ~2 MB+ engine on cold start               |
| SQL control     | Full SQL expressiveness (`sql\`...\``)    | Limited to generated client API           |
| Schema format   | TypeScript (co-located, composable)       | `.prisma` DSL (separate file)             |
| Migrations      | `drizzle-kit push` or SQL migration files | `prisma migrate` with shadow database     |
| Edge/serverless | Native compatibility                      | Requires Accelerate proxy or adapter      |
| Type safety     | Inferred from schema TS definitions       | Generated `.d.ts` client                  |

### Why Server Actions over REST API Routes / Tại sao chọn Server Actions thay vì REST API

| Criteria                | Server Actions                                       | REST API Routes                                          |
| ----------------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| Boilerplate             | Zero — call function directly from client            | Route file + fetch wrapper + error handling per endpoint |
| Type safety             | End-to-end — function signatures propagate to client | Manual types or code generation required                 |
| Network overhead        | Automatic batching + streaming by Next.js            | One HTTP round-trip per request                          |
| Progressive enhancement | Works without JS (form `action=` attribute)          | Requires client-side JavaScript                          |
| Caching                 | Integrated with `revalidatePath` / `revalidateTag`   | Manual cache invalidation                                |
| Security                | Encrypted action IDs; input never exposed as URL     | Endpoint URLs are public surface area                    |

### Architecture Diagram / Sơ đồ kiến trúc

```
┌──────────────────────────────────────────────────────┐
│                   NGINX / Reverse Proxy              │
└──────────────┬───────────────────────┬───────────────┘
               │                       │
    ┌──────────▼──────────┐ ┌──────────▼──────────┐
    │   Next.js App       │ │   Next.js App       │
    │   (Container #1)    │ │   (Container #2)    │
    │   - RSC + Actions   │ │   - RSC + Actions   │
    │   - Drizzle Client  │ │   - Drizzle Client  │
    └──────────┬──────────┘ └──────────┬──────────┘
               │                       │
    ┌──────────▼───────────────────────▼──────────┐
    │              PostgreSQL 16                    │
    │              (Docker Volume)                  │
    └──────────┬───────────────────────────────────┘
               │
    ┌──────────▼──────────┐   ┌───────────────────┐
    │       Redis          │   │  Cloudflare R2    │
    │  (Sessions/Cache)    │   │  (File Storage)   │
    └─────────────────────┘   └───────────────────┘
```

---

## 3. User Roles & Permissions / Vai Trò & Phân Quyền

### 3.1 Role Definitions / Định Nghĩa Vai Trò

#### 🔴 Administrator / Quản Trị Viên

**EN:** Full system access. Manages platform configuration, user accounts, all listings, financial reports, and system settings. Can override any action by other roles.

**VI:** Quyền truy cập toàn hệ thống. Quản lý cấu hình nền tảng, tài khoản người dùng, tất cả danh sách BĐS, báo cáo tài chính và cài đặt hệ thống. Có thể ghi đè mọi hành động của các vai trò khác.

| Permission / Quyền                                 | Access / Truy cập |
| -------------------------------------------------- | ----------------- |
| User Management / Quản lý người dùng               | ✅ Full CRUD      |
| System Configuration / Cấu hình hệ thống           | ✅                |
| Financial Reports / Báo cáo tài chính              | ✅ View + Export  |
| All Listings / Tất cả danh sách BĐS                | ✅ Full CRUD      |
| Installment Plan Approval / Duyệt kế hoạch trả góp | ✅                |
| Audit Logs / Nhật ký kiểm toán                     | ✅                |
| Role Assignment / Gán vai trò                      | ✅                |
| Commission Settings / Cài đặt hoa hồng             | ✅                |

#### 🟠 Office Admin / Quản Trị Văn Phòng

**EN:** Manages day-to-day operations for a specific office or branch. Handles property approvals, tenant/buyer verification, contract generation, and local reporting.

**VI:** Quản lý hoạt động hàng ngày cho văn phòng hoặc chi nhánh cụ thể. Xử lý duyệt BĐS, xác minh người thuê/người mua, tạo hợp đồng và báo cáo cục bộ.

| Permission / Quyền                                  | Access / Truy cập                  |
| --------------------------------------------------- | ---------------------------------- |
| Property Approval / Duyệt BĐS                       | ✅ Within branch / Trong chi nhánh |
| Contract Management / Quản lý hợp đồng              | ✅ Create + Edit                   |
| Tenant/Buyer Verification / Xác minh người thuê/mua | ✅                                 |
| Local Reports / Báo cáo chi nhánh                   | ✅                                 |
| Sales Staff Management / Quản lý nhân viên Sales    | ✅                                 |
| Installment Tracking / Theo dõi trả góp             | ✅                                 |
| Payment Verification / Xác minh thanh toán          | ✅                                 |
| System Settings / Cài đặt hệ thống                  | ❌                                 |

#### 🟢 Property Owner / Chủ Sở Hữu Bất Động Sản

**EN:** Lists properties for rent or sale. Manages own property details, views inquiries, responds to interested tenants/buyers, and tracks payment/installment schedules.

**VI:** Đăng BĐS cho thuê hoặc bán. Quản lý chi tiết BĐS của mình, xem yêu cầu, phản hồi người thuê/mua quan tâm và theo dõi lịch thanh toán/trả góp.

| Permission / Quyền                              | Access / Truy cập      |
| ----------------------------------------------- | ---------------------- |
| Own Listings / Danh sách BĐS của mình           | ✅ Full CRUD           |
| View Inquiries / Xem yêu cầu                    | ✅ Own properties only |
| Rental Agreement / Hợp đồng thuê                | ✅ Initiate            |
| Payment History / Lịch sử thanh toán            | ✅ Own properties      |
| Maintenance Requests / Yêu cầu bảo trì          | ✅ Manage              |
| Financial Dashboard / Bảng điều khiển tài chính | ✅ Own data only       |
| Other Owners' Data / Dữ liệu của chủ khác       | ❌                     |

#### 🔵 Sales / Nhân Viên Kinh Doanh

**EN:** Handles client interactions, property tours, negotiations, and closing deals. Can create leads, manage customer relationships, and process rental/purchase applications on behalf of clients.

**VI:** Xử lý tương tác khách hàng, dẫn khách xem nhà, đàm phán và chốt giao dịch. Có thể tạo leads, quản lý quan hệ khách hàng và xử lý đơn thuê/mua thay mặt khách hàng.

| Permission / Quyền                             | Access / Truy cập               |
| ---------------------------------------------- | ------------------------------- |
| Lead Management / Quản lý khách hàng tiềm năng | ✅                              |
| Property Browsing / Duyệt BĐS                  | ✅ All approved listings        |
| Tour Scheduling / Lên lịch xem nhà             | ✅                              |
| Application Submission / Gửi đơn đăng ký       | ✅ On behalf of clients         |
| Commission Tracking / Theo dõi hoa hồng        | ✅ Own commissions              |
| Contract Drafting / Soạn hợp đồng              | ✅ Initiate (requires approval) |
| Client Communication / Liên hệ khách hàng      | ✅                              |
| Financial Settings / Cài đặt tài chính         | ❌                              |

### 3.2 Permission Matrix / Ma Trận Phân Quyền

| Feature                                      | Admin | Office Admin | Owner  | Sales  |
| -------------------------------------------- | :---: | :----------: | :----: | :----: |
| Create Listing / Tạo BĐS                     |  ✅   |      ✅      |   ✅   |   ❌   |
| Approve Listing / Duyệt BĐS                  |  ✅   |      ✅      |   ❌   |   ❌   |
| Edit Any Listing / Sửa mọi BĐS               |  ✅   |     ✅\*     |   ❌   |   ❌   |
| Delete Listing / Xóa BĐS                     |  ✅   |     ✅\*     | ✅\*\* |   ❌   |
| View All Transactions / Xem tất cả giao dịch |  ✅   |     ✅\*     |   ❌   |   ❌   |
| Manage Users / Quản lý người dùng            |  ✅   |      ❌      |   ❌   |   ❌   |
| Approve Installment / Duyệt trả góp          |  ✅   |      ✅      |   ❌   |   ❌   |
| Generate Reports / Tạo báo cáo               |  ✅   |     ✅\*     | ✅\*\* | ✅\*\* |
| System Settings / Cài đặt hệ thống           |  ✅   |      ❌      |   ❌   |   ❌   |
| Process Payment / Xử lý thanh toán           |  ✅   |      ✅      |   ❌   |   ❌   |

> \* Within assigned branch / Trong chi nhánh được giao  
> \*\* Own data only / Chỉ dữ liệu của mình

---

## 4. Core Services / Dịch Vụ Chính

The platform provides three primary service categories:

| #   | Service (EN)               | Dịch vụ (VI)           | Description / Mô tả                                            |
| --- | -------------------------- | ---------------------- | -------------------------------------------------------------- |
| 1   | **Rental**                 | **Cho Thuê**           | Long-term and short-term property rental with lease management |
| 2   | **Purchase / Sale**        | **Mua / Bán**          | Property buying and selling with installment plan support      |
| 3   | **Other Housing Services** | **Dịch Vụ Nhà Ở Khác** | Maintenance, valuation, legal assistance, property management  |

---

## 5. Property Listing Module / Module Danh Sách Bất Động Sản

### 5.1 Property Types / Loại Bất Động Sản

| Type (EN)         | Loại (VI)           | Code         |
| ----------------- | ------------------- | ------------ |
| Apartment / Condo | Căn hộ / Chung cư   | `APARTMENT`  |
| House / Villa     | Nhà / Biệt thự      | `HOUSE`      |
| Townhouse         | Nhà phố             | `TOWNHOUSE`  |
| Shophouse         | Shophouse           | `SHOPHOUSE`  |
| Land Plot         | Đất nền             | `LAND`       |
| Commercial Space  | Mặt bằng thương mại | `COMMERCIAL` |
| Officetel         | Officetel           | `OFFICETEL`  |

### 5.2 Listing Data Fields / Trường Dữ Liệu

| Field (EN)            | Trường (VI)         | Type                      | Required |
| --------------------- | ------------------- | ------------------------- | :------: |
| Title                 | Tiêu đề             | `varchar` (i18n)          |    ✅    |
| Description           | Mô tả               | `text` (i18n)             |    ✅    |
| Property Type         | Loại BĐS            | `pgEnum`                  |    ✅    |
| Transaction Type      | Loại giao dịch      | `pgEnum` (RENT/SELL/BOTH) |    ✅    |
| Price (USD)           | Giá (USD)           | `numeric(15,2)`           |    ✅    |
| Price (VND)           | Giá (VND)           | `bigint`                  |    ✅    |
| Area (m²)             | Diện tích (m²)      | `doublePrecision`         |    ✅    |
| Bedrooms              | Phòng ngủ           | `integer`                 |    ✅    |
| Bathrooms             | Phòng tắm           | `integer`                 |    ✅    |
| Floor                 | Tầng                | `integer`                 |    ⬜    |
| Direction             | Hướng               | `pgEnum`                  |    ⬜    |
| Legal Status          | Tình trạng pháp lý  | `varchar` (i18n)          |    ✅    |
| Address               | Địa chỉ             | `varchar` (i18n)          |    ✅    |
| Province/City         | Tỉnh/Thành phố      | `varchar`                 |    ✅    |
| District              | Quận/Huyện          | `varchar`                 |    ✅    |
| Ward                  | Phường/Xã           | `varchar`                 |    ✅    |
| Latitude              | Vĩ độ               | `doublePrecision`         |    ⬜    |
| Longitude             | Kinh độ             | `doublePrecision`         |    ⬜    |
| Images                | Hình ảnh            | `text[]` (URLs)           |    ✅    |
| Video Tour URL        | URL video tham quan | `varchar`                 |    ⬜    |
| Amenities             | Tiện ích            | `jsonb` (i18n)            |    ⬜    |
| Furnished Status      | Tình trạng nội thất | `pgEnum`                  |    ⬜    |
| Year Built            | Năm xây dựng        | `integer`                 |    ⬜    |
| Installment Available | Hỗ trợ trả góp      | `boolean`                 |    ✅    |
| Owner ID              | Mã chủ sở hữu       | `uuid` (FK)               |    ✅    |
| Status                | Trạng thái          | `pgEnum`                  |    ✅    |

### 5.3 Listing Status Flow / Luồng Trạng Thái

```
DRAFT → PENDING_REVIEW → APPROVED → ACTIVE → RESERVED → RENTED/SOLD → ARCHIVED
                ↓                                                    ↑
            REJECTED ─────────────────────────────────────────── (re-edit)
```

---

## 6. Rental Service / Dịch Vụ Cho Thuê

### 6.1 Rental Types / Loại Cho Thuê

| Type (EN)        | Loại (VI)      | Min Duration | Pricing           |
| ---------------- | -------------- | ------------ | ----------------- |
| Long-term Lease  | Thuê dài hạn   | 6 months     | Monthly (USD/VND) |
| Short-term Lease | Thuê ngắn hạn  | 1 month      | Monthly (USD/VND) |
| Daily Rental     | Thuê theo ngày | 1 day        | Daily (USD/VND)   |

### 6.2 Rental Workflow / Quy Trình Cho Thuê

**EN:**

1. Tenant browses and selects a property
2. Tenant submits a rental application (via Sales or directly)
3. Office Admin verifies tenant identity and documents
4. Owner reviews and approves/rejects the application
5. Lease agreement is generated (bilingual template)
6. Tenant pays deposit (typically 1–3 months' rent) + first month
7. Key handover and move-in
8. Monthly rent collection tracked in system
9. Maintenance requests managed through the platform
10. Lease renewal or termination

**VI:**

1. Người thuê duyệt và chọn BĐS
2. Người thuê gửi đơn đăng ký thuê (qua Sales hoặc trực tiếp)
3. Quản trị Văn phòng xác minh danh tính và giấy tờ
4. Chủ nhà xem xét và chấp thuận/từ chối
5. Hệ thống tạo hợp đồng thuê (mẫu song ngữ)
6. Người thuê thanh toán tiền đặt cọc (thường 1–3 tháng tiền thuê) + tháng đầu
7. Bàn giao chìa khóa và nhận nhà
8. Thu tiền thuê hàng tháng được theo dõi trên hệ thống
9. Yêu cầu bảo trì được quản lý qua nền tảng
10. Gia hạn hoặc chấm dứt hợp đồng

### 6.3 Rental Pricing Example / Ví Dụ Giá Thuê

| Property                         | Monthly (USD) | Monthly (VND) |
| -------------------------------- | ------------: | ------------: |
| 1BR Apartment (District 2, HCMC) |          $600 |  15,000,000 ₫ |
| 2BR Apartment (Cau Giay, Hanoi)  |          $500 |  12,500,000 ₫ |
| 3BR House (Da Nang)              |          $400 |  10,000,000 ₫ |
| Studio (Thu Duc, HCMC)           |          $300 |   7,500,000 ₫ |
| Shophouse (Phu My Hung)          |        $1,500 |  37,500,000 ₫ |

> **Note / Lưu ý:** Prices are illustrative. The system supports real-time USD ↔ VND conversion via configurable exchange rate.

---

## 7. Purchase & Sales Service / Dịch Vụ Mua Bán

### 7.1 Purchase Workflow / Quy Trình Mua

**EN:**

1. Buyer browses approved listings marked for sale
2. Buyer expresses interest / schedules tour (via Sales agent)
3. Sales agent facilitates negotiation between buyer and owner
4. Buyer selects payment method: Full Payment or Installment Plan
5. Deposit agreement signed (max 5% of contract price per LREB 2023)
6. Sales & Purchase Agreement (SPA) signed
7. Payment processed according to agreed schedule
8. Property handover upon completion of payment milestones
9. Ownership certificate (Pink Book) application submitted
10. Transaction completed and archived

**VI:**

1. Người mua duyệt các BĐS được duyệt đăng bán
2. Người mua bày tỏ quan tâm / đặt lịch xem nhà (qua nhân viên Sales)
3. Sales hỗ trợ đàm phán giữa người mua và chủ sở hữu
4. Người mua chọn phương thức thanh toán: Thanh toán đầy đủ hoặc Trả góp
5. Ký hợp đồng đặt cọc (tối đa 5% giá trị hợp đồng theo Luật KDBĐS 2023)
6. Ký Hợp đồng Mua bán (HĐMB)
7. Thanh toán theo lịch trình đã thỏa thuận
8. Bàn giao BĐS khi hoàn thành các mốc thanh toán
9. Nộp hồ sơ cấp Giấy chứng nhận quyền sở hữu (Sổ hồng)
10. Giao dịch hoàn tất và lưu trữ

### 7.2 Purchase Pricing Examples / Ví Dụ Giá Mua

| Property Type                    | Price (USD) |     Price (VND) |
| -------------------------------- | ----------: | --------------: |
| 2BR Apartment (HCMC, District 7) |    $120,000 | 3,000,000,000 ₫ |
| 3BR Apartment (Hanoi, Tay Ho)    |    $150,000 | 3,750,000,000 ₫ |
| Villa (Da Nang, beachfront)      |    $350,000 | 8,750,000,000 ₫ |
| Townhouse (Binh Duong)           |     $80,000 | 2,000,000,000 ₫ |
| Shophouse (HCMC, Phu My Hung)    |    $250,000 | 6,250,000,000 ₫ |

---

## 8. Installment Plan (Vietnam Regulations) / Trả Góp (Theo Quy Định Việt Nam)

> **Legal Basis / Căn cứ pháp lý:**
>
> - Law on Real Estate Business 2023 (No. 29/2023/QH15) — effective January 1, 2025
> - Housing Law 2023 — effective January 1, 2025
> - Land Law 2024 — effective January 1, 2025
> - Civil Code 2015

### 8.1 Regulatory Framework / Khung Pháp Lý

#### Deposit Regulations / Quy Định Đặt Cọc

| Rule (EN)                 | Quy định (VI)         | Value                                                |
| ------------------------- | --------------------- | ---------------------------------------------------- |
| Maximum deposit           | Tiền cọc tối đa       | **5%** of contract price                             |
| Deposit timing            | Thời điểm đặt cọc     | Only after property meets trading requirements       |
| Deposit inclusion         | Cọc tính vào đợt 1    | Deposit is included in the first installment         |
| Deposit agreement content | Nội dung hợp đồng cọc | Must state selling price and construction floor area |

#### Installment Payment Rules / Quy Tắc Thanh Toán Trả Góp

| Rule (EN)                         | Quy định (VI)                    | Value                                       |
| --------------------------------- | -------------------------------- | ------------------------------------------- |
| First installment (incl. deposit) | Đợt 1 (bao gồm cọc)              | **≤ 30%** of contract value                 |
| Subsequent installments           | Các đợt tiếp theo                | Aligned with construction progress          |
| Pre-handover cap (lease-purchase) | Tối đa trước bàn giao (thuê mua) | **≤ 50%** of contract value                 |
| Final 5% deferral                 | Giữ lại 5% cuối                  | Deferred until ownership certificate issued |
| Payment before certificate        | Thanh toán trước sổ              | **≤ 95%** of total value                    |
| Payment currency                  | Đồng tiền thanh toán             | VND (Vietnamese Dong) — required by law     |
| Payment method                    | Phương thức thanh toán           | Via licensed credit institution in Vietnam  |

#### Bank Guarantee / Bảo Lãnh Ngân Hàng

**EN:** Developers must provide a bank guarantee for off-plan property sales. However, under the 2023 REB Law, buyers may opt out of the bank guarantee in writing, potentially receiving a price discount.

**VI:** Chủ đầu tư phải cung cấp bảo lãnh ngân hàng cho BĐS hình thành trong tương lai. Tuy nhiên, theo Luật KDBĐS 2023, người mua có thể từ chối bảo lãnh ngân hàng bằng văn bản, có thể nhận giảm giá.

### 8.2 Installment Plan Templates / Mẫu Kế Hoạch Trả Góp

#### Plan A: Standard Off-Plan Purchase / Phương Án A: Mua BĐS Hình Thành Trong Tương Lai

**Example / Ví dụ:** Apartment priced at 3,000,000,000 VND ($120,000 USD)

|  #  | Milestone (EN)                  | Mốc (VI)                    |    %     |        Amount (VND) | Amount (USD) |
| :-: | ------------------------------- | --------------------------- | :------: | ------------------: | -----------: |
|  1  | Deposit (booking)               | Đặt cọc                     |    5%    |       150,000,000 ₫ |       $6,000 |
|  2  | 1st Installment (incl. deposit) | Đợt 1 (bao gồm cọc)         |   30%    |       900,000,000 ₫ |      $36,000 |
|  3  | Foundation completed            | Hoàn thành móng             |   10%    |       300,000,000 ₫ |      $12,000 |
|  4  | Structure completed (50%)       | Hoàn thành kết cấu (50%)    |   10%    |       300,000,000 ₫ |      $12,000 |
|  5  | Structure completed (100%)      | Hoàn thành kết cấu (100%)   |   10%    |       300,000,000 ₫ |      $12,000 |
|  6  | MEP & Finishing                 | Hoàn thiện M&E              |   10%    |       300,000,000 ₫ |      $12,000 |
|  7  | Handover notice                 | Thông báo bàn giao          |   15%    |       450,000,000 ₫ |      $18,000 |
|  8  | Handover + Maintenance fee (2%) | Bàn giao + Phí bảo trì (2%) |   10%    |       300,000,000 ₫ |      $12,000 |
|  9  | Pink Book issuance              | Cấp sổ hồng                 |    5%    |       150,000,000 ₫ |       $6,000 |
|     | **Total / Tổng**                |                             | **100%** | **3,000,000,000 ₫** | **$120,000** |

> **Note / Lưu ý:**
>
> - Milestone #2 includes the deposit from Milestone #1 (not additive). The deposit of 5% is part of the 30% first installment.
> - The final 5% (Milestone #9) is deferred until ownership certificate is issued, per LREB 2023.
> - All amounts above are principal only. If the buyer uses bank financing, interest rates are separate.

#### Plan B: Lease-Purchase / Phương Án B: Thuê Mua

**Example / Ví dụ:** Apartment priced at 2,000,000,000 VND ($80,000 USD)

|  #  | Milestone (EN)                  | Mốc (VI)                       |    %     |        Amount (VND) | Amount (USD) |
| :-: | ------------------------------- | ------------------------------ | :------: | ------------------: | -----------: |
|  1  | Deposit                         | Đặt cọc                        |    5%    |       100,000,000 ₫ |       $4,000 |
|  2  | 1st Installment (incl. deposit) | Đợt 1 (bao gồm cọc)            |   30%    |       600,000,000 ₫ |      $24,000 |
|  3  | Mid-construction                | Giữa xây dựng                  |   10%    |       200,000,000 ₫ |       $8,000 |
|  4  | Pre-handover cap                | Trước bàn giao                 |   10%    |       200,000,000 ₫ |       $8,000 |
|     | **Subtotal before handover**    | **Tổng trước bàn giao**        | **50%**  | **1,000,000,000 ₫** |  **$40,000** |
|  5  | Post-handover (monthly lease)   | Sau bàn giao (thuê hàng tháng) |   45%    |       900,000,000 ₫ |      $36,000 |
|  6  | Pink Book issuance              | Cấp sổ hồng                    |    5%    |       100,000,000 ₫ |       $4,000 |
|     | **Total / Tổng**                |                                | **100%** | **2,000,000,000 ₫** |  **$80,000** |

> **Note / Lưu ý:** For lease-purchase, total pre-handover payments must not exceed 50% (reduced from 70% under the old 2014 law).

### 8.3 Installment Plan with Bank Financing / Trả Góp Qua Ngân Hàng

**EN:** When the buyer uses a bank mortgage, the installment schedule integrates with the bank's disbursement plan. Common terms in Vietnam:

**VI:** Khi người mua sử dụng vay ngân hàng, lịch trả góp tích hợp với kế hoạch giải ngân của ngân hàng. Các điều kiện phổ biến tại Việt Nam:

| Parameter (EN)                       | Thông số (VI)                 | Typical Value                        |
| ------------------------------------ | ----------------------------- | ------------------------------------ |
| Loan-to-Value (LTV) for 1st property | Tỷ lệ vay/giá trị (BĐS thứ 1) | Up to 70%                            |
| LTV for 2nd property (proposed)      | Tỷ lệ vay/giá trị (BĐS thứ 2) | Up to 50% (proposed regulation)      |
| Loan term                            | Thời hạn vay                  | 10–25 years                          |
| Interest rate (promotional)          | Lãi suất ưu đãi               | ~6%–8% / year (first 1–3 years)      |
| Interest rate (floating)             | Lãi suất thả nổi              | ~9%–12% / year (after promo period)  |
| Required documents                   | Hồ sơ cần thiết               | Income proof, ID, SPA, property docs |

### 8.4 System Implementation / Triển Khai Hệ Thống

The installment plan module in the application should support:

- **Plan Creation / Tạo kế hoạch:** Admin/Office Admin configures installment milestones per property
- **Progress Tracking / Theo dõi tiến độ:** Visual dashboard showing payment milestones and completion status
- **Auto-reminders / Nhắc nhở tự động:** Email/SMS notifications before payment due dates
- **Payment Recording / Ghi nhận thanh toán:** Integration with VNPay/bank transfer confirmation
- **Overdue Alerts / Cảnh báo quá hạn:** Automated escalation for late payments
- **Deferred Payment Flagging / Đánh dấu thanh toán hoãn:** Track the final 5% deferred until Pink Book
- **Dual Currency Display / Hiển thị hai tiền tệ:** All amounts shown in both USD and VND
- **Compliance Validation / Kiểm tra tuân thủ:** System enforces the 30% first-installment cap and 50% lease-purchase cap automatically

---

## 9. Other Housing Services / Các Dịch Vụ Nhà Ở Khác

| #   | Service (EN)         | Dịch Vụ (VI)        | Description / Mô Tả                                       |
| --- | -------------------- | ------------------- | --------------------------------------------------------- |
| 1   | Property Valuation   | Định giá BĐS        | Professional appraisal service with market comparison     |
| 2   | Maintenance & Repair | Bảo trì & Sửa chữa  | Tenant/Owner can submit and track repair requests         |
| 3   | Legal Assistance     | Hỗ trợ pháp lý      | Contract review, Pink Book processing, dispute resolution |
| 4   | Interior Design      | Thiết kế nội thất   | Partner service for furnishing and decoration             |
| 5   | Moving Service       | Dịch vụ chuyển nhà  | Coordination with moving companies                        |
| 6   | Property Management  | Quản lý BĐS         | Full-service management for absentee owners               |
| 7   | Insurance Referral   | Giới thiệu bảo hiểm | Property and renter insurance partnerships                |
| 8   | Mortgage Consulting  | Tư vấn vay mua nhà  | Bank loan comparison and application assistance           |

---

## 10. Multi-Currency Support / Hỗ Trợ Đa Tiền Tệ

### 10.1 Configuration / Cấu Hình

```typescript
// lib/currency.ts
export const CURRENCIES = {
  USD: {
    code: "USD",
    symbol: "$",
    name: { en: "US Dollar", vi: "Đô la Mỹ" },
    locale: "en-US",
    decimals: 2,
  },
  VND: {
    code: "VND",
    symbol: "₫",
    name: { en: "Vietnamese Dong", vi: "Đồng Việt Nam" },
    locale: "vi-VN",
    decimals: 0,
  },
} as const;

// Exchange rate stored in DB and updated by Admin
// All prices stored in BOTH currencies in the database
// Legal transactions in Vietnam MUST be processed in VND
```

### 10.2 Display Rules / Quy Tắc Hiển Thị

| Scenario                  | Primary Display           | Secondary Display            |
| ------------------------- | ------------------------- | ---------------------------- |
| User locale = `vi`        | VND (₫)                   | USD ($) — smaller text       |
| User locale = `en`        | USD ($)                   | VND (₫) — smaller text       |
| Installment plan          | VND (₫) — required by law | USD ($) — for reference only |
| Contract / Legal document | VND (₫) — legally binding | USD ($) — informational      |

### 10.3 Formatting Examples / Ví Dụ Định Dạng

| Amount | USD Format    | VND Format       |
| ------ | ------------- | ---------------- |
| Small  | $600.00       | 15.000.000 ₫     |
| Medium | $120,000.00   | 3.000.000.000 ₫  |
| Large  | $1,500,000.00 | 37.500.000.000 ₫ |

> **Note / Lưu ý:** VND uses period (`.`) as thousand separator and no decimal places. USD uses comma (`,`) as thousand separator with 2 decimal places.

---

## 11. Multi-Language (i18n) / Đa Ngôn Ngữ

### 11.1 Next.js i18n Setup / Cài Đặt i18n

```typescript
// next.config.ts (App Router — middleware-based i18n)
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  // App Router uses middleware for locale routing
  // instead of the Pages Router i18n config
};

export default withNextIntl(nextConfig);
```

```typescript
// middleware.ts
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/config";

export default createMiddleware({
  locales: ["en", "vi"],
  defaultLocale: "vi",
  localeDetection: true,
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
```

### 11.2 Translation Structure / Cấu Trúc Dịch Thuật

```
/messages
  en.json
  vi.json
```

### 11.3 Key Translation Pairs / Các Cặp Dịch Thuật Quan Trọng

| Key                      | English        | Tiếng Việt            |
| ------------------------ | -------------- | --------------------- |
| `nav.rent`               | Rent           | Cho thuê              |
| `nav.buy`                | Buy            | Mua                   |
| `nav.sell`               | Sell           | Bán                   |
| `nav.services`           | Services       | Dịch vụ               |
| `property.price`         | Price          | Giá                   |
| `property.area`          | Area           | Diện tích             |
| `property.bedrooms`      | Bedrooms       | Phòng ngủ             |
| `property.bathrooms`     | Bathrooms      | Phòng tắm             |
| `property.direction`     | Direction      | Hướng                 |
| `installment.deposit`    | Deposit        | Đặt cọc               |
| `installment.milestone`  | Milestone      | Mốc thanh toán        |
| `installment.dueDate`    | Due Date       | Ngày đến hạn          |
| `installment.paidAmount` | Paid Amount    | Số tiền đã thanh toán |
| `installment.remaining`  | Remaining      | Còn lại               |
| `status.active`          | Active         | Đang hoạt động        |
| `status.pending`         | Pending Review | Đang chờ duyệt        |
| `status.rented`          | Rented         | Đã cho thuê           |
| `status.sold`            | Sold           | Đã bán                |

---

## 12. Database Schema (Drizzle ORM) / Sơ Đồ Cơ Sở Dữ Liệu

### 12.1 Drizzle Configuration / Cấu hình Drizzle

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/*",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

```typescript
// src/db/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, { schema });
```

### 12.2 Enums / Các Enum

```typescript
// src/db/schema/enums.ts
import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "ADMINISTRATOR",
  "OFFICE_ADMIN",
  "PROPERTY_OWNER",
  "SALES",
]);

export const propertyTypeEnum = pgEnum("property_type", [
  "APARTMENT",
  "HOUSE",
  "TOWNHOUSE",
  "SHOPHOUSE",
  "LAND",
  "COMMERCIAL",
  "OFFICETEL",
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "RENT",
  "SELL",
  "BOTH",
]);

export const listingStatusEnum = pgEnum("listing_status", [
  "DRAFT",
  "PENDING_REVIEW",
  "APPROVED",
  "ACTIVE",
  "RESERVED",
  "RENTED",
  "SOLD",
  "ARCHIVED",
  "REJECTED",
]);

export const currencyEnum = pgEnum("currency", ["USD", "VND"]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "PAID",
  "OVERDUE",
  "DEFERRED",
  "CANCELLED",
]);

export const installmentPlanTypeEnum = pgEnum("installment_plan_type", [
  "STANDARD_PURCHASE",
  "LEASE_PURCHASE",
  "BANK_FINANCED",
]);
```

### 12.3 Tables / Các Bảng

```typescript
// src/db/schema/users.ts
import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userRoleEnum } from "./enums";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  fullNameVi: varchar("full_name_vi", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  avatar: varchar("avatar", { length: 512 }),
  branchId: uuid("branch_id").references(() => branches.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  branch: one(branches, {
    fields: [users.branchId],
    references: [branches.id],
  }),
  properties: many(properties),
  leads: many(leads),
  commissions: many(commissions),
  activities: many(activityLogs),
}));
```

```typescript
// src/db/schema/branches.ts
import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const branches = pgTable("branches", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  nameVi: varchar("name_vi", { length: 255 }).notNull(),
  address: varchar("address", { length: 500 }).notNull(),
  addressVi: varchar("address_vi", { length: 500 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const branchesRelations = relations(branches, ({ many }) => ({
  users: many(users),
}));
```

```typescript
// src/db/schema/properties.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  bigint,
  doublePrecision,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  propertyTypeEnum,
  transactionTypeEnum,
  listingStatusEnum,
} from "./enums";

export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 500 }).notNull(),
  titleVi: varchar("title_vi", { length: 500 }).notNull(),
  description: text("description").notNull(),
  descriptionVi: text("description_vi").notNull(),
  propertyType: propertyTypeEnum("property_type").notNull(),
  transactionType: transactionTypeEnum("transaction_type").notNull(),
  priceUsd: numeric("price_usd", { precision: 15, scale: 2 }).notNull(),
  priceVnd: bigint("price_vnd", { mode: "bigint" }).notNull(),
  rentPriceUsd: numeric("rent_price_usd", { precision: 12, scale: 2 }),
  rentPriceVnd: bigint("rent_price_vnd", { mode: "bigint" }),
  area: doublePrecision("area").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  floor: integer("floor"),
  direction: varchar("direction", { length: 20 }),
  legalStatus: varchar("legal_status", { length: 255 }).notNull(),
  legalStatusVi: varchar("legal_status_vi", { length: 255 }).notNull(),
  address: varchar("address", { length: 500 }).notNull(),
  addressVi: varchar("address_vi", { length: 500 }).notNull(),
  province: varchar("province", { length: 100 }).notNull(),
  district: varchar("district", { length: 100 }).notNull(),
  ward: varchar("ward", { length: 100 }).notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  images: text("images").array().notNull(),
  videoUrl: varchar("video_url", { length: 512 }),
  amenities: jsonb("amenities"), // { en: [...], vi: [...] }
  furnished: varchar("furnished", { length: 50 }),
  yearBuilt: integer("year_built"),
  installmentAvail: boolean("installment_avail").default(false).notNull(),
  status: listingStatusEnum("status").default("DRAFT").notNull(),
  ownerId: uuid("owner_id")
    .references(() => users.id)
    .notNull(),
  approvedById: uuid("approved_by_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner: one(users, { fields: [properties.ownerId], references: [users.id] }),
  rentalAgreements: many(rentalAgreements),
  purchaseAgreements: many(purchaseAgreements),
  installmentPlans: many(installmentPlans),
  tours: many(tourSchedules),
  maintenanceRequests: many(maintenanceRequests),
}));
```

```typescript
// src/db/schema/rentals.ts
import {
  pgTable,
  uuid,
  varchar,
  numeric,
  bigint,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { paymentStatusEnum } from "./enums";

export const rentalAgreements = pgTable("rental_agreements", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .references(() => properties.id)
    .notNull(),
  tenantName: varchar("tenant_name", { length: 255 }).notNull(),
  tenantEmail: varchar("tenant_email", { length: 255 }).notNull(),
  tenantPhone: varchar("tenant_phone", { length: 20 }).notNull(),
  tenantIdNumber: varchar("tenant_id_number", { length: 50 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  monthlyRentUsd: numeric("monthly_rent_usd", {
    precision: 12,
    scale: 2,
  }).notNull(),
  monthlyRentVnd: bigint("monthly_rent_vnd", { mode: "bigint" }).notNull(),
  depositUsd: numeric("deposit_usd", { precision: 12, scale: 2 }).notNull(),
  depositVnd: bigint("deposit_vnd", { mode: "bigint" }).notNull(),
  status: varchar("status", { length: 20 }).default("ACTIVE").notNull(),
  contractUrl: varchar("contract_url", { length: 512 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const rentalAgreementsRelations = relations(
  rentalAgreements,
  ({ one, many }) => ({
    property: one(properties, {
      fields: [rentalAgreements.propertyId],
      references: [properties.id],
    }),
    payments: many(rentalPayments),
  }),
);

export const rentalPayments = pgTable("rental_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  agreementId: uuid("agreement_id")
    .references(() => rentalAgreements.id)
    .notNull(),
  dueDate: timestamp("due_date").notNull(),
  amountUsd: numeric("amount_usd", { precision: 12, scale: 2 }).notNull(),
  amountVnd: bigint("amount_vnd", { mode: "bigint" }).notNull(),
  paidDate: timestamp("paid_date"),
  status: paymentStatusEnum("status").default("PENDING").notNull(),
  transactionRef: varchar("transaction_ref", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rentalPaymentsRelations = relations(rentalPayments, ({ one }) => ({
  agreement: one(rentalAgreements, {
    fields: [rentalPayments.agreementId],
    references: [rentalAgreements.id],
  }),
}));
```

```typescript
// src/db/schema/purchases.ts
import {
  pgTable,
  uuid,
  varchar,
  numeric,
  bigint,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const purchaseAgreements = pgTable("purchase_agreements", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .references(() => properties.id)
    .notNull(),
  buyerName: varchar("buyer_name", { length: 255 }).notNull(),
  buyerEmail: varchar("buyer_email", { length: 255 }).notNull(),
  buyerPhone: varchar("buyer_phone", { length: 20 }).notNull(),
  buyerIdNumber: varchar("buyer_id_number", { length: 50 }).notNull(),
  totalPriceUsd: numeric("total_price_usd", {
    precision: 15,
    scale: 2,
  }).notNull(),
  totalPriceVnd: bigint("total_price_vnd", { mode: "bigint" }).notNull(),
  paymentMethod: varchar("payment_method", { length: 30 }).notNull(), // FULL_PAYMENT | INSTALLMENT | BANK_FINANCED
  bankGuarantee: boolean("bank_guarantee").default(true).notNull(),
  contractUrl: varchar("contract_url", { length: 512 }),
  status: varchar("status", { length: 20 }).default("PENDING").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const purchaseAgreementsRelations = relations(
  purchaseAgreements,
  ({ one }) => ({
    property: one(properties, {
      fields: [purchaseAgreements.propertyId],
      references: [properties.id],
    }),
    installmentPlan: one(installmentPlans),
  }),
);
```

```typescript
// src/db/schema/installments.ts
import {
  pgTable,
  uuid,
  varchar,
  numeric,
  bigint,
  doublePrecision,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { installmentPlanTypeEnum, paymentStatusEnum } from "./enums";

export const installmentPlans = pgTable("installment_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .references(() => properties.id)
    .notNull(),
  purchaseAgreementId: uuid("purchase_agreement_id")
    .references(() => purchaseAgreements.id)
    .unique(),
  planType: installmentPlanTypeEnum("plan_type").notNull(),
  totalAmountVnd: bigint("total_amount_vnd", { mode: "bigint" }).notNull(),
  totalAmountUsd: numeric("total_amount_usd", {
    precision: 15,
    scale: 2,
  }).notNull(),
  depositPercent: doublePrecision("deposit_percent").default(5.0).notNull(),
  firstInstallPercent: doublePrecision("first_install_percent")
    .default(30.0)
    .notNull(),
  status: varchar("status", { length: 20 }).default("ACTIVE").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const installmentPlansRelations = relations(
  installmentPlans,
  ({ one, many }) => ({
    property: one(properties, {
      fields: [installmentPlans.propertyId],
      references: [properties.id],
    }),
    purchaseAgreement: one(purchaseAgreements, {
      fields: [installmentPlans.purchaseAgreementId],
      references: [purchaseAgreements.id],
    }),
    milestones: many(installmentMilestones),
  }),
);

export const installmentMilestones = pgTable("installment_milestones", {
  id: uuid("id").primaryKey().defaultRandom(),
  planId: uuid("plan_id")
    .references(() => installmentPlans.id)
    .notNull(),
  milestoneOrder: integer("milestone_order").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleVi: varchar("title_vi", { length: 255 }).notNull(),
  percentage: doublePrecision("percentage").notNull(),
  amountVnd: bigint("amount_vnd", { mode: "bigint" }).notNull(),
  amountUsd: numeric("amount_usd", { precision: 15, scale: 2 }).notNull(),
  dueDate: timestamp("due_date"),
  paidDate: timestamp("paid_date"),
  status: paymentStatusEnum("status").default("PENDING").notNull(),
  transactionRef: varchar("transaction_ref", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const installmentMilestonesRelations = relations(
  installmentMilestones,
  ({ one }) => ({
    plan: one(installmentPlans, {
      fields: [installmentMilestones.planId],
      references: [installmentPlans.id],
    }),
  }),
);
```

```typescript
// src/db/schema/leads.ts
import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  salesId: uuid("sales_id")
    .references(() => users.id)
    .notNull(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientEmail: varchar("client_email", { length: 255 }),
  clientPhone: varchar("client_phone", { length: 20 }).notNull(),
  interest: varchar("interest", { length: 10 }).notNull(), // RENT | BUY | BOTH
  budget: varchar("budget", { length: 100 }),
  notes: text("notes"),
  status: varchar("status", { length: 20 }).default("NEW").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const leadsRelations = relations(leads, ({ one }) => ({
  sales: one(users, { fields: [leads.salesId], references: [users.id] }),
}));
```

```typescript
// src/db/schema/tours.ts
import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const tourSchedules = pgTable("tour_schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .references(() => properties.id)
    .notNull(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientPhone: varchar("client_phone", { length: 20 }).notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  salesId: uuid("sales_id"),
  status: varchar("status", { length: 20 }).default("SCHEDULED").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tourSchedulesRelations = relations(tourSchedules, ({ one }) => ({
  property: one(properties, {
    fields: [tourSchedules.propertyId],
    references: [properties.id],
  }),
}));
```

```typescript
// src/db/schema/commissions.ts
import {
  pgTable,
  uuid,
  varchar,
  numeric,
  bigint,
  doublePrecision,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const commissions = pgTable("commissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  transactionId: varchar("transaction_id", { length: 255 }).notNull(),
  amountUsd: numeric("amount_usd", { precision: 12, scale: 2 }).notNull(),
  amountVnd: bigint("amount_vnd", { mode: "bigint" }).notNull(),
  percentage: doublePrecision("percentage").notNull(),
  status: varchar("status", { length: 20 }).default("PENDING").notNull(),
  paidDate: timestamp("paid_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const commissionsRelations = relations(commissions, ({ one }) => ({
  user: one(users, { fields: [commissions.userId], references: [users.id] }),
}));
```

```typescript
// src/db/schema/maintenance.ts
import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const maintenanceRequests = pgTable("maintenance_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .references(() => properties.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleVi: varchar("title_vi", { length: 255 }),
  description: text("description").notNull(),
  priority: varchar("priority", { length: 20 }).default("MEDIUM").notNull(),
  status: varchar("status", { length: 20 }).default("OPEN").notNull(),
  images: text("images").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const maintenanceRequestsRelations = relations(
  maintenanceRequests,
  ({ one }) => ({
    property: one(properties, {
      fields: [maintenanceRequests.propertyId],
      references: [properties.id],
    }),
  }),
);
```

```typescript
// src/db/schema/exchange-rates.ts
import {
  pgTable,
  uuid,
  varchar,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";

export const exchangeRates = pgTable("exchange_rates", {
  id: uuid("id").primaryKey().defaultRandom(),
  fromCurrency: varchar("from_currency", { length: 3 }).notNull(),
  toCurrency: varchar("to_currency", { length: 3 }).notNull(),
  rate: numeric("rate", { precision: 15, scale: 4 }).notNull(),
  effectiveAt: timestamp("effective_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

```typescript
// src/db/schema/activity-logs.ts
import { pgTable, uuid, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entity: varchar("entity", { length: 100 }).notNull(),
  entityId: varchar("entity_id", { length: 255 }).notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
}));
```

### 12.4 Migrations / Quản lý Migration

```bash
# Generate migration files from schema changes
npx drizzle-kit generate

# Apply migrations to the database
npx drizzle-kit migrate

# Push schema directly (development only — no migration files)
npx drizzle-kit push

# Launch Drizzle Studio for visual database browsing
npx drizzle-kit studio
```

---

## 13. Server Actions / Các Server Action

> **Architecture Note:** This application uses Next.js Server Actions instead of REST API routes. Server Actions run exclusively on the server, provide end-to-end type safety, support progressive enhancement (forms work without JavaScript), and integrate with Next.js caching via `revalidatePath` and `revalidateTag`.

### 13.1 Authentication / Xác Thực

```typescript
// src/actions/auth.ts
"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { signIn, signOut } from "@/auth";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = loginSchema.extend({
  fullName: z.string().min(1),
  fullNameVi: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(["PROPERTY_OWNER", "SALES"]),
});

export async function login(formData: FormData) {
  const parsed = loginSchema.parse(Object.fromEntries(formData));
  await signIn("credentials", {
    email: parsed.email,
    password: parsed.password,
    redirectTo: "/dashboard",
  });
}

export async function register(formData: FormData) {
  const parsed = registerSchema.parse(Object.fromEntries(formData));
  const hashed = await hashPassword(parsed.password);

  await db.insert(users).values({
    email: parsed.email,
    passwordHash: hashed,
    fullName: parsed.fullName,
    fullNameVi: parsed.fullNameVi,
    phone: parsed.phone,
    role: parsed.role,
  });

  await signIn("credentials", {
    email: parsed.email,
    password: parsed.password,
    redirectTo: "/dashboard",
  });
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
```

### 13.2 Properties / Bất Động Sản

```typescript
// src/actions/properties.ts
"use server";

import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq, and, ilike, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAuth, requireRoles } from "@/lib/auth-guard";
import { z } from "zod";

// ─── List (with filters) ─── Roles: All
export async function getProperties(filters?: {
  search?: string;
  propertyType?: string;
  transactionType?: string;
  minPrice?: number;
  maxPrice?: number;
  province?: string;
}) {
  const conditions = [eq(properties.status, "ACTIVE")];

  if (filters?.search) {
    conditions.push(ilike(properties.title, `%${filters.search}%`));
  }
  if (filters?.propertyType) {
    conditions.push(eq(properties.propertyType, filters.propertyType as any));
  }

  return db.query.properties.findMany({
    where: and(...conditions),
    with: { owner: { columns: { fullName: true, phone: true, avatar: true } } },
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  });
}

// ─── Detail ─── Roles: All
export async function getProperty(id: string) {
  return db.query.properties.findFirst({
    where: eq(properties.id, id),
    with: {
      owner: { columns: { fullName: true, phone: true, avatar: true } },
      tours: true,
    },
  });
}

// ─── Create ─── Roles: Admin, Office Admin, Owner
export async function createProperty(formData: FormData) {
  const session = await requireRoles([
    "ADMINISTRATOR",
    "OFFICE_ADMIN",
    "PROPERTY_OWNER",
  ]);

  const [created] = await db
    .insert(properties)
    .values({
      title: formData.get("title") as string,
      titleVi: formData.get("titleVi") as string,
      description: formData.get("description") as string,
      descriptionVi: formData.get("descriptionVi") as string,
      propertyType: formData.get("propertyType") as any,
      transactionType: formData.get("transactionType") as any,
      priceUsd: formData.get("priceUsd") as string,
      priceVnd: BigInt(formData.get("priceVnd") as string),
      area: parseFloat(formData.get("area") as string),
      bedrooms: parseInt(formData.get("bedrooms") as string),
      bathrooms: parseInt(formData.get("bathrooms") as string),
      legalStatus: formData.get("legalStatus") as string,
      legalStatusVi: formData.get("legalStatusVi") as string,
      address: formData.get("address") as string,
      addressVi: formData.get("addressVi") as string,
      province: formData.get("province") as string,
      district: formData.get("district") as string,
      ward: formData.get("ward") as string,
      images: JSON.parse(formData.get("images") as string),
      installmentAvail: formData.get("installmentAvail") === "true",
      ownerId: session.user.id,
      status: "DRAFT",
    })
    .returning();

  revalidatePath("/properties");
  return created;
}

// ─── Update ─── Roles: Admin, Office Admin, Owner*
export async function updateProperty(id: string, formData: FormData) {
  const session = await requireRoles([
    "ADMINISTRATOR",
    "OFFICE_ADMIN",
    "PROPERTY_OWNER",
  ]);

  // Owners can only update their own listings
  if (session.user.role === "PROPERTY_OWNER") {
    const existing = await db.query.properties.findFirst({
      where: and(
        eq(properties.id, id),
        eq(properties.ownerId, session.user.id),
      ),
    });
    if (!existing) throw new Error("Unauthorized");
  }

  const [updated] = await db
    .update(properties)
    .set({
      title: formData.get("title") as string,
      titleVi: formData.get("titleVi") as string,
      description: formData.get("description") as string,
      descriptionVi: formData.get("descriptionVi") as string,
    })
    .where(eq(properties.id, id))
    .returning();

  revalidatePath(`/properties/${id}`);
  revalidatePath("/properties");
  return updated;
}

// ─── Delete ─── Roles: Admin, Owner*
export async function deleteProperty(id: string) {
  const session = await requireRoles(["ADMINISTRATOR", "PROPERTY_OWNER"]);

  if (session.user.role === "PROPERTY_OWNER") {
    const existing = await db.query.properties.findFirst({
      where: and(
        eq(properties.id, id),
        eq(properties.ownerId, session.user.id),
      ),
    });
    if (!existing) throw new Error("Unauthorized");
  }

  await db.delete(properties).where(eq(properties.id, id));
  revalidatePath("/properties");
}

// ─── Update Status ─── Roles: Admin, Office Admin
export async function updatePropertyStatus(id: string, status: string) {
  await requireRoles(["ADMINISTRATOR", "OFFICE_ADMIN"]);

  const [updated] = await db
    .update(properties)
    .set({ status: status as any })
    .where(eq(properties.id, id))
    .returning();

  revalidatePath(`/properties/${id}`);
  revalidatePath("/properties");
  return updated;
}
```

### 13.3 Rentals / Cho Thuê

```typescript
// src/actions/rentals.ts
"use server";

import { db } from "@/db";
import { rentalAgreements, rentalPayments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireRoles } from "@/lib/auth-guard";

// ─── Create rental agreement ─── Roles: Admin, Office Admin
export async function createRentalAgreement(formData: FormData) {
  await requireRoles(["ADMINISTRATOR", "OFFICE_ADMIN"]);

  const [created] = await db
    .insert(rentalAgreements)
    .values({
      propertyId: formData.get("propertyId") as string,
      tenantName: formData.get("tenantName") as string,
      tenantEmail: formData.get("tenantEmail") as string,
      tenantPhone: formData.get("tenantPhone") as string,
      tenantIdNumber: formData.get("tenantIdNumber") as string,
      startDate: new Date(formData.get("startDate") as string),
      endDate: new Date(formData.get("endDate") as string),
      monthlyRentUsd: formData.get("monthlyRentUsd") as string,
      monthlyRentVnd: BigInt(formData.get("monthlyRentVnd") as string),
      depositUsd: formData.get("depositUsd") as string,
      depositVnd: BigInt(formData.get("depositVnd") as string),
    })
    .returning();

  revalidatePath("/rentals");
  return created;
}

// ─── List agreements ─── Roles: Admin, Office Admin, Owner*
export async function getRentalAgreements() {
  const session = await requireRoles([
    "ADMINISTRATOR",
    "OFFICE_ADMIN",
    "PROPERTY_OWNER",
  ]);

  return db.query.rentalAgreements.findMany({
    with: {
      property: { columns: { title: true, titleVi: true, address: true } },
    },
    orderBy: (r, { desc }) => [desc(r.createdAt)],
  });
}

// ─── Agreement detail ─── Roles: Admin, Office Admin, Owner*
export async function getRentalAgreement(id: string) {
  return db.query.rentalAgreements.findFirst({
    where: eq(rentalAgreements.id, id),
    with: { property: true, payments: true },
  });
}

// ─── Record payment ─── Roles: Admin, Office Admin
export async function recordRentalPayment(
  agreementId: string,
  formData: FormData,
) {
  await requireRoles(["ADMINISTRATOR", "OFFICE_ADMIN"]);

  const [payment] = await db
    .insert(rentalPayments)
    .values({
      agreementId,
      dueDate: new Date(formData.get("dueDate") as string),
      amountUsd: formData.get("amountUsd") as string,
      amountVnd: BigInt(formData.get("amountVnd") as string),
      paidDate: new Date(),
      status: "PAID",
      transactionRef: formData.get("transactionRef") as string,
    })
    .returning();

  revalidatePath(`/rentals/${agreementId}`);
  return payment;
}
```

### 13.4 Purchases / Mua Bán

```typescript
// src/actions/purchases.ts
"use server";

import { db } from "@/db";
import { purchaseAgreements } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireRoles } from "@/lib/auth-guard";

// ─── Create purchase agreement ─── Roles: Admin, Office Admin
export async function createPurchaseAgreement(formData: FormData) {
  await requireRoles(["ADMINISTRATOR", "OFFICE_ADMIN"]);

  const [created] = await db
    .insert(purchaseAgreements)
    .values({
      propertyId: formData.get("propertyId") as string,
      buyerName: formData.get("buyerName") as string,
      buyerEmail: formData.get("buyerEmail") as string,
      buyerPhone: formData.get("buyerPhone") as string,
      buyerIdNumber: formData.get("buyerIdNumber") as string,
      totalPriceUsd: formData.get("totalPriceUsd") as string,
      totalPriceVnd: BigInt(formData.get("totalPriceVnd") as string),
      paymentMethod: formData.get("paymentMethod") as string,
      bankGuarantee: formData.get("bankGuarantee") === "true",
    })
    .returning();

  revalidatePath("/purchases");
  return created;
}

// ─── List agreements ─── Roles: Admin, Office Admin
export async function getPurchaseAgreements() {
  await requireRoles(["ADMINISTRATOR", "OFFICE_ADMIN"]);

  return db.query.purchaseAgreements.findMany({
    with: { property: { columns: { title: true, titleVi: true } } },
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  });
}

// ─── Agreement detail ─── Roles: Admin, Office Admin, Owner*
export async function getPurchaseAgreement(id: string) {
  return db.query.purchaseAgreements.findFirst({
    where: eq(purchaseAgreements.id, id),
    with: { property: true, installmentPlan: true },
  });
}

// ─── Update status ─── Roles: Admin, Office Admin
export async function updatePurchaseStatus(id: string, status: string) {
  await requireRoles(["ADMINISTRATOR", "OFFICE_ADMIN"]);

  const [updated] = await db
    .update(purchaseAgreements)
    .set({ status })
    .where(eq(purchaseAgreements.id, id))
    .returning();

  revalidatePath(`/purchases/${id}`);
  return updated;
}
```

### 13.5 Installments / Trả Góp

```typescript
// src/actions/installments.ts
"use server";

import { db } from "@/db";
import { installmentPlans, installmentMilestones } from "@/db/schema";
import { eq, and, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireRoles } from "@/lib/auth-guard";

// ─── Create plan ─── Roles: Admin, Office Admin
export async function createInstallmentPlan(formData: FormData) {
  await requireRoles(["ADMINISTRATOR", "OFFICE_ADMIN"]);

  const [plan] = await db
    .insert(installmentPlans)
    .values({
      propertyId: formData.get("propertyId") as string,
      purchaseAgreementId:
        (formData.get("purchaseAgreementId") as string) || undefined,
      planType: formData.get("planType") as any,
      totalAmountVnd: BigInt(formData.get("totalAmountVnd") as string),
      totalAmountUsd: formData.get("totalAmountUsd") as string,
      depositPercent: parseFloat(formData.get("depositPercent") as string),
      firstInstallPercent: parseFloat(
        formData.get("firstInstallPercent") as string,
      ),
    })
    .returning();

  revalidatePath("/installments");
  return plan;
}

// ─── Plan detail ─── Roles: Admin, Office Admin, Owner*
export async function getInstallmentPlan(id: string) {
  return db.query.installmentPlans.findFirst({
    where: eq(installmentPlans.id, id),
    with: { property: true, purchaseAgreement: true, milestones: true },
  });
}

// ─── Record milestone payment ─── Roles: Admin, Office Admin
export async function recordMilestonePayment(
  planId: string,
  milestoneId: string,
  formData: FormData,
) {
  await requireRoles(["ADMINISTRATOR", "OFFICE_ADMIN"]);

  const [updated] = await db
    .update(installmentMilestones)
    .set({
      status: "PAID",
      paidDate: new Date(),
      transactionRef: formData.get("transactionRef") as string,
    })
    .where(
      and(
        eq(installmentMilestones.id, milestoneId),
        eq(installmentMilestones.planId, planId),
      ),
    )
    .returning();

  revalidatePath(`/installments/${planId}`);
  return updated;
}

// ─── List overdue milestones ─── Roles: Admin, Office Admin
export async function getOverdueMilestones() {
  await requireRoles(["ADMINISTRATOR", "OFFICE_ADMIN"]);

  return db.query.installmentMilestones.findMany({
    where: and(
      eq(installmentMilestones.status, "PENDING"),
      lt(installmentMilestones.dueDate, new Date()),
    ),
    with: { plan: { with: { property: true } } },
  });
}
```

### 13.6 Leads & Tours / Khách Hàng & Lịch Xem Nhà

```typescript
// src/actions/leads-tours.ts
"use server";

import { db } from "@/db";
import { leads, tourSchedules } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { requireRoles } from "@/lib/auth-guard";

// ─── Create lead ─── Roles: Sales
export async function createLead(formData: FormData) {
  const session = await requireRoles(["SALES"]);

  const [created] = await db
    .insert(leads)
    .values({
      salesId: session.user.id,
      clientName: formData.get("clientName") as string,
      clientEmail: (formData.get("clientEmail") as string) || undefined,
      clientPhone: formData.get("clientPhone") as string,
      interest: formData.get("interest") as string,
      budget: (formData.get("budget") as string) || undefined,
      notes: (formData.get("notes") as string) || undefined,
    })
    .returning();

  revalidatePath("/leads");
  return created;
}

// ─── List leads ─── Roles: Admin, Office Admin, Sales*
export async function getLeads() {
  await requireRoles(["ADMINISTRATOR", "OFFICE_ADMIN", "SALES"]);

  return db.query.leads.findMany({
    with: { sales: { columns: { fullName: true } } },
    orderBy: (l, { desc }) => [desc(l.createdAt)],
  });
}

// ─── Schedule tour ─── Roles: Sales, Office Admin
export async function scheduleTour(formData: FormData) {
  const session = await requireRoles(["SALES", "OFFICE_ADMIN"]);

  const [created] = await db
    .insert(tourSchedules)
    .values({
      propertyId: formData.get("propertyId") as string,
      clientName: formData.get("clientName") as string,
      clientPhone: formData.get("clientPhone") as string,
      scheduledAt: new Date(formData.get("scheduledAt") as string),
      salesId: session.user.id,
      notes: (formData.get("notes") as string) || undefined,
    })
    .returning();

  revalidatePath("/tours");
  return created;
}

// ─── List tours ─── Roles: Admin, Office Admin, Sales*
export async function getTours() {
  await requireRoles(["ADMINISTRATOR", "OFFICE_ADMIN", "SALES"]);

  return db.query.tourSchedules.findMany({
    with: {
      property: { columns: { title: true, titleVi: true, address: true } },
    },
    orderBy: (t, { desc }) => [desc(t.scheduledAt)],
  });
}
```

### 13.7 System / Hệ Thống

```typescript
// src/actions/system.ts
"use server";

import { db } from "@/db";
import { users, exchangeRates, activityLogs, commissions } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireRoles } from "@/lib/auth-guard";

// ─── List users ─── Roles: Admin
export async function getUsers() {
  await requireRoles(["ADMINISTRATOR"]);

  return db.query.users.findMany({
    columns: { passwordHash: false },
    with: { branch: true },
    orderBy: (u, { desc }) => [desc(u.createdAt)],
  });
}

// ─── Update exchange rate ─── Roles: Admin
export async function updateExchangeRate(formData: FormData) {
  await requireRoles(["ADMINISTRATOR"]);

  const [rate] = await db
    .insert(exchangeRates)
    .values({
      fromCurrency: "USD",
      toCurrency: "VND",
      rate: formData.get("rate") as string,
      effectiveAt: new Date(),
    })
    .returning();

  revalidatePath("/");
  return rate;
}

// ─── Revenue report ─── Roles: Admin, Office Admin
export async function getRevenueReport(period?: { from: Date; to: Date }) {
  await requireRoles(["ADMINISTRATOR", "OFFICE_ADMIN"]);

  // Aggregate rental + purchase revenue within period
  // Implementation depends on reporting requirements
  return db.execute(sql`
    SELECT
      DATE_TRUNC('month', created_at) AS month,
      SUM(amount_vnd) AS total_vnd,
      COUNT(*) AS transaction_count
    FROM rental_payments
    WHERE status = 'PAID'
    GROUP BY month
    ORDER BY month DESC
  `);
}

// ─── Commission report ─── Roles: Admin, Office Admin
export async function getCommissionReport() {
  await requireRoles(["ADMINISTRATOR", "OFFICE_ADMIN"]);

  return db.query.commissions.findMany({
    with: { user: { columns: { fullName: true, email: true } } },
    orderBy: (c, { desc }) => [desc(c.createdAt)],
  });
}

// ─── Activity log ─── Roles: Admin
export async function getActivityLog() {
  await requireRoles(["ADMINISTRATOR"]);

  return db.query.activityLogs.findMany({
    with: { user: { columns: { fullName: true, email: true } } },
    orderBy: (a, { desc }) => [desc(a.createdAt)],
    limit: 100,
  });
}
```

> \* = Own data only / Chỉ dữ liệu của mình. Role-scoped filtering is enforced within each Server Action via the authenticated session.

---

## 14. Docker Configuration / Cấu Hình Docker

### 14.1 docker-compose.yml

```yaml
version: "3.8"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: rental-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://rental_user:${DB_PASSWORD}@db:5432/rental_db
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXT_PUBLIC_DEFAULT_LOCALE=vi
      - NEXT_PUBLIC_DEFAULT_CURRENCY=VND
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - uploads:/app/public/uploads
    networks:
      - rental-network

  db:
    image: postgres:16-alpine
    container_name: rental-db
    restart: unless-stopped
    environment:
      - POSTGRES_DB=rental_db
      - POSTGRES_USER=rental_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U rental_user -d rental_db"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - rental-network

  redis:
    image: redis:7-alpine
    container_name: rental-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - rental-network

  # Optional: PgAdmin for database management
  pgadmin:
    image: dpage/pgadmin4
    container_name: rental-pgadmin
    restart: unless-stopped
    environment:
      - PGADMIN_DEFAULT_EMAIL=${PGADMIN_EMAIL}
      - PGADMIN_DEFAULT_PASSWORD=${PGADMIN_PASSWORD}
    ports:
      - "5050:80"
    depends_on:
      - db
    networks:
      - rental-network

volumes:
  postgres_data:
  redis_data:
  uploads:

networks:
  rental-network:
    driver: bridge
```

### 14.2 Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/messages ./messages

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

> **Note:** Unlike Prisma, Drizzle ORM does not require a separate `generate` step or a binary engine in the Docker image. The schema is pure TypeScript that ships with the application bundle, resulting in leaner containers and faster cold starts.

---

## 15. Tax & Legal Compliance / Thuế & Tuân Thủ Pháp Luật

### 15.1 Transaction Taxes / Thuế Giao Dịch

| Tax Type (EN)                  | Loại Thuế (VI)            | Rate                 | Applied To                      |
| ------------------------------ | ------------------------- | -------------------- | ------------------------------- |
| VAT (commercial housing)       | VAT (nhà ở thương mại)    | 10%                  | New purchases from developers   |
| VAT (social housing)           | VAT (nhà ở xã hội)        | 5%                   | Social housing purchases        |
| Personal Income Tax (transfer) | Thuế TNCN (chuyển nhượng) | 2% of transfer price | Seller on property transfers    |
| Rental VAT                     | VAT cho thuê              | 5%                   | Rental income > 100M VND/year   |
| Rental PIT                     | Thuế TNCN cho thuê        | 5%                   | Rental income > 100M VND/year   |
| Registration Fee               | Lệ phí trước bạ           | 0.5%                 | Buyer, upon Pink Book issuance  |
| Maintenance Fund               | Quỹ bảo trì               | 2%                   | Buyer, paid to management board |

### 15.2 Foreign Ownership Rules / Quy Định Sở Hữu Người Nước Ngoài

| Rule (EN)           | Quy định (VI)          | Detail                                            |
| ------------------- | ---------------------- | ------------------------------------------------- |
| Ownership type      | Loại sở hữu            | Leasehold only (50 years, renewable)              |
| Apartment cap       | Giới hạn căn hộ        | Max 30% of units per building                     |
| House cap           | Giới hạn nhà riêng     | Max 250 houses per ward                           |
| Eligible buyer      | Người mua đủ điều kiện | Valid passport + Vietnam entry stamp              |
| Payment requirement | Yêu cầu thanh toán     | Must be through licensed credit institution in VN |
| Overseas Vietnamese | Việt kiều              | Same rights as Vietnamese citizens                |

---

## 16. Appendix / Phụ Lục

### 16.1 Environment Variables / Biến Môi Trường

```env
# Database
DATABASE_URL=postgresql://rental_user:password@localhost:5432/rental_db

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Localization
NEXT_PUBLIC_DEFAULT_LOCALE=vi
NEXT_PUBLIC_DEFAULT_CURRENCY=VND

# Payment Gateways
VNPAY_TMN_CODE=your-vnpay-code
VNPAY_HASH_SECRET=your-vnpay-secret
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLIC_KEY=pk_test_xxx

# Cloudflare R2 Storage
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=rental-uploads
R2_PUBLIC_URL=https://rental-uploads.<account-id>.r2.dev

# Redis
REDIS_URL=redis://localhost:6379

# Exchange Rate
DEFAULT_EXCHANGE_RATE_USD_VND=25000

# PgAdmin
PGADMIN_EMAIL=admin@rental.com
PGADMIN_PASSWORD=admin-password
```

### 16.2 Common Vietnamese Real Estate Terms / Thuật Ngữ BĐS Tiếng Việt

| Vietnamese        | English                    | Context                                     |
| ----------------- | -------------------------- | ------------------------------------------- |
| Sổ hồng           | Pink Book                  | Ownership certificate for houses/apartments |
| Sổ đỏ             | Red Book                   | Land use right certificate                  |
| Quyền sử dụng đất | Land Use Right (LUR)       | Legal right to use land                     |
| Nhà ở thương mại  | Commercial housing         | Housing developed for commercial sale       |
| Nhà ở xã hội      | Social housing             | Government-subsidized affordable housing    |
| Chủ đầu tư        | Developer / Investor       | Property development company                |
| Hợp đồng mua bán  | Sales & Purchase Agreement | Binding sales contract                      |
| Đặt cọc           | Deposit                    | Initial payment to secure property          |
| Bàn giao          | Handover                   | Transfer of property to buyer/tenant        |
| Phí bảo trì       | Maintenance fee            | 2% fund for building maintenance            |
| Thuê mua          | Lease-purchase             | Rent-to-own arrangement                     |
| Công chứng        | Notarization               | Legal certification of documents            |
| Trả góp           | Installment payment        | Paying in scheduled portions                |
| Lệ phí trước bạ   | Registration fee           | Fee paid upon property registration         |

### 16.3 Reference Links / Tài Liệu Tham Khảo

- Housing Law 2023 (No. 27/2023/QH15)
- Law on Real Estate Business 2023 (No. 29/2023/QH15)
- Land Law 2024 (No. 31/2024/QH15)
- Civil Code 2015 (No. 91/2015/QH13)
- Circular 40/2021/TT-BTC (Tax filing procedures)
- QCVN 04:2021/BXD (National Technical Regulation on apartment buildings)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

> **Document prepared for:** House/Apartment Rental Application Development Team  
> **Last updated:** March 22, 2026  
> **Classification:** Internal — Development Reference
