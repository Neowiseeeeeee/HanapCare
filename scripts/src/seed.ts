import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  usersTable,
  departmentsTable,
  staffTable,
  doctorsTable,
  patientsTable,
  wardsTable,
  bedsTable,
  medicinesTable,
  appointmentsTable,
  leaveRequestsTable,
} from "../../lib/db/src/schema/index.js";
import { eq } from "drizzle-orm";

const { Pool } = pg;

const connectionString = process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("NEON_DATABASE_URL or DATABASE_URL must be set");

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("neon.tech") ? { rejectUnauthorized: false } : undefined,
});
const db = drizzle(pool);
const SALT_ROUNDS = 12;

// ────────────────────────────────────────────────────────────────────────────
// Users
// ────────────────────────────────────────────────────────────────────────────
const seedUsers = [
  { email: "admin@hanapcare.ph",        password: "Admin@1234",   fullName: "System Administrator",  role: "Admin" },
  { email: "doctor@hanapcare.ph",       password: "Doctor@1234",  fullName: "Dr. Jose Rizal",         role: "Doctor" },
  { email: "nurse@hanapcare.ph",        password: "Nurse@1234",   fullName: "Nurse Maria Santos",     role: "Nurse" },
  { email: "receptionist@hanapcare.ph", password: "Recept@1234",  fullName: "Ana Reyes",              role: "Receptionist" },
  { email: "pharmacist@hanapcare.ph",   password: "Pharma@1234",  fullName: "Juan dela Cruz",         role: "Pharmacist" },
  { email: "lab@hanapcare.ph",          password: "Lab@12345",    fullName: "Lab Staff User",         role: "Lab Staff" },
  { email: "cashier@hanapcare.ph",      password: "Cash@1234",    fullName: "Cashier User",           role: "Cashier" },
  { email: "support@hanapcare.ph",      password: "Support@1234", fullName: "Support Agent",          role: "Support" },
  { email: "hr@hanapcare.ph",           password: "Hr@12345",     fullName: "Cynthia Bautista",       role: "HR Manager" },
];

// ────────────────────────────────────────────────────────────────────────────
// Departments (10)
// ────────────────────────────────────────────────────────────────────────────
const seedDepartments = [
  { name: "Emergency",                   description: "Emergency and trauma care" },
  { name: "Internal Medicine",           description: "General internal medicine" },
  { name: "Surgery",                     description: "Surgical procedures" },
  { name: "Pediatrics",                  description: "Child healthcare" },
  { name: "Obstetrics & Gynecology",     description: "Women's health and maternity" },
  { name: "Cardiology",                  description: "Heart and cardiovascular care" },
  { name: "Radiology",                   description: "Medical imaging" },
  { name: "Laboratory",                  description: "Diagnostic laboratory services" },
  { name: "Pharmacy",                    description: "Medication dispensing" },
  { name: "Orthopedics",                 description: "Bone and joint care" },
];

async function seed() {
  const target = connectionString!.includes("neon.tech") ? "Neon" : "Replit PostgreSQL";
  console.log(`🌱 Seeding ${target}...`);

  // ── Users ──────────────────────────────────────────────────────────────────
  console.log("  → Seeding users…");
  for (const u of seedUsers) {
    const passwordHash = await bcrypt.hash(u.password, SALT_ROUNDS);
    await db.insert(usersTable).values({
      email: u.email, passwordHash, fullName: u.fullName, role: u.role, isActive: true, profileComplete: true,
    }).onConflictDoUpdate({
      target: usersTable.email,
      set: { passwordHash, fullName: u.fullName, role: u.role, isActive: true },
    });
  }
  console.log(`  ✓ ${seedUsers.length} users seeded`);

  const allUsers = await db.select().from(usersTable);
  const userByEmail = Object.fromEntries(allUsers.map((u) => [u.email, u]));

  // ── Departments ────────────────────────────────────────────────────────────
  console.log("  → Seeding departments…");
  for (const d of seedDepartments) {
    await db.insert(departmentsTable).values(d).onConflictDoNothing();
  }
  const allDepts = await db.select().from(departmentsTable);
  const deptByName = Object.fromEntries(allDepts.map((d) => [d.name, d]));
  console.log(`  ✓ ${allDepts.length} departments`);

  // ── Staff records ──────────────────────────────────────────────────────────
  console.log("  → Seeding staff records…");
  const staffSeeds = [
    // Demo login accounts
    { email: "doctor@hanapcare.ph",       firstName: "Jose",      lastName: "Rizal",        role: "Doctor",      dept: "Internal Medicine",      employeeId: "HC-DOC-001", shift: "Day (8AM–5PM)",        joinedAt: "2020-03-15" },
    { email: "nurse@hanapcare.ph",        firstName: "Maria",     lastName: "Santos",       role: "Nurse",       dept: "Internal Medicine",      employeeId: "HC-NRS-001", shift: "Morning (6AM–2PM)",    joinedAt: "2021-06-01" },
    { email: "receptionist@hanapcare.ph", firstName: "Ana",       lastName: "Reyes",        role: "Receptionist",dept: "Emergency",              employeeId: "HC-RCP-001", shift: "Day (8AM–5PM)",        joinedAt: "2022-01-10" },
    { email: "pharmacist@hanapcare.ph",   firstName: "Juan",      lastName: "dela Cruz",    role: "Pharmacist",  dept: "Pharmacy",               employeeId: "HC-PHA-001", shift: "Day (8AM–5PM)",        joinedAt: "2019-08-20" },
    { email: "lab@hanapcare.ph",          firstName: "Alex",      lastName: "Mendoza",      role: "Lab Staff",   dept: "Laboratory",             employeeId: "HC-LAB-001", shift: "Afternoon (2PM–10PM)", joinedAt: "2021-11-05" },
    { email: "cashier@hanapcare.ph",      firstName: "Leo",       lastName: "Tan",          role: "Cashier",     dept: null,                     employeeId: "HC-CSH-001", shift: "Day (8AM–5PM)",        joinedAt: "2022-04-18" },
    { email: "support@hanapcare.ph",      firstName: "Support",   lastName: "Agent",        role: "Support",     dept: null,                     employeeId: "HC-SUP-001", shift: "Flexible",             joinedAt: "2023-02-27" },
    { email: "hr@hanapcare.ph",           firstName: "Cynthia",   lastName: "Bautista",     role: "HR Manager",  dept: null,                     employeeId: "HC-HR-001",  shift: "Day (8AM–5PM)",        joinedAt: "2018-09-03" },
    // Cardiology
    { email: "nurse.villanueva@hanapcare.ph",  firstName: "Elena",    lastName: "Villanueva", role: "Nurse",   dept: "Cardiology",             employeeId: "HC-NRS-010", shift: "Day (8AM–5PM)",        joinedAt: "2021-03-10" },
    { email: "nurse.pascual@hanapcare.ph",     firstName: "Marco",    lastName: "Pascual",    role: "Nurse",   dept: "Cardiology",             employeeId: "HC-NRS-011", shift: "Night (10PM–6AM)",     joinedAt: "2022-07-01" },
    { email: "dr.aquino.cardio@hanapcare.ph",  firstName: "Rosario",  lastName: "Aquino",     role: "Doctor",  dept: "Cardiology",             employeeId: "HC-DOC-010", shift: "Day (8AM–5PM)",        joinedAt: "2019-05-15" },
    // Dermatology
    { email: "nurse.navarro@hanapcare.ph",     firstName: "Luisa",    lastName: "Navarro",    role: "Nurse",   dept: "Dermatology",            employeeId: "HC-NRS-012", shift: "Day (8AM–5PM)",        joinedAt: "2020-09-01" },
    { email: "nurse.bautista@hanapcare.ph",    firstName: "Rafael",   lastName: "Bautista",   role: "Nurse",   dept: "Dermatology",            employeeId: "HC-NRS-013", shift: "Morning (6AM–2PM)",    joinedAt: "2023-01-15" },
    { email: "dr.ocampo@hanapcare.ph",         firstName: "Carmen",   lastName: "Ocampo",     role: "Doctor",  dept: "Dermatology",            employeeId: "HC-DOC-011", shift: "Day (8AM–5PM)",        joinedAt: "2018-11-20" },
    // Emergency
    { email: "dr.salazar@hanapcare.ph",        firstName: "Jose",     lastName: "Salazar",    role: "Doctor",  dept: "Emergency",              employeeId: "HC-DOC-012", shift: "24/7 On-call",         joinedAt: "2017-06-01" },
    { email: "nurse.delatorre@hanapcare.ph",   firstName: "Marites",  lastName: "Dela Torre", role: "Nurse",   dept: "Emergency",              employeeId: "HC-NRS-014", shift: "Evening (2PM–10PM)",   joinedAt: "2021-08-10" },
    { email: "nurse.fernandez@hanapcare.ph",   firstName: "Noel",     lastName: "Fernandez",  role: "Nurse",   dept: "Emergency",              employeeId: "HC-NRS-015", shift: "Night (10PM–6AM)",     joinedAt: "2022-04-05" },
    // Internal Medicine
    { email: "nurse.lorenzo@hanapcare.ph",     firstName: "Patricia", lastName: "Lorenzo",    role: "Nurse",   dept: "Internal Medicine",      employeeId: "HC-NRS-016", shift: "Day (8AM–5PM)",        joinedAt: "2020-02-14" },
    { email: "dr.soriano@hanapcare.ph",        firstName: "Eduardo",  lastName: "Soriano",    role: "Doctor",  dept: "Internal Medicine",      employeeId: "HC-DOC-013", shift: "Day (8AM–5PM)",        joinedAt: "2016-09-01" },
    // Laboratory
    { email: "dr.castillo.lab@hanapcare.ph",   firstName: "Teresita", lastName: "Castillo",   role: "Doctor",  dept: "Laboratory",             employeeId: "HC-DOC-014", shift: "Day (8AM–5PM)",        joinedAt: "2019-03-20" },
    { email: "nurse.ramos@hanapcare.ph",       firstName: "Benito",   lastName: "Ramos",      role: "Nurse",   dept: "Laboratory",             employeeId: "HC-NRS-017", shift: "Morning (6AM–2PM)",    joinedAt: "2022-11-01" },
    // Neurology
    { email: "nurse.mercado@hanapcare.ph",     firstName: "Corazon",  lastName: "Mercado",    role: "Nurse",   dept: "Neurology",              employeeId: "HC-NRS-018", shift: "Day (8AM–5PM)",        joinedAt: "2021-06-15" },
    { email: "nurse.areyes@hanapcare.ph",      firstName: "Angelo",   lastName: "Reyes",      role: "Nurse",   dept: "Neurology",              employeeId: "HC-NRS-019", shift: "Evening (2PM–10PM)",   joinedAt: "2023-03-01" },
    { email: "dr.mendez@hanapcare.ph",         firstName: "Dolores",  lastName: "Mendez",     role: "Doctor",  dept: "Neurology",              employeeId: "HC-DOC-015", shift: "Day (8AM–5PM)",        joinedAt: "2015-07-10" },
    // Obstetrics & Gynecology
    { email: "nurse.torres.obgyn@hanapcare.ph",firstName: "Amelita",  lastName: "Torres",     role: "Nurse",   dept: "Obstetrics & Gynecology",employeeId: "HC-NRS-020", shift: "Day (8AM–5PM)",        joinedAt: "2020-05-01" },
    { email: "nurse.gsantos@hanapcare.ph",     firstName: "Gilda",    lastName: "Santos",     role: "Nurse",   dept: "Obstetrics & Gynecology",employeeId: "HC-NRS-021", shift: "Night (10PM–6AM)",     joinedAt: "2021-10-20" },
    { email: "dr.villafuerte@hanapcare.ph",    firstName: "Rowena",   lastName: "Villafuerte",role: "Doctor",  dept: "Obstetrics & Gynecology",employeeId: "HC-DOC-016", shift: "Mon-Fri 9AM-5PM",      joinedAt: "2017-02-28" },
    // Orthopedics
    { email: "nurse.hdelacruz@hanapcare.ph",   firstName: "Herminio", lastName: "Dela Cruz",  role: "Nurse",   dept: "Orthopedics",            employeeId: "HC-NRS-022", shift: "Day (8AM–5PM)",        joinedAt: "2022-08-01" },
    { email: "nurse.magno@hanapcare.ph",       firstName: "Erlinda",  lastName: "Magno",      role: "Nurse",   dept: "Orthopedics",            employeeId: "HC-NRS-023", shift: "Evening (2PM–10PM)",   joinedAt: "2023-05-15" },
    { email: "dr.dizon@hanapcare.ph",          firstName: "Raul",     lastName: "Dizon",      role: "Doctor",  dept: "Orthopedics",            employeeId: "HC-DOC-017", shift: "Mon-Wed-Fri 8AM-4PM",  joinedAt: "2018-04-01" },
    // Pediatrics
    { email: "nurse.aguilar@hanapcare.ph",     firstName: "Marilou",  lastName: "Aguilar",    role: "Nurse",   dept: "Pediatrics",             employeeId: "HC-NRS-024", shift: "Day (8AM–5PM)",        joinedAt: "2021-01-10" },
    { email: "nurse.bacani@hanapcare.ph",      firstName: "Renato",   lastName: "Bacani",     role: "Nurse",   dept: "Pediatrics",             employeeId: "HC-NRS-025", shift: "Morning (6AM–2PM)",    joinedAt: "2022-06-01" },
    { email: "dr.pascua@hanapcare.ph",         firstName: "Gloria",   lastName: "Pascua",     role: "Doctor",  dept: "Pediatrics",             employeeId: "HC-DOC-018", shift: "Day (8AM–5PM)",        joinedAt: "2016-12-01" },
    // Pharmacy
    { email: "dr.velasco@hanapcare.ph",        firstName: "Antonio",  lastName: "Velasco",    role: "Doctor",  dept: "Pharmacy",               employeeId: "HC-DOC-019", shift: "Day (8AM–5PM)",        joinedAt: "2020-03-01" },
    { email: "nurse.padilla@hanapcare.ph",     firstName: "Nora",     lastName: "Padilla",    role: "Nurse",   dept: "Pharmacy",               employeeId: "HC-NRS-026", shift: "Day (8AM–5PM)",        joinedAt: "2021-09-15" },
    // Radiology
    { email: "dr.buenaventura@hanapcare.ph",   firstName: "Celso",    lastName: "Buenaventura",role: "Doctor", dept: "Radiology",              employeeId: "HC-DOC-020", shift: "Day (8AM–5PM)",        joinedAt: "2019-08-01" },
    { email: "nurse.manalo@hanapcare.ph",      firstName: "Ligaya",   lastName: "Manalo",     role: "Nurse",   dept: "Radiology",              employeeId: "HC-NRS-027", shift: "Day (8AM–5PM)",        joinedAt: "2022-02-20" },
    { email: "nurse.resurreccion@hanapcare.ph",firstName: "Artemio",  lastName: "Resurreccion",role: "Nurse",  dept: "Radiology",              employeeId: "HC-NRS-028", shift: "Evening (2PM–10PM)",   joinedAt: "2023-07-01" },
    // Surgery
    { email: "nurse.lacson@hanapcare.ph",      firstName: "Lourdes",  lastName: "Lacson",     role: "Nurse",   dept: "Surgery",                employeeId: "HC-NRS-029", shift: "Day (8AM–5PM)",        joinedAt: "2020-11-01" },
    { email: "nurse.evangelista@hanapcare.ph", firstName: "Alfredo",  lastName: "Evangelista",role: "Nurse",   dept: "Surgery",                employeeId: "HC-NRS-030", shift: "Night (10PM–6AM)",     joinedAt: "2021-12-15" },
    { email: "dr.coronel@hanapcare.ph",        firstName: "Milagros", lastName: "Coronel",    role: "Doctor",  dept: "Surgery",                employeeId: "HC-DOC-021", shift: "Tue-Sat 7AM-3PM",      joinedAt: "2017-09-01" },
  ];

  for (const s of staffSeeds) {
    const dept = s.dept ? deptByName[s.dept] : null;
    await db.insert(staffTable).values({
      firstName: s.firstName,
      lastName: s.lastName,
      role: s.role,
      email: s.email,
      contactNumber: null,
      departmentId: dept?.id ?? null,
      employeeId: s.employeeId,
      shift: s.shift,
      isActive: true,
      joinedAt: s.joinedAt,
    }).onConflictDoNothing();
  }
  const allStaff = await db.select().from(staffTable);
  const staffByEmail = Object.fromEntries(allStaff.map((s) => [s.email, s]));
  console.log(`  ✓ ${allStaff.length} staff records`);

  // ── Doctors ────────────────────────────────────────────────────────────────
  console.log("  → Seeding doctors…");
  const doctorSeeds = [
    // Original doctors
    { firstName: "Jose",      lastName: "Rizal",        license: "PRC-MED-2018-001", spec: "Internal Medicine",       dept: "Internal Medicine",       contact: "09171234501", email: "doctor@hanapcare.ph",          availability: "Mon-Fri 8AM-5PM" },
    { firstName: "Pedro",     lastName: "Santos",       license: "PRC-MED-2015-042", spec: "Cardiology",              dept: "Cardiology",               contact: "09171234502", email: "psantos@hanapcare.ph",         availability: "Mon-Thu 9AM-4PM" },
    { firstName: "Maria",     lastName: "Reyes",        license: "PRC-MED-2019-088", spec: "Pediatrics",              dept: "Pediatrics",               contact: "09171234503", email: "mreyes@hanapcare.ph",          availability: "Mon-Fri 8AM-5PM" },
    { firstName: "Carlos",    lastName: "Cruz",         license: "PRC-MED-2012-011", spec: "General Surgery",         dept: "Surgery",                  contact: "09171234504", email: "ccruz@hanapcare.ph",           availability: "Tue-Sat 7AM-3PM" },
    { firstName: "Ana",       lastName: "Lopez",        license: "PRC-MED-2020-055", spec: "OB-GYN",                  dept: "Obstetrics & Gynecology",  contact: "09171234505", email: "alopez@hanapcare.ph",          availability: "Mon-Fri 9AM-5PM" },
    { firstName: "Roberto",   lastName: "Lim",          license: "PRC-MED-2016-033", spec: "Orthopedics",             dept: "Orthopedics",              contact: "09171234506", email: "rlim@hanapcare.ph",            availability: "Mon-Wed-Fri 8AM-4PM" },
    { firstName: "Grace",     lastName: "Tan",          license: "PRC-MED-2017-076", spec: "Radiology",               dept: "Radiology",                contact: "09171234507", email: "gtan@hanapcare.ph",            availability: "Mon-Fri 8AM-5PM" },
    { firstName: "Miguel",    lastName: "Garcia",       license: "PRC-MED-2014-099", spec: "Emergency Medicine",      dept: "Emergency",                contact: "09171234508", email: "mgarcia@hanapcare.ph",         availability: "24/7 On-call" },
    // Department doctors
    { firstName: "Rosario",   lastName: "Aquino",       license: "PRC-MED-2016-201", spec: "Cardiology",              dept: "Cardiology",               contact: "09171110003", email: "dr.aquino.cardio@hanapcare.ph",availability: "Mon-Fri 8AM-5PM" },
    { firstName: "Carmen",    lastName: "Ocampo",       license: "PRC-MED-2014-202", spec: "Dermatology",             dept: "Dermatology",              contact: "09171110006", email: "dr.ocampo@hanapcare.ph",       availability: "Mon-Fri 8AM-5PM" },
    { firstName: "Jose",      lastName: "Salazar",      license: "PRC-MED-2013-203", spec: "Emergency Medicine",      dept: "Emergency",                contact: "09171110007", email: "dr.salazar@hanapcare.ph",      availability: "24/7 On-call" },
    { firstName: "Eduardo",   lastName: "Soriano",      license: "PRC-MED-2012-204", spec: "Internal Medicine",       dept: "Internal Medicine",        contact: "09171110011", email: "dr.soriano@hanapcare.ph",      availability: "Mon-Fri 8AM-5PM" },
    { firstName: "Teresita",  lastName: "Castillo",     license: "PRC-MED-2015-205", spec: "Pathology",               dept: "Laboratory",               contact: "09171110012", email: "dr.castillo.lab@hanapcare.ph", availability: "Mon-Fri 8AM-5PM" },
    { firstName: "Dolores",   lastName: "Mendez",       license: "PRC-MED-2011-206", spec: "Neurology",               dept: "Neurology",                contact: "09171110016", email: "dr.mendez@hanapcare.ph",       availability: "Mon-Fri 8AM-5PM" },
    { firstName: "Rowena",    lastName: "Villafuerte",  license: "PRC-MED-2013-207", spec: "Obstetrics & Gynecology", dept: "Obstetrics & Gynecology",  contact: "09171110019", email: "dr.villafuerte@hanapcare.ph",  availability: "Mon-Fri 9AM-5PM" },
    { firstName: "Raul",      lastName: "Dizon",        license: "PRC-MED-2014-208", spec: "Orthopedic Surgery",      dept: "Orthopedics",              contact: "09171110022", email: "dr.dizon@hanapcare.ph",        availability: "Mon-Wed-Fri 8AM-4PM" },
    { firstName: "Gloria",    lastName: "Pascua",       license: "PRC-MED-2012-209", spec: "Pediatrics",              dept: "Pediatrics",               contact: "09171110025", email: "dr.pascua@hanapcare.ph",       availability: "Mon-Fri 8AM-5PM" },
    { firstName: "Celso",     lastName: "Buenaventura", license: "PRC-MED-2015-210", spec: "Radiology",               dept: "Radiology",                contact: "09171110028", email: "dr.buenaventura@hanapcare.ph", availability: "Mon-Fri 8AM-5PM" },
    { firstName: "Milagros",  lastName: "Coronel",      license: "PRC-MED-2013-211", spec: "General Surgery",         dept: "Surgery",                  contact: "09171110033", email: "dr.coronel@hanapcare.ph",      availability: "Tue-Sat 7AM-3PM" },
  ];
  for (const d of doctorSeeds) {
    const dept = deptByName[d.dept];
    await db.insert(doctorsTable).values({
      firstName: d.firstName,
      lastName: d.lastName,
      licenseNumber: d.license,
      specialization: d.spec,
      departmentId: dept?.id ?? null,
      contactNumber: d.contact,
      email: d.email,
      availability: d.availability,
      isActive: true,
    }).onConflictDoNothing();
  }
  const allDoctors = await db.select().from(doctorsTable);
  console.log(`  ✓ ${allDoctors.length} doctors`);

  // ── Patients ───────────────────────────────────────────────────────────────
  console.log("  → Seeding patients…");
  const patientSeeds = [
    { code: "HC-PAT-0001", firstName: "Lita",      lastName: "Reyes",      dob: "1985-04-12", gender: "Female", blood: "B+",  contact: "09281100001", address: "123 Rizal St, Makati City", conditions: "Hypertension, Type 2 Diabetes", philhealth: "01-123456789-1" },
    { code: "HC-PAT-0002", firstName: "Ramon",     lastName: "Santos",     dob: "1972-09-25", gender: "Male",   blood: "O+",  contact: "09281100002", address: "456 Bonifacio Ave, Quezon City", conditions: "Asthma", philhealth: "01-234567890-2" },
    { code: "HC-PAT-0003", firstName: "Evelyn",    lastName: "Cruz",       dob: "1990-01-30", gender: "Female", blood: "A+",  contact: "09281100003", address: "789 Mabini Blvd, Manila", conditions: null, philhealth: "01-345678901-3" },
    { code: "HC-PAT-0004", firstName: "Benjamin",  lastName: "Garcia",     dob: "1968-07-14", gender: "Male",   blood: "AB+", contact: "09281100004", address: "321 Del Pilar St, Pasig City", conditions: "Coronary Artery Disease", philhealth: "01-456789012-4" },
    { code: "HC-PAT-0005", firstName: "Marilou",   lastName: "Torres",     dob: "1995-11-03", gender: "Female", blood: "O-",  contact: "09281100005", address: "654 Luna St, Taguig City", conditions: "PCOS", philhealth: "01-567890123-5" },
    { code: "HC-PAT-0006", firstName: "Rolando",   lastName: "Villanueva", dob: "1955-06-22", gender: "Male",   blood: "B-",  contact: "09281100006", address: "987 Aguinaldo St, Caloocan", conditions: "COPD, Hypertension", philhealth: "01-678901234-6" },
    { code: "HC-PAT-0007", firstName: "Corazon",   lastName: "Flores",     dob: "2010-02-14", gender: "Female", blood: "A-",  contact: "09281100007", address: "147 Magsaysay Dr, Pasay City", conditions: null, philhealth: "01-789012345-7" },
    { code: "HC-PAT-0008", firstName: "Eduardo",   lastName: "Mendoza",    dob: "1980-08-19", gender: "Male",   blood: "O+",  contact: "09281100008", address: "258 Quezon Blvd, Manila", conditions: "Type 2 Diabetes", philhealth: "01-890123456-8" },
    { code: "HC-PAT-0009", firstName: "Teresita",  lastName: "Ramos",      dob: "1963-12-07", gender: "Female", blood: "A+",  contact: "09281100009", address: "369 Escolta St, Manila", conditions: "Rheumatoid Arthritis", philhealth: "01-901234567-9" },
    { code: "HC-PAT-0010", firstName: "Ernesto",   lastName: "Dela Cruz",  dob: "1998-03-28", gender: "Male",   blood: "B+",  contact: "09281100010", address: "741 Taft Ave, Manila", conditions: "Allergic Rhinitis", philhealth: "01-012345678-0" },
    { code: "HC-PAT-0011", firstName: "Rosario",   lastName: "Navarro",    dob: "1975-05-16", gender: "Female", blood: "AB-", contact: "09281100011", address: "852 Shaw Blvd, Mandaluyong", conditions: "Hypothyroidism", philhealth: "01-112345678-1" },
    { code: "HC-PAT-0012", firstName: "Alfredo",   lastName: "Castillo",   dob: "1945-10-01", gender: "Male",   blood: "O+",  contact: "09281100012", address: "963 España Blvd, Sampaloc, Manila", conditions: "Benign Prostatic Hyperplasia, Hypertension", philhealth: "01-212345678-2" },
  ];
  for (const p of patientSeeds) {
    await db.insert(patientsTable).values({
      patientCode: p.code,
      firstName: p.firstName,
      lastName: p.lastName,
      dateOfBirth: p.dob,
      gender: p.gender,
      bloodType: p.blood,
      contactNumber: p.contact,
      address: p.address,
      existingConditions: p.conditions,
      philhealthNumber: p.philhealth,
    }).onConflictDoNothing();
  }
  const allPatients = await db.select().from(patientsTable);
  console.log(`  ✓ ${allPatients.length} patients`);

  // ── Wards ──────────────────────────────────────────────────────────────────
  console.log("  → Seeding wards…");
  const wardSeeds = [
    { name: "General Medicine Ward", wardType: "General",   floor: "Floor 2", totalBeds: 20, description: "General adult medical cases" },
    { name: "Intensive Care Unit",   wardType: "ICU",       floor: "Floor 3", totalBeds: 8,  description: "Critical care for severely ill patients" },
    { name: "Pediatric Ward",        wardType: "Pediatric", floor: "Floor 2", totalBeds: 12, description: "Child patients under 18" },
    { name: "Maternity Ward",        wardType: "Maternity", floor: "Floor 3", totalBeds: 10, description: "Pre and post-natal care" },
    { name: "Surgical Ward",         wardType: "Surgical",  floor: "Floor 4", totalBeds: 15, description: "Post-operative recovery" },
    { name: "Orthopedic Ward",       wardType: "General",   floor: "Floor 4", totalBeds: 10, description: "Bone and joint care" },
  ];
  for (const w of wardSeeds) {
    await db.insert(wardsTable).values(w).onConflictDoNothing();
  }
  const allWards = await db.select().from(wardsTable);
  const wardByName = Object.fromEntries(allWards.map((w) => [w.name, w]));
  console.log(`  ✓ ${allWards.length} wards`);

  // ── Beds ───────────────────────────────────────────────────────────────────
  console.log("  → Seeding beds…");
  const bedSeeds: Array<{ ward: string; number: string; status: string }> = [];
  const generalWard = wardByName["General Medicine Ward"];
  const icuWard = wardByName["Intensive Care Unit"];
  const pedWard = wardByName["Pediatric Ward"];
  const matWard = wardByName["Maternity Ward"];
  const surgWard = wardByName["Surgical Ward"];
  if (generalWard) {
    ["A-101","A-102","A-103","A-104","A-105"].forEach((n, i) =>
      bedSeeds.push({ ward: "General Medicine Ward", number: n, status: i < 3 ? "Occupied" : "Available" })
    );
  }
  if (icuWard) {
    ["ICU-01","ICU-02","ICU-03","ICU-04"].forEach((n, i) =>
      bedSeeds.push({ ward: "Intensive Care Unit", number: n, status: i < 2 ? "Occupied" : "Available" })
    );
  }
  if (pedWard) {
    ["P-201","P-202","P-203"].forEach((n, i) =>
      bedSeeds.push({ ward: "Pediatric Ward", number: n, status: i === 0 ? "Occupied" : "Available" })
    );
  }
  if (matWard) {
    ["M-301","M-302","M-303"].forEach((n, i) =>
      bedSeeds.push({ ward: "Maternity Ward", number: n, status: i < 2 ? "Occupied" : "Available" })
    );
  }
  if (surgWard) {
    ["S-401","S-402","S-403"].forEach((n, i) =>
      bedSeeds.push({ ward: "Surgical Ward", number: n, status: i === 0 ? "Occupied" : "Available" })
    );
  }
  for (const b of bedSeeds) {
    const ward = wardByName[b.ward];
    if (!ward) continue;
    await db.insert(bedsTable).values({ wardId: ward.id, bedNumber: b.number, status: b.status }).onConflictDoNothing();
  }
  console.log(`  ✓ ${bedSeeds.length} beds`);

  // ── Medicines ──────────────────────────────────────────────────────────────
  console.log("  → Seeding medicines…");
  const medicineSeeds = [
    { drug: "Paracetamol 500mg",           generic: "Paracetamol",         qty: 500, unit: "tablets",  batch: "PC-2024-001", exp: "2026-12-31", supplier: "Unilab",      reorder: 50,  price: "5.00",   category: "Analgesic/Antipyretic" },
    { drug: "Amoxicillin 500mg",           generic: "Amoxicillin",         qty: 200, unit: "capsules", batch: "AM-2024-002", exp: "2026-06-30", supplier: "GlaxoSmithKline", reorder: 30, price: "12.00",  category: "Antibiotic" },
    { drug: "Metformin 500mg",             generic: "Metformin HCl",       qty: 300, unit: "tablets",  batch: "MF-2024-003", exp: "2027-03-31", supplier: "Novartis",    reorder: 40,  price: "8.50",   category: "Antidiabetic" },
    { drug: "Amlodipine 5mg",              generic: "Amlodipine Besylate", qty: 150, unit: "tablets",  batch: "AM-2024-004", exp: "2026-09-30", supplier: "Pfizer",      reorder: 20,  price: "15.00",  category: "Antihypertensive" },
    { drug: "Atorvastatin 20mg",           generic: "Atorvastatin",        qty: 180, unit: "tablets",  batch: "AT-2024-005", exp: "2026-11-30", supplier: "Pfizer",      reorder: 25,  price: "22.00",  category: "Statin" },
    { drug: "Omeprazole 20mg",             generic: "Omeprazole",          qty: 250, unit: "capsules", batch: "OM-2024-006", exp: "2026-08-31", supplier: "Unilab",      reorder: 30,  price: "10.00",  category: "Proton Pump Inhibitor" },
    { drug: "Losartan 50mg",               generic: "Losartan Potassium",  qty: 120, unit: "tablets",  batch: "LS-2024-007", exp: "2027-01-31", supplier: "Merck",       reorder: 20,  price: "18.00",  category: "Antihypertensive" },
    { drug: "Salbutamol 100mcg Inhaler",   generic: "Salbutamol",          qty: 40,  unit: "inhalers", batch: "SB-2024-008", exp: "2025-12-31", supplier: "GlaxoSmithKline", reorder: 10, price: "185.00", category: "Bronchodilator" },
    { drug: "Ibuprofen 400mg",             generic: "Ibuprofen",           qty: 350, unit: "tablets",  batch: "IB-2024-009", exp: "2026-10-31", supplier: "Unilab",      reorder: 50,  price: "7.00",   category: "NSAID" },
    { drug: "Ciprofloxacin 500mg",         generic: "Ciprofloxacin HCl",   qty: 100, unit: "tablets",  batch: "CI-2024-010", exp: "2026-07-31", supplier: "Bayer",       reorder: 20,  price: "25.00",  category: "Antibiotic" },
    { drug: "Insulin Glargine 100U/mL",    generic: "Insulin Glargine",    qty: 30,  unit: "vials",    batch: "IG-2024-011", exp: "2025-09-30", supplier: "Sanofi",      reorder: 10,  price: "850.00", category: "Insulin" },
    { drug: "Furosemide 40mg",             generic: "Furosemide",          qty: 200, unit: "tablets",  batch: "FS-2024-012", exp: "2027-02-28", supplier: "Aventis",     reorder: 30,  price: "6.00",   category: "Diuretic" },
    { drug: "Azithromycin 500mg",          generic: "Azithromycin",        qty: 80,  unit: "tablets",  batch: "AZ-2024-013", exp: "2026-05-31", supplier: "Pfizer",      reorder: 15,  price: "55.00",  category: "Antibiotic" },
    { drug: "Cetirizine 10mg",             generic: "Cetirizine HCl",      qty: 300, unit: "tablets",  batch: "CT-2024-014", exp: "2027-04-30", supplier: "Unilab",      reorder: 40,  price: "9.00",   category: "Antihistamine" },
    { drug: "Tramadol 50mg",               generic: "Tramadol HCl",        qty: 60,  unit: "capsules", batch: "TR-2024-015", exp: "2026-03-31", supplier: "Grunenthal",  reorder: 10,  price: "35.00",  category: "Analgesic (Opioid)" },
    { drug: "Normal Saline 0.9% 500mL",   generic: "Sodium Chloride",     qty: 100, unit: "bags",     batch: "NS-2024-016", exp: "2026-12-31", supplier: "Fresenius",   reorder: 20,  price: "65.00",  category: "IV Fluid" },
    { drug: "Dextrose 5% 500mL",           generic: "Dextrose",            qty: 80,  unit: "bags",     batch: "D5-2024-017", exp: "2026-11-30", supplier: "Fresenius",   reorder: 20,  price: "70.00",  category: "IV Fluid" },
  ];
  for (const m of medicineSeeds) {
    await db.insert(medicinesTable).values({
      drugName: m.drug, genericName: m.generic, quantity: m.qty, unit: m.unit,
      batchNumber: m.batch, expirationDate: m.exp, supplier: m.supplier,
      reorderLevel: m.reorder, unitPrice: m.price, category: m.category, isActive: true,
    }).onConflictDoNothing();
  }
  console.log(`  ✓ ${medicineSeeds.length} medicines`);

  // ── Appointments ───────────────────────────────────────────────────────────
  console.log("  → Seeding appointments…");
  const pat = allPatients.slice(0, 8);
  const doc = allDoctors.slice(0, 6);
  if (pat.length >= 5 && doc.length >= 3) {
    const apptSeeds = [
      { patIdx: 0, docIdx: 0, date: "2026-06-17", time: "09:00 AM", status: "Confirmed", reason: "Follow-up for hypertension medication" },
      { patIdx: 1, docIdx: 1, date: "2026-06-17", time: "10:00 AM", status: "Confirmed", reason: "Cardiac check-up, palpitations" },
      { patIdx: 2, docIdx: 0, date: "2026-06-17", time: "11:00 AM", status: "Pending",   reason: "Annual physical examination" },
      { patIdx: 3, docIdx: 1, date: "2026-06-18", time: "09:00 AM", status: "Confirmed", reason: "Chest pain evaluation" },
      { patIdx: 4, docIdx: 4, date: "2026-06-18", time: "10:30 AM", status: "Pending",   reason: "OB-GYN consultation" },
      { patIdx: 5, docIdx: 2, date: "2026-06-16", time: "02:00 PM", status: "Completed", reason: "Child wellness check" },
      { patIdx: 6, docIdx: 2, date: "2026-06-16", time: "03:00 PM", status: "Completed", reason: "Fever and cough" },
      { patIdx: 7, docIdx: 0, date: "2026-06-19", time: "08:30 AM", status: "Pending",   reason: "Diabetes management review" },
      { patIdx: 0, docIdx: 3, date: "2026-06-20", time: "07:30 AM", status: "Confirmed", reason: "Pre-surgical assessment" },
      { patIdx: 8, docIdx: 0, date: "2026-06-20", time: "09:00 AM", status: "Pending",   reason: "Arthritis pain management" },
    ];
    for (let i = 0; i < apptSeeds.length; i++) {
      const a = apptSeeds[i];
      const patient = pat[a.patIdx];
      const doctor = doc[a.docIdx];
      if (!patient || !doctor) continue;
      await db.insert(appointmentsTable).values({
        patientId: patient.id,
        doctorId: doctor.id,
        appointmentDate: a.date,
        timeSlot: a.time,
        status: a.status,
        queueNumber: i + 1,
        reason: a.reason,
      }).onConflictDoNothing();
    }
    console.log("  ✓ Appointments seeded");
  } else {
    console.log("  ⚠ Skipping appointments (not enough patients/doctors)");
  }

  // ── Leave Requests ─────────────────────────────────────────────────────────
  console.log("  → Seeding leave requests…");
  const leaveSeeds = [
    { email: "doctor@hanapcare.ph",       type: "Sick Leave",            from: "2026-06-18", to: "2026-06-19", days: 2,  reason: "Medical appointment and rest",          status: "Pending" },
    { email: "nurse@hanapcare.ph",        type: "Annual Leave",           from: "2026-07-01", to: "2026-07-05", days: 5,  reason: "Family vacation in Baguio",             status: "Approved" },
    { email: "receptionist@hanapcare.ph", type: "Emergency Leave",        from: "2026-06-16", to: "2026-06-16", days: 1,  reason: "Family emergency",                      status: "Approved" },
    { email: "pharmacist@hanapcare.ph",   type: "Annual Leave",           from: "2026-06-20", to: "2026-06-25", days: 6,  reason: "Planned vacation in Cebu",              status: "Pending" },
    { email: "lab@hanapcare.ph",          type: "Maternity/Paternity",    from: "2026-07-10", to: "2026-08-10", days: 30, reason: "Parental leave for newborn",            status: "Pending" },
    { email: "cashier@hanapcare.ph",      type: "Sick Leave",             from: "2026-06-10", to: "2026-06-11", days: 2,  reason: "Flu recovery",                          status: "Denied" },
    { email: "support@hanapcare.ph",      type: "Annual Leave",           from: "2026-07-15", to: "2026-07-18", days: 4,  reason: "Personal travel",                       status: "Approved" },
    { email: "doctor@hanapcare.ph",       type: "Continuing Medical Education", from: "2026-08-05", to: "2026-08-07", days: 3, reason: "CME seminar in Manila",           status: "Pending" },
  ];
  const hrUser = userByEmail["hr@hanapcare.ph"];
  for (const lr of leaveSeeds) {
    const staff = staffByEmail[lr.email];
    if (!staff) continue;
    await db.insert(leaveRequestsTable).values({
      staffId: staff.id,
      leaveType: lr.type,
      fromDate: lr.from,
      toDate: lr.to,
      days: lr.days,
      reason: lr.reason,
      status: lr.status,
      reviewedBy: lr.status !== "Pending" && hrUser ? hrUser.id : null,
      reviewedAt: lr.status !== "Pending" ? new Date() : null,
    } as any).onConflictDoNothing();
  }
  console.log("  ✓ Leave requests seeded");

  console.log("\n✅ Seed complete!");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
