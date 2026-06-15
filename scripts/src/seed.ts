import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { usersTable, departmentsTable, doctorsTable } from "../../lib/db/src/schema/index.js";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const SALT_ROUNDS = 12;

const seedUsers = [
  { email: "admin@hanapcare.ph", password: "Admin@1234", fullName: "System Administrator", role: "Admin" },
  { email: "doctor@hanapcare.ph", password: "Doctor@1234", fullName: "Dr. Jose Rizal", role: "Doctor" },
  { email: "nurse@hanapcare.ph", password: "Nurse@1234", fullName: "Nurse Maria Santos", role: "Nurse" },
  { email: "receptionist@hanapcare.ph", password: "Recept@1234", fullName: "Ana Reyes", role: "Receptionist" },
  { email: "pharmacist@hanapcare.ph", password: "Pharma@1234", fullName: "Juan dela Cruz", role: "Pharmacist" },
  { email: "lab@hanapcare.ph", password: "Lab@12345", fullName: "Lab Staff User", role: "Lab Staff" },
  { email: "cashier@hanapcare.ph", password: "Cash@1234", fullName: "Cashier User", role: "Cashier" },
];

const seedDepartments = [
  { name: "Emergency", description: "Emergency and trauma care" },
  { name: "Internal Medicine", description: "General internal medicine" },
  { name: "Surgery", description: "Surgical procedures" },
  { name: "Pediatrics", description: "Child healthcare" },
  { name: "Obstetrics & Gynecology", description: "Women's health and maternity" },
  { name: "Cardiology", description: "Heart and cardiovascular care" },
  { name: "Radiology", description: "Medical imaging" },
  { name: "Laboratory", description: "Diagnostic laboratory services" },
  { name: "Pharmacy", description: "Medication dispensing" },
  { name: "Orthopedics", description: "Bone and joint care" },
];

async function seed() {
  console.log("🌱 Seeding database...");

  console.log("  → Seeding users...");
  for (const u of seedUsers) {
    const passwordHash = await bcrypt.hash(u.password, SALT_ROUNDS);
    await db
      .insert(usersTable)
      .values({ email: u.email, passwordHash, fullName: u.fullName, role: u.role, isActive: true })
      .onConflictDoNothing();
  }
  console.log(`  ✓ ${seedUsers.length} users seeded`);

  console.log("  → Seeding departments...");
  for (const d of seedDepartments) {
    await db
      .insert(departmentsTable)
      .values(d)
      .onConflictDoNothing();
  }
  console.log(`  ✓ ${seedDepartments.length} departments seeded`);

  console.log("✅ Seed complete!");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
