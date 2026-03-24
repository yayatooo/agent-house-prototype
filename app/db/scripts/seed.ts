import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../schema";
import { logger } from "../logger";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// ─── Seed Data ────────────────────────────────────────────────────────────────

const BRANCH_ID = "00000000-0000-0000-0000-000000000001";
const ADMIN_ID = "00000000-0000-0000-0000-000000000010";
const OFFICE_ADMIN_ID = "00000000-0000-0000-0000-000000000011";
const OWNER_ID = "00000000-0000-0000-0000-000000000012";
const SALES_ID = "00000000-0000-0000-0000-000000000013";
const PROPERTY_1_ID = "00000000-0000-0000-0000-000000000020";
const PROPERTY_2_ID = "00000000-0000-0000-0000-000000000021";

async function seedBranches() {
  logger.step("Seeding branches...");
  await db.insert(schema.branches).values([
    {
      id: BRANCH_ID,
      name: "Ho Chi Minh City Office",
      nameVi: "Văn Phòng TP. Hồ Chí Minh",
      address: "123 Nguyen Hue Street, District 1",
      addressVi: "123 Đường Nguyễn Huệ, Quận 1",
      city: "Ho Chi Minh City",
      phone: "+84 28 1234 5678",
      isActive: true,
    },
  ]).onConflictDoNothing();
  logger.success("Branches seeded");
}

async function seedUsers() {
  logger.step("Seeding users...");

  // Passwords are placeholder hashes — replace with real bcrypt hashes before use
  const placeholderHash = "$2b$10$placeholderHashForSeedingOnly.DoNotUseInProd";

  await db.insert(schema.users).values([
    {
      id: ADMIN_ID,
      email: "admin@housing.vn",
      passwordHash: placeholderHash,
      role: "ADMINISTRATOR",
      fullName: "System Administrator",
      fullNameVi: "Quản Trị Hệ Thống",
      phone: "+84 90 000 0001",
      branchId: BRANCH_ID,
      isActive: true,
    },
    {
      id: OFFICE_ADMIN_ID,
      email: "office@housing.vn",
      passwordHash: placeholderHash,
      role: "OFFICE_ADMIN",
      fullName: "Nguyen Van A",
      fullNameVi: "Nguyễn Văn A",
      phone: "+84 90 000 0002",
      branchId: BRANCH_ID,
      isActive: true,
    },
    {
      id: OWNER_ID,
      email: "owner@housing.vn",
      passwordHash: placeholderHash,
      role: "PROPERTY_OWNER",
      fullName: "Tran Thi B",
      fullNameVi: "Trần Thị B",
      phone: "+84 90 000 0003",
      branchId: BRANCH_ID,
      isActive: true,
    },
    {
      id: SALES_ID,
      email: "sales@housing.vn",
      passwordHash: placeholderHash,
      role: "SALES",
      fullName: "Le Van C",
      fullNameVi: "Lê Văn C",
      phone: "+84 90 000 0004",
      branchId: BRANCH_ID,
      isActive: true,
    },
  ]).onConflictDoNothing();

  logger.success("Users seeded (4 accounts)");
}

async function seedProperties() {
  logger.step("Seeding properties...");
  await db.insert(schema.properties).values([
    {
      id: PROPERTY_1_ID,
      title: "Modern 2-Bedroom Apartment in District 7",
      titleVi: "Căn Hộ 2 Phòng Ngủ Hiện Đại Tại Quận 7",
      description:
        "A bright, modern apartment in the heart of Phu My Hung with full amenities. High floor with city views.",
      descriptionVi:
        "Căn hộ hiện đại, sáng sủa tại trung tâm Phú Mỹ Hưng với đầy đủ tiện ích. Tầng cao với view thành phố.",
      propertyType: "APARTMENT",
      transactionType: "BOTH",
      priceUsd: "120000.00",
      priceVnd: BigInt(3_000_000_000),
      rentPriceUsd: "600.00",
      rentPriceVnd: BigInt(15_000_000),
      area: 75.5,
      bedrooms: 2,
      bathrooms: 2,
      floor: 18,
      direction: "SOUTH_EAST",
      legalStatus: "Pink Book (Sổ Hồng) available",
      legalStatusVi: "Sổ Hồng đầy đủ",
      address: "456 Nguyen Van Linh, District 7, Ho Chi Minh City",
      addressVi: "456 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh",
      province: "Ho Chi Minh City",
      district: "District 7",
      ward: "Tan Phong",
      images: [
        "https://example.com/property1/img1.jpg",
        "https://example.com/property1/img2.jpg",
      ],
      amenities: {
        en: ["Swimming Pool", "Gym", "Security 24/7", "Parking", "Elevator"],
        vi: ["Hồ Bơi", "Phòng Gym", "Bảo Vệ 24/7", "Bãi Đậu Xe", "Thang Máy"],
      },
      furnished: "FULL",
      yearBuilt: 2020,
      installmentAvail: true,
      status: "ACTIVE",
      ownerId: OWNER_ID,
      approvedById: OFFICE_ADMIN_ID,
    },
    {
      id: PROPERTY_2_ID,
      title: "3-Bedroom House in Thu Duc City",
      titleVi: "Nhà 3 Phòng Ngủ Tại TP. Thủ Đức",
      description:
        "Spacious townhouse in a quiet residential area. Garden and private parking included.",
      descriptionVi:
        "Nhà phố rộng rãi trong khu dân cư yên tĩnh. Có sân vườn và chỗ để xe riêng.",
      propertyType: "TOWNHOUSE",
      transactionType: "RENT",
      priceUsd: "0.00",
      priceVnd: BigInt(0),
      rentPriceUsd: "400.00",
      rentPriceVnd: BigInt(10_000_000),
      area: 120.0,
      bedrooms: 3,
      bathrooms: 2,
      floor: 1,
      direction: "EAST",
      legalStatus: "Long-term lease available",
      legalStatusVi: "Có hợp đồng thuê dài hạn",
      address: "789 Vo Van Ngan, Thu Duc City",
      addressVi: "789 Võ Văn Ngân, TP. Thủ Đức",
      province: "Ho Chi Minh City",
      district: "Thu Duc City",
      ward: "Binh Tho",
      images: ["https://example.com/property2/img1.jpg"],
      amenities: {
        en: ["Garden", "Parking", "Near school"],
        vi: ["Sân Vườn", "Bãi Đậu Xe", "Gần Trường"],
      },
      furnished: "PARTIAL",
      yearBuilt: 2018,
      installmentAvail: false,
      status: "ACTIVE",
      ownerId: OWNER_ID,
      approvedById: OFFICE_ADMIN_ID,
    },
  ]).onConflictDoNothing();

  logger.success("Properties seeded (2 listings)");
}

async function seedExchangeRate() {
  logger.step("Seeding exchange rate...");
  await db.insert(schema.exchangeRates).values({
    fromCurrency: "USD",
    toCurrency: "VND",
    rate: "25000.0000",
    effectiveAt: new Date(),
  });
  logger.success("Exchange rate seeded (1 USD = 25,000 VND)");
}

async function seedLeads() {
  logger.step("Seeding leads...");
  await db.insert(schema.leads).values([
    {
      salesId: SALES_ID,
      clientName: "Pham Minh D",
      clientEmail: "phamD@email.com",
      clientPhone: "+84 91 111 2222",
      interest: "BUY",
      budget: "$100,000 - $150,000",
      notes: "Interested in District 7 apartments, prefers high floor",
      status: "NEW",
    },
    {
      salesId: SALES_ID,
      clientName: "Hoang Thi E",
      clientEmail: "hoangE@email.com",
      clientPhone: "+84 91 333 4444",
      interest: "RENT",
      budget: "$400 - $600/month",
      notes: "Looking for a 2BR apartment near international school",
      status: "CONTACTED",
    },
  ]).onConflictDoNothing();
  logger.success("Leads seeded (2 leads)");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  logger.divider();
  logger.info("Starting database seed...");

  try {
    await seedBranches();
    await seedUsers();
    await seedProperties();
    await seedExchangeRate();
    await seedLeads();

    logger.divider();
    logger.success("Seed completed successfully");
  } catch (err) {
    logger.error("Seed failed", (err as Error).message);
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
    logger.divider();
  }
}

seed();
