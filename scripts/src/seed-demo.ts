import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  usersTable,
  departmentsTable,
  doctorsTable,
  patientsTable,
  appointmentsTable,
  consultationsTable,
  vitalSignsTable,
  medicinesTable,
  prescriptionsTable,
  dispensingRecordsTable,
  labRequestsTable,
  billingsTable,
  paymentsTable,
  wardsTable,
  bedsTable,
  staffTable,
} from "../../lib/db/src/schema/index.js";

const { Pool } = pg;

const connectionString = process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("NEON_DATABASE_URL or DATABASE_URL must be set");

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("neon.tech") ? { rejectUnauthorized: false } : undefined,
});
const db = drizzle(pool);

const SALT_ROUNDS = 10;
const PASSWORD = "Neowise_24";

async function seed() {
  const target = connectionString!.includes("neon.tech") ? "Neon" : "Local PostgreSQL";
  console.log(`🌱 Seeding demo data to ${target}…\n`);

  // ─── USERS ──────────────────────────────────────────────────────────────────
  console.log("  → Users…");
  const hash = await bcrypt.hash(PASSWORD, SALT_ROUNDS);

  const allUsers = [
    { email: "admin@hanapcare.ph", fullName: "System Administrator", role: "Admin" },
    { email: "doctor@hanapcare.ph", fullName: "Dr. Jose Rizal", role: "Doctor" },
    { email: "nurse@hanapcare.ph", fullName: "Nurse Maria Santos", role: "Nurse" },
    { email: "receptionist@hanapcare.ph", fullName: "Ana Reyes", role: "Receptionist" },
    { email: "pharmacist@hanapcare.ph", fullName: "Juan dela Cruz", role: "Pharmacist" },
    { email: "lab@hanapcare.ph", fullName: "Grace Mendoza", role: "Lab Staff" },
    { email: "cashier@hanapcare.ph", fullName: "Leo Tan", role: "Cashier" },
    { email: "support@hanapcare.ph", fullName: "Support Agent", role: "Support" },
    { email: "cbolante24@gmail.com", fullName: "Chaelvin Bolante", role: "Support" },
    { email: "dr.santos@hanapcare.ph", fullName: "Dr. Ricardo Santos", role: "Doctor" },
    { email: "dr.reyes@hanapcare.ph", fullName: "Dr. Lucia Reyes", role: "Doctor" },
    { email: "nurse.dela@hanapcare.ph", fullName: "Nurse Carmen Dela Cruz", role: "Nurse" },
    { email: "nurse.garcia@hanapcare.ph", fullName: "Nurse Roberto Garcia", role: "Nurse" },
    { email: "recept.flores@hanapcare.ph", fullName: "Rosa Flores", role: "Receptionist" },
    { email: "pharma.lim@hanapcare.ph", fullName: "Kevin Lim", role: "Pharmacist" },
    { email: "lab.mendoza@hanapcare.ph", fullName: "Alex Mendoza", role: "Lab Staff" },
    { email: "cashier.tan@hanapcare.ph", fullName: "Sofia Tan", role: "Cashier" },
    { email: "support2@hanapcare.ph", fullName: "Sofia Cruz", role: "Support" },
    // Patient users
    { email: "patient1@gmail.com", fullName: "Maria Clara Reyes", role: "Patient" },
    { email: "patient2@gmail.com", fullName: "Jose Antonio Bautista", role: "Patient" },
    { email: "patient3@gmail.com", fullName: "Elena Macaraeg", role: "Patient" },
  ];

  for (const u of allUsers) {
    await db.insert(usersTable).values({
      email: u.email,
      passwordHash: hash,
      fullName: u.fullName,
      role: u.role,
      isActive: true,
      profileComplete: true,
      phone: "09" + Math.floor(100000000 + Math.random() * 900000000),
      gender: ["Male", "Female"][Math.floor(Math.random() * 2)],
    }).onConflictDoNothing();
  }
  console.log(`     ✓ ${allUsers.length} users`);

  // ─── DEPARTMENTS ─────────────────────────────────────────────────────────────
  console.log("  → Departments…");
  const deptData = [
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
    { name: "Dermatology", description: "Skin, hair, and nail care" },
    { name: "Neurology", description: "Nervous system disorders" },
  ];
  for (const d of deptData) {
    await db.insert(departmentsTable).values(d).onConflictDoNothing();
  }
  const departments = await db.select().from(departmentsTable);
  const deptMap = Object.fromEntries(departments.map((d) => [d.name, d.id]));
  console.log(`     ✓ ${departments.length} departments`);

  // ─── DOCTORS ─────────────────────────────────────────────────────────────────
  console.log("  → Doctors…");
  const doctorData = [
    { firstName: "Jose", lastName: "Rizal", licenseNumber: "PRC-MD-001234", specialization: "Internal Medicine", departmentId: deptMap["Internal Medicine"], email: "doctor@hanapcare.ph", contactNumber: "09171234567", availability: "Mon-Fri 8AM-5PM" },
    { firstName: "Ricardo", lastName: "Santos", licenseNumber: "PRC-MD-002345", specialization: "Cardiology", departmentId: deptMap["Cardiology"], email: "dr.santos@hanapcare.ph", contactNumber: "09181234567", availability: "Mon-Thu 9AM-4PM" },
    { firstName: "Lucia", lastName: "Reyes", licenseNumber: "PRC-MD-003456", specialization: "Obstetrics & Gynecology", departmentId: deptMap["Obstetrics & Gynecology"], email: "dr.reyes@hanapcare.ph", contactNumber: "09191234567", availability: "Tue-Sat 8AM-3PM" },
    { firstName: "Manuel", lastName: "Quezon", licenseNumber: "PRC-MD-004567", specialization: "Pediatrics", departmentId: deptMap["Pediatrics"], email: "dr.quezon@hanapcare.ph", contactNumber: "09201234567", availability: "Mon-Wed-Fri 9AM-5PM" },
    { firstName: "Emilio", lastName: "Aguinaldo", licenseNumber: "PRC-MD-005678", specialization: "Surgery", departmentId: deptMap["Surgery"], email: "dr.aguinaldo@hanapcare.ph", contactNumber: "09211234567", availability: "Mon-Fri 7AM-3PM" },
    { firstName: "Apolinario", lastName: "Mabini", licenseNumber: "PRC-MD-006789", specialization: "Neurology", departmentId: deptMap["Neurology"], email: "dr.mabini@hanapcare.ph", contactNumber: "09221234567", availability: "Mon-Fri 10AM-6PM" },
    { firstName: "Melchora", lastName: "Aquino", licenseNumber: "PRC-MD-007890", specialization: "Dermatology", departmentId: deptMap["Dermatology"], email: "dr.aquino@hanapcare.ph", contactNumber: "09231234567", availability: "Wed-Fri 9AM-4PM" },
  ];
  for (const doc of doctorData) {
    await db.insert(doctorsTable).values(doc).onConflictDoNothing();
  }
  const doctors = await db.select().from(doctorsTable);
  console.log(`     ✓ ${doctors.length} doctors`);

  // ─── PATIENTS ─────────────────────────────────────────────────────────────────
  console.log("  → Patients…");
  const patientData = [
    { patientCode: "HC-2024-001", firstName: "Maria Clara", lastName: "Reyes", dateOfBirth: "1990-03-15", gender: "Female", bloodType: "O+", contactNumber: "09171112222", email: "patient1@gmail.com", address: "123 Mabini St, Manila", emergencyContactName: "Pedro Reyes", emergencyContactNumber: "09172223333", philhealthNumber: "PH-12345678", existingConditions: "Hypertension", allergies: "Penicillin" },
    { patientCode: "HC-2024-002", firstName: "Jose Antonio", lastName: "Bautista", dateOfBirth: "1985-07-22", gender: "Male", bloodType: "A+", contactNumber: "09181112222", email: "patient2@gmail.com", address: "456 Rizal Ave, Quezon City", emergencyContactName: "Ana Bautista", emergencyContactNumber: "09182223333", philhealthNumber: "PH-23456789", existingConditions: "Type 2 Diabetes", allergies: "None" },
    { patientCode: "HC-2024-003", firstName: "Elena", lastName: "Macaraeg", dateOfBirth: "1978-11-08", gender: "Female", bloodType: "B+", contactNumber: "09191112222", email: "patient3@gmail.com", address: "789 Bonifacio Dr, Makati", emergencyContactName: "Roberto Macaraeg", emergencyContactNumber: "09192223333", philhealthNumber: "PH-34567890", existingConditions: "Asthma", allergies: "Sulfa drugs" },
    { patientCode: "HC-2024-004", firstName: "Roberto", lastName: "Dela Cruz", dateOfBirth: "1965-04-30", gender: "Male", bloodType: "AB-", contactNumber: "09201112222", email: "rdelacruz@email.com", address: "321 Luna St, Cebu", emergencyContactName: "Conchita Dela Cruz", emergencyContactNumber: "09202223333", philhealthNumber: "PH-45678901", existingConditions: "Coronary Artery Disease", allergies: "Aspirin" },
    { patientCode: "HC-2024-005", firstName: "Conchita", lastName: "Santiago", dateOfBirth: "1992-09-14", gender: "Female", bloodType: "O-", contactNumber: "09211112222", email: "csantiago@email.com", address: "654 Del Pilar St, Davao", emergencyContactName: "Miguel Santiago", emergencyContactNumber: "09212223333", philhealthNumber: "PH-56789012", existingConditions: "None", allergies: "None" },
    { patientCode: "HC-2024-006", firstName: "Miguel", lastName: "Mercado", dateOfBirth: "2001-01-25", gender: "Male", bloodType: "A-", contactNumber: "09221112222", email: "mmercado@email.com", address: "987 Abad Santos, Paranaque", emergencyContactName: "Lourdes Mercado", emergencyContactNumber: "09222223333", philhealthNumber: "PH-67890123", existingConditions: "None", allergies: "Latex" },
    { patientCode: "HC-2024-007", firstName: "Lourdes", lastName: "Villanueva", dateOfBirth: "1955-06-18", gender: "Female", bloodType: "B-", contactNumber: "09231112222", email: "lvillanueva@email.com", address: "147 Taft Ave, Manila", emergencyContactName: "Carlos Villanueva", emergencyContactNumber: "09232223333", philhealthNumber: "PH-78901234", existingConditions: "Osteoarthritis, Hypertension", allergies: "NSAIDS" },
    { patientCode: "HC-2024-008", firstName: "Carlos", lastName: "Fernando", dateOfBirth: "1988-12-03", gender: "Male", bloodType: "O+", contactNumber: "09241112222", email: "cfernando@email.com", address: "258 España Blvd, Manila", emergencyContactName: "Irene Fernando", emergencyContactNumber: "09242223333", philhealthNumber: "PH-89012345", existingConditions: "None", allergies: "None" },
    { patientCode: "HC-2024-009", firstName: "Irene", lastName: "Torres", dateOfBirth: "1999-05-07", gender: "Female", bloodType: "AB+", contactNumber: "09251112222", email: "itorres@email.com", address: "369 Quezon Ave, QC", emergencyContactName: "Ricardo Torres", emergencyContactNumber: "09252223333", philhealthNumber: "PH-90123456", existingConditions: "None", allergies: "None" },
    { patientCode: "HC-2024-010", firstName: "Ricardo", lastName: "Guevara", dateOfBirth: "1970-08-19", gender: "Male", bloodType: "A+", contactNumber: "09261112222", email: "rguevara@email.com", address: "741 Commonwealth Ave, QC", emergencyContactName: "Nilda Guevara", emergencyContactNumber: "09262223333", philhealthNumber: "PH-01234567", existingConditions: "COPD", allergies: "Ibuprofen" },
    { patientCode: "HC-2024-011", firstName: "Nilda", lastName: "Pascual", dateOfBirth: "1983-02-28", gender: "Female", bloodType: "O+", contactNumber: "09271112222", email: "npascual@email.com", address: "852 Mindanao Ave, QC", emergencyContactName: "Ernesto Pascual", emergencyContactNumber: "09272223333", philhealthNumber: "PH-11234567", existingConditions: "Hypothyroidism", allergies: "None" },
    { patientCode: "HC-2024-012", firstName: "Ernesto", lastName: "Abad", dateOfBirth: "1948-10-11", gender: "Male", bloodType: "B+", contactNumber: "09281112222", email: "eabad@email.com", address: "963 University Ave, Manila", emergencyContactName: "Remedios Abad", emergencyContactNumber: "09282223333", philhealthNumber: "PH-12234567", existingConditions: "Type 2 Diabetes, Hypertension, CKD Stage 3", allergies: "Metformin (GI side effects)" },
  ];
  for (const p of patientData) {
    await db.insert(patientsTable).values(p).onConflictDoNothing();
  }
  const patients = await db.select().from(patientsTable);
  console.log(`     ✓ ${patients.length} patients`);

  // ─── APPOINTMENTS ────────────────────────────────────────────────────────────
  console.log("  → Appointments…");
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const add = (d: Date, days: number) => { const r = new Date(d); r.setDate(r.getDate() + days); return r; };

  const appointmentData = [
    { patientId: patients[0].id, doctorId: doctors[0].id, appointmentDate: fmt(add(today, 1)), timeSlot: "09:00", status: "Confirmed", reason: "Follow-up for hypertension", queueNumber: 1 },
    { patientId: patients[1].id, doctorId: doctors[0].id, appointmentDate: fmt(add(today, 1)), timeSlot: "10:00", status: "Confirmed", reason: "Diabetes management consultation", queueNumber: 2 },
    { patientId: patients[2].id, doctorId: doctors[2].id, appointmentDate: fmt(add(today, 1)), timeSlot: "09:30", status: "Pending", reason: "OB-GYN annual check-up", queueNumber: 1 },
    { patientId: patients[3].id, doctorId: doctors[1].id, appointmentDate: fmt(today), timeSlot: "08:00", status: "In Progress", reason: "Cardiology follow-up, check ECG results", queueNumber: 1 },
    { patientId: patients[4].id, doctorId: doctors[3].id, appointmentDate: fmt(today), timeSlot: "10:30", status: "Confirmed", reason: "General check-up", queueNumber: 2 },
    { patientId: patients[5].id, doctorId: doctors[0].id, appointmentDate: fmt(today), timeSlot: "11:00", status: "Pending", reason: "Initial consultation, knee pain", queueNumber: 3 },
    { patientId: patients[6].id, doctorId: doctors[5].id, appointmentDate: fmt(add(today, 2)), timeSlot: "14:00", status: "Confirmed", reason: "Neurology review, persistent headaches", queueNumber: 1 },
    { patientId: patients[7].id, doctorId: doctors[4].id, appointmentDate: fmt(add(today, 2)), timeSlot: "08:00", status: "Confirmed", reason: "Pre-surgical evaluation", queueNumber: 1 },
    { patientId: patients[8].id, doctorId: doctors[6].id, appointmentDate: fmt(add(today, 3)), timeSlot: "11:00", status: "Pending", reason: "Skin rash evaluation", queueNumber: 1 },
    { patientId: patients[9].id, doctorId: doctors[0].id, appointmentDate: fmt(add(today, -1)), timeSlot: "09:00", status: "Completed", reason: "COPD follow-up", queueNumber: 1, notes: "Spirometry done. Continue current medications." },
    { patientId: patients[10].id, doctorId: doctors[0].id, appointmentDate: fmt(add(today, -2)), timeSlot: "10:00", status: "Completed", reason: "Thyroid check, TSH results review", queueNumber: 2, notes: "TSH within normal range. Continue levothyroxine 50mcg." },
    { patientId: patients[11].id, doctorId: doctors[1].id, appointmentDate: fmt(add(today, -3)), timeSlot: "08:30", status: "Completed", reason: "Diabetes + CKD management", queueNumber: 1, notes: "eGFR 42. Refer to nephrology. Reduce metformin dose." },
    { patientId: patients[0].id, doctorId: doctors[0].id, appointmentDate: fmt(add(today, -7)), timeSlot: "09:00", status: "Completed", reason: "Initial consultation for hypertension", queueNumber: 3, notes: "Started amlodipine 5mg OD." },
    { patientId: patients[1].id, doctorId: doctors[3].id, appointmentDate: fmt(add(today, 5)), timeSlot: "14:00", status: "Pending", reason: "Pediatric referral for son", queueNumber: 1 },
    { patientId: patients[4].id, doctorId: doctors[2].id, appointmentDate: fmt(add(today, 7)), timeSlot: "09:00", status: "Pending", reason: "Pre-natal check-up", queueNumber: 2 },
  ];
  for (const a of appointmentData) {
    await db.insert(appointmentsTable).values(a).onConflictDoNothing();
  }
  const appointments = await db.select().from(appointmentsTable);
  console.log(`     ✓ ${appointments.length} appointments`);

  // ─── CONSULTATIONS ───────────────────────────────────────────────────────────
  console.log("  → Consultations…");
  const consultationData = [
    { patientId: patients[0].id, doctorId: doctors[0].id, consultationDate: fmt(add(today, -7)), subjective: "Patient complains of persistent headaches and dizziness, particularly in the morning.", objective: "BP 155/95 mmHg, HR 78 bpm, weight 68kg, BMI 24.2", assessment: "Hypertension Stage 2, uncontrolled", plan: "Start amlodipine 5mg OD. Low-sodium diet. Follow-up in 1 week.", diagnosis: "Essential Hypertension", icdCode: "I10", status: "Active" },
    { patientId: patients[1].id, doctorId: doctors[0].id, consultationDate: fmt(add(today, -14)), subjective: "Patient reports fatigue, frequent urination, and blurred vision.", objective: "FBS 320 mg/dL, HbA1c 11.2%, BP 130/82", assessment: "Type 2 Diabetes Mellitus, poorly controlled", plan: "Insulin therapy initiated. Metformin 500mg BID. Diabetic diet counseling. Monthly follow-up.", diagnosis: "Type 2 Diabetes Mellitus", icdCode: "E11", status: "Active" },
    { patientId: patients[3].id, doctorId: doctors[1].id, consultationDate: fmt(add(today, -3)), subjective: "Chest tightness on exertion, dyspnea climbing stairs. History of CAD.", objective: "ECG: Sinus rhythm, no acute ST changes. BP 140/88, HR 72 bpm regular", assessment: "Stable Angina, CAD known", plan: "Continue isosorbide mononitrate. Add clopidogrel. Refer for stress test.", diagnosis: "Stable Angina Pectoris", icdCode: "I20.9", status: "Active" },
    { patientId: patients[9].id, doctorId: doctors[0].id, consultationDate: fmt(add(today, -1)), subjective: "COPD follow-up. Increased dyspnea in cold weather. Uses inhaler twice daily.", objective: "Spirometry: FEV1 55% predicted. O2 sat 94% at rest.", assessment: "COPD, moderate severity (GOLD Stage 2)", plan: "Add LABA/ICS combination inhaler. Chest physiotherapy referral. Flu vaccine given.", diagnosis: "Chronic Obstructive Pulmonary Disease", icdCode: "J44.1", status: "Active" },
    { patientId: patients[11].id, doctorId: doctors[1].id, consultationDate: fmt(add(today, -3)), subjective: "Elderly diabetic patient with fatigue, leg swelling, decreased urine output.", objective: "BP 168/102, eGFR 42 mL/min, Creatinine 1.8 mg/dL, K+ 5.1", assessment: "Type 2 DM with Hypertension and CKD Stage 3", plan: "Reduce metformin. Add furosemide 20mg OD. Nephrology referral. Low-potassium diet.", diagnosis: "CKD Stage 3 with Diabetic Nephropathy", icdCode: "N18.3", status: "Active" },
    { patientId: patients[10].id, doctorId: doctors[0].id, consultationDate: fmt(add(today, -2)), subjective: "Routine thyroid follow-up. Feels well, no palpitations, no weight changes.", objective: "TSH 2.4 mIU/L (normal). BP 118/76, HR 72 bpm", assessment: "Hypothyroidism, controlled on levothyroxine", plan: "Continue levothyroxine 50mcg OD. Repeat TSH in 6 months.", diagnosis: "Hypothyroidism", icdCode: "E03.9", status: "Active" },
  ];
  for (const c of consultationData) {
    await db.insert(consultationsTable).values(c).onConflictDoNothing();
  }
  const consultations = await db.select().from(consultationsTable);
  console.log(`     ✓ ${consultations.length} consultations`);

  // ─── VITAL SIGNS ─────────────────────────────────────────────────────────────
  console.log("  → Vital Signs…");
  const vitalData = [
    { patientId: patients[0].id, recordedBy: "Nurse Maria Santos", recordedAt: fmt(add(today, -7)), bloodPressureSystolic: 155, bloodPressureDiastolic: 95, heartRate: 78, respiratoryRate: 18, oxygenSaturation: "98.5", temperature: "36.8", weight: "68.0", height: "165.0" },
    { patientId: patients[0].id, recordedBy: "Nurse Maria Santos", recordedAt: fmt(today), bloodPressureSystolic: 138, bloodPressureDiastolic: 86, heartRate: 74, respiratoryRate: 17, oxygenSaturation: "99.0", temperature: "36.6", weight: "67.5", height: "165.0" },
    { patientId: patients[1].id, recordedBy: "Nurse Carmen Dela Cruz", recordedAt: fmt(add(today, -14)), bloodPressureSystolic: 130, bloodPressureDiastolic: 82, heartRate: 88, respiratoryRate: 19, oxygenSaturation: "97.0", temperature: "37.1", weight: "82.0", height: "170.0" },
    { patientId: patients[1].id, recordedBy: "Nurse Carmen Dela Cruz", recordedAt: fmt(add(today, -7)), bloodPressureSystolic: 128, bloodPressureDiastolic: 80, heartRate: 84, respiratoryRate: 18, oxygenSaturation: "97.5", temperature: "37.0", weight: "81.5", height: "170.0" },
    { patientId: patients[3].id, recordedBy: "Nurse Roberto Garcia", recordedAt: fmt(add(today, -3)), bloodPressureSystolic: 140, bloodPressureDiastolic: 88, heartRate: 72, respiratoryRate: 16, oxygenSaturation: "96.0", temperature: "36.5", weight: "74.0", height: "172.0" },
    { patientId: patients[4].id, recordedBy: "Nurse Maria Santos", recordedAt: fmt(today), bloodPressureSystolic: 112, bloodPressureDiastolic: 70, heartRate: 76, respiratoryRate: 16, oxygenSaturation: "99.5", temperature: "36.4", weight: "58.0", height: "160.0" },
    { patientId: patients[9].id, recordedBy: "Nurse Roberto Garcia", recordedAt: fmt(add(today, -1)), bloodPressureSystolic: 132, bloodPressureDiastolic: 84, heartRate: 82, respiratoryRate: 22, oxygenSaturation: "94.0", temperature: "37.2", weight: "65.0", height: "168.0" },
    { patientId: patients[11].id, recordedBy: "Nurse Carmen Dela Cruz", recordedAt: fmt(add(today, -3)), bloodPressureSystolic: 168, bloodPressureDiastolic: 102, heartRate: 90, respiratoryRate: 20, oxygenSaturation: "95.0", temperature: "37.0", weight: "78.0", height: "162.0" },
    { patientId: patients[6].id, recordedBy: "Nurse Maria Santos", recordedAt: fmt(add(today, -10)), bloodPressureSystolic: 128, bloodPressureDiastolic: 82, heartRate: 80, respiratoryRate: 17, oxygenSaturation: "98.0", temperature: "36.7", weight: "71.0", height: "158.0" },
    { patientId: patients[2].id, recordedBy: "Nurse Carmen Dela Cruz", recordedAt: fmt(add(today, -5)), bloodPressureSystolic: 118, bloodPressureDiastolic: 76, heartRate: 78, respiratoryRate: 18, oxygenSaturation: "98.0", temperature: "36.6", weight: "62.0", height: "163.0" },
  ];
  for (const v of vitalData) {
    await db.insert(vitalSignsTable).values(v).onConflictDoNothing();
  }
  console.log(`     ✓ ${vitalData.length} vital sign records`);

  // ─── MEDICINES ───────────────────────────────────────────────────────────────
  console.log("  → Medicines…");
  const medicineData = [
    { drugName: "Amlodipine 5mg", genericName: "Amlodipine Besylate", quantity: 850, unit: "tablets", batchNumber: "BT-2024-001", expirationDate: "2026-08-31", supplier: "Unilab Philippines", reorderLevel: 100, unitPrice: "8.50", category: "Cardiovascular", isActive: true },
    { drugName: "Metformin 500mg", genericName: "Metformin HCl", quantity: 1200, unit: "tablets", batchNumber: "BT-2024-002", expirationDate: "2026-12-31", supplier: "Generika Philippines", reorderLevel: 150, unitPrice: "5.75", category: "Endocrine", isActive: true },
    { drugName: "Metoprolol 50mg", genericName: "Metoprolol Tartrate", quantity: 420, unit: "tablets", batchNumber: "BT-2024-003", expirationDate: "2026-06-30", supplier: "Pfizer Philippines", reorderLevel: 80, unitPrice: "12.00", category: "Cardiovascular", isActive: true },
    { drugName: "Furosemide 40mg", genericName: "Furosemide", quantity: 680, unit: "tablets", batchNumber: "BT-2024-004", expirationDate: "2026-09-30", supplier: "Pharex Health Corp", reorderLevel: 100, unitPrice: "4.50", category: "Diuretics", isActive: true },
    { drugName: "Levothyroxine 50mcg", genericName: "Levothyroxine Sodium", quantity: 320, unit: "tablets", batchNumber: "BT-2024-005", expirationDate: "2026-03-31", supplier: "Merck Philippines", reorderLevel: 50, unitPrice: "18.50", category: "Hormones", isActive: true },
    { drugName: "Omeprazole 20mg", genericName: "Omeprazole", quantity: 900, unit: "capsules", batchNumber: "BT-2024-006", expirationDate: "2026-11-30", supplier: "Unilab Philippines", reorderLevel: 100, unitPrice: "9.00", category: "GI", isActive: true },
    { drugName: "Amoxicillin 500mg", genericName: "Amoxicillin Trihydrate", quantity: 55, unit: "capsules", batchNumber: "BT-2024-007", expirationDate: "2025-09-30", supplier: "Generika Philippines", reorderLevel: 100, unitPrice: "7.00", category: "Antibiotics", isActive: true },
    { drugName: "Salbutamol Inhaler 100mcg", genericName: "Salbutamol Sulfate", quantity: 88, unit: "pcs", batchNumber: "BT-2024-008", expirationDate: "2025-12-31", supplier: "GSK Philippines", reorderLevel: 30, unitPrice: "280.00", category: "Respiratory", isActive: true },
    { drugName: "Clopidogrel 75mg", genericName: "Clopidogrel Bisulfate", quantity: 480, unit: "tablets", batchNumber: "BT-2024-009", expirationDate: "2026-07-31", supplier: "Sanofi Philippines", reorderLevel: 60, unitPrice: "22.00", category: "Cardiovascular", isActive: true },
    { drugName: "Losartan 50mg", genericName: "Losartan Potassium", quantity: 750, unit: "tablets", batchNumber: "BT-2024-010", expirationDate: "2026-10-31", supplier: "Unilab Philippines", reorderLevel: 100, unitPrice: "14.50", category: "Cardiovascular", isActive: true },
    { drugName: "Insulin Glargine 100IU/mL", genericName: "Insulin Glargine", quantity: 18, unit: "vials", batchNumber: "BT-2024-011", expirationDate: "2025-06-30", supplier: "Sanofi Philippines", reorderLevel: 10, unitPrice: "1850.00", category: "Endocrine", isActive: true },
    { drugName: "Paracetamol 500mg", genericName: "Paracetamol", quantity: 2500, unit: "tablets", batchNumber: "BT-2024-012", expirationDate: "2027-01-31", supplier: "Unilab Philippines", reorderLevel: 200, unitPrice: "2.50", category: "Analgesics", isActive: true },
    { drugName: "Cetirizine 10mg", genericName: "Cetirizine HCl", quantity: 640, unit: "tablets", batchNumber: "BT-2024-013", expirationDate: "2026-08-31", supplier: "Pharex Health Corp", reorderLevel: 80, unitPrice: "6.50", category: "Antihistamines", isActive: true },
    { drugName: "Atorvastatin 20mg", genericName: "Atorvastatin Calcium", quantity: 38, unit: "tablets", batchNumber: "BT-2024-014", expirationDate: "2025-04-30", supplier: "Pfizer Philippines", reorderLevel: 80, unitPrice: "28.00", category: "Cardiovascular", isActive: true },
    { drugName: "Isosorbide Mononitrate 60mg SR", genericName: "Isosorbide Mononitrate", quantity: 260, unit: "tablets", batchNumber: "BT-2024-015", expirationDate: "2026-05-31", supplier: "Pharex Health Corp", reorderLevel: 40, unitPrice: "35.00", category: "Cardiovascular", isActive: true },
  ];
  for (const m of medicineData) {
    await db.insert(medicinesTable).values(m).onConflictDoNothing();
  }
  const medicines = await db.select().from(medicinesTable);
  console.log(`     ✓ ${medicines.length} medicines`);

  // ─── PRESCRIPTIONS ───────────────────────────────────────────────────────────
  console.log("  → Prescriptions…");
  const prescriptionData = [
    { patientId: patients[0].id, doctorId: doctors[0].id, medicineId: medicines[0].id, dosage: "5mg", frequency: "Once daily (OD)", duration: "30 days", instructions: "Take in the morning. Monitor BP daily.", prescribedAt: fmt(add(today, -7)), status: "Active" },
    { patientId: patients[1].id, doctorId: doctors[0].id, medicineId: medicines[1].id, dosage: "500mg", frequency: "Twice daily (BID)", duration: "90 days", instructions: "Take with meals to reduce GI side effects.", prescribedAt: fmt(add(today, -14)), status: "Active" },
    { patientId: patients[1].id, doctorId: doctors[0].id, medicineId: medicines[10].id, dosage: "10 units subcutaneous", frequency: "Once daily at bedtime", duration: "Ongoing", instructions: "Inject at bedtime. Rotate injection sites. Monitor FBS.", prescribedAt: fmt(add(today, -14)), status: "Active" },
    { patientId: patients[3].id, doctorId: doctors[1].id, medicineId: medicines[8].id, dosage: "75mg", frequency: "Once daily (OD)", duration: "Ongoing", instructions: "Do not stop without doctor's advice.", prescribedAt: fmt(add(today, -3)), status: "Active" },
    { patientId: patients[3].id, doctorId: doctors[1].id, medicineId: medicines[14].id, dosage: "60mg SR", frequency: "Once daily (OD)", duration: "Ongoing", instructions: "Take in the morning. Avoid taking at night.", prescribedAt: fmt(add(today, -3)), status: "Active" },
    { patientId: patients[9].id, doctorId: doctors[0].id, medicineId: medicines[7].id, dosage: "2 puffs", frequency: "Every 4-6 hours as needed (PRN)", duration: "Ongoing", instructions: "Use rescue inhaler for shortness of breath only.", prescribedAt: fmt(add(today, -1)), status: "Active" },
    { patientId: patients[10].id, doctorId: doctors[0].id, medicineId: medicines[4].id, dosage: "50mcg", frequency: "Once daily (OD) fasting", duration: "Ongoing", instructions: "Take 30 minutes before breakfast. Separate from calcium supplements.", prescribedAt: fmt(add(today, -2)), status: "Active" },
    { patientId: patients[11].id, doctorId: doctors[1].id, medicineId: medicines[3].id, dosage: "20mg", frequency: "Once daily (OD)", duration: "Ongoing", instructions: "Take in the morning. Monitor urine output and potassium.", prescribedAt: fmt(add(today, -3)), status: "Active" },
    { patientId: patients[0].id, doctorId: doctors[0].id, medicineId: medicines[11].id, dosage: "500mg", frequency: "Every 8 hours (Q8H) as needed", duration: "5 days", instructions: "Do not exceed 8 tablets/day.", prescribedAt: fmt(add(today, -14)), status: "Completed" },
    { patientId: patients[4].id, doctorId: doctors[3].id, medicineId: medicines[12].id, dosage: "10mg", frequency: "Once daily (OD) at bedtime", duration: "14 days", instructions: "For allergic rhinitis. May cause drowsiness.", prescribedAt: fmt(add(today, -5)), status: "Active" },
  ];
  for (const p of prescriptionData) {
    await db.insert(prescriptionsTable).values(p).onConflictDoNothing();
  }
  const prescriptions = await db.select().from(prescriptionsTable);
  console.log(`     ✓ ${prescriptions.length} prescriptions`);

  // ─── DISPENSING RECORDS ───────────────────────────────────────────────────────
  console.log("  → Dispensing records…");
  const dispensingData = [
    { patientId: patients[0].id, medicineId: medicines[0].id, prescriptionId: prescriptions[0].id, quantityDispensed: 30, dispensedAt: fmt(add(today, -7)), dispensedBy: "Juan dela Cruz" },
    { patientId: patients[1].id, medicineId: medicines[1].id, prescriptionId: prescriptions[1].id, quantityDispensed: 60, dispensedAt: fmt(add(today, -14)), dispensedBy: "Kevin Lim" },
    { patientId: patients[1].id, medicineId: medicines[10].id, prescriptionId: prescriptions[2].id, quantityDispensed: 2, dispensedAt: fmt(add(today, -14)), dispensedBy: "Juan dela Cruz" },
    { patientId: patients[3].id, medicineId: medicines[8].id, prescriptionId: prescriptions[3].id, quantityDispensed: 30, dispensedAt: fmt(add(today, -3)), dispensedBy: "Kevin Lim" },
    { patientId: patients[10].id, medicineId: medicines[4].id, prescriptionId: prescriptions[6].id, quantityDispensed: 30, dispensedAt: fmt(add(today, -2)), dispensedBy: "Juan dela Cruz" },
    { patientId: patients[0].id, medicineId: medicines[11].id, prescriptionId: prescriptions[8].id, quantityDispensed: 40, dispensedAt: fmt(add(today, -14)), dispensedBy: "Kevin Lim" },
  ];
  for (const d of dispensingData) {
    await db.insert(dispensingRecordsTable).values(d).onConflictDoNothing();
  }
  console.log(`     ✓ ${dispensingData.length} dispensing records`);

  // ─── LAB REQUESTS ────────────────────────────────────────────────────────────
  console.log("  → Lab requests…");
  const labData = [
    { patientId: patients[0].id, doctorId: doctors[0].id, testType: "Complete Blood Count (CBC)", status: "Completed", requestedAt: fmt(add(today, -7)), completedAt: fmt(add(today, -6)), resultSummary: "Hgb 13.8 g/dL, WBC 7,200/uL, Platelets 242,000/uL — All within normal limits.", notes: "Routine workup for hypertension" },
    { patientId: patients[0].id, doctorId: doctors[0].id, testType: "Lipid Panel", status: "Completed", requestedAt: fmt(add(today, -7)), completedAt: fmt(add(today, -6)), resultSummary: "Total Cholesterol 228 mg/dL, LDL 148 mg/dL (High), HDL 42 mg/dL, TG 190 mg/dL — Dyslipidemia noted.", notes: "Consider statin therapy" },
    { patientId: patients[1].id, doctorId: doctors[0].id, testType: "Fasting Blood Sugar (FBS)", status: "Completed", requestedAt: fmt(add(today, -14)), completedAt: fmt(add(today, -13)), resultSummary: "FBS: 320 mg/dL — Significantly elevated. Consistent with poorly controlled DM.", notes: "Repeat in 2 weeks" },
    { patientId: patients[1].id, doctorId: doctors[0].id, testType: "HbA1c", status: "Completed", requestedAt: fmt(add(today, -14)), completedAt: fmt(add(today, -12)), resultSummary: "HbA1c: 11.2% — Severely uncontrolled. Target <7%.", notes: "Insulin therapy initiated" },
    { patientId: patients[1].id, doctorId: doctors[0].id, testType: "Kidney Function Test (KFT)", status: "Completed", requestedAt: fmt(add(today, -7)), completedAt: fmt(add(today, -6)), resultSummary: "BUN 18 mg/dL, Creatinine 1.0 mg/dL, eGFR 88 — Within normal range for age.", notes: "Monitoring for diabetic nephropathy" },
    { patientId: patients[3].id, doctorId: doctors[1].id, testType: "12-Lead ECG", status: "Completed", requestedAt: fmt(add(today, -3)), completedAt: fmt(add(today, -3)), resultSummary: "Sinus rhythm, HR 72 bpm. No acute ischemic changes. Old LBBB noted.", notes: "Stable compared to previous" },
    { patientId: patients[3].id, doctorId: doctors[1].id, testType: "Echocardiogram", status: "Pending", requestedAt: fmt(add(today, -1)), notes: "Evaluate LV function and wall motion" },
    { patientId: patients[9].id, doctorId: doctors[0].id, testType: "Pulmonary Function Test (Spirometry)", status: "Completed", requestedAt: fmt(add(today, -1)), completedAt: fmt(today), resultSummary: "FEV1 55% predicted, FVC 72%, FEV1/FVC 0.68 — Moderate obstructive pattern. Consistent with COPD GOLD Stage 2.", notes: "Follow GOLD guidelines" },
    { patientId: patients[11].id, doctorId: doctors[1].id, testType: "BMP (Basic Metabolic Panel)", status: "Completed", requestedAt: fmt(add(today, -3)), completedAt: fmt(add(today, -2)), resultSummary: "Na 138, K 5.1 (Slightly High), Creatinine 1.8 (Elevated), eGFR 42 (CKD Stage 3), Glucose 210 mg/dL.", notes: "Nephrology referral needed" },
    { patientId: patients[4].id, doctorId: doctors[3].id, testType: "Urinalysis", status: "Completed", requestedAt: fmt(add(today, -5)), completedAt: fmt(add(today, -4)), resultSummary: "Color: Yellow, Clear. Protein: Negative. Glucose: Negative. WBC: 0-2/hpf. RBC: 0-1/hpf. — Normal.", notes: "Routine check-up" },
    { patientId: patients[2].id, doctorId: doctors[2].id, testType: "Pap Smear", status: "Pending", requestedAt: fmt(today), notes: "Annual cervical screening" },
    { patientId: patients[5].id, doctorId: doctors[0].id, testType: "X-Ray (Knee AP/Lateral)", status: "For Processing", requestedAt: fmt(today), notes: "Bilateral knee pain evaluation, possible OA" },
    { patientId: patients[8].id, doctorId: doctors[6].id, testType: "Skin Scraping KOH Prep", status: "Pending", requestedAt: fmt(add(today, 3)), notes: "Rule out tinea infection on forearm rash" },
  ];
  for (const l of labData) {
    await db.insert(labRequestsTable).values(l).onConflictDoNothing();
  }
  const labs = await db.select().from(labRequestsTable);
  console.log(`     ✓ ${labs.length} lab requests`);

  // ─── BILLINGS ────────────────────────────────────────────────────────────────
  console.log("  → Billings…");
  const billingData = [
    { patientId: patients[0].id, invoiceNumber: "INV-2024-0001", consultationFee: "800", medicineFee: "255", labFee: "650", roomFee: "0", otherFees: "100", totalAmount: "1805", paidAmount: "1805", discountAmount: "0", philhealthDeduction: "400", status: "Paid", issuedAt: fmt(add(today, -7)), dueDate: fmt(add(today, 23)), notes: "Initial hypertension consult + labs + meds" },
    { patientId: patients[1].id, invoiceNumber: "INV-2024-0002", consultationFee: "800", medicineFee: "3820", labFee: "1200", roomFee: "0", otherFees: "200", totalAmount: "6020", paidAmount: "2000", discountAmount: "0", philhealthDeduction: "600", status: "Partially Paid", issuedAt: fmt(add(today, -14)), dueDate: fmt(add(today, 16)), notes: "Diabetes initial workup + insulin + metformin" },
    { patientId: patients[3].id, invoiceNumber: "INV-2024-0003", consultationFee: "1200", medicineFee: "1710", labFee: "2500", roomFee: "4200", otherFees: "500", totalAmount: "10110", paidAmount: "0", discountAmount: "0", philhealthDeduction: "2000", status: "Unpaid", issuedAt: fmt(add(today, -3)), dueDate: fmt(add(today, 27)), notes: "Cardiology consult + 1-day observation" },
    { patientId: patients[9].id, invoiceNumber: "INV-2024-0004", consultationFee: "800", medicineFee: "840", labFee: "1500", roomFee: "0", otherFees: "150", totalAmount: "3290", paidAmount: "3290", discountAmount: "0", philhealthDeduction: "600", status: "Paid", issuedAt: fmt(add(today, -1)), dueDate: fmt(add(today, 29)), notes: "COPD follow-up + spirometry + new inhaler" },
    { patientId: patients[11].id, invoiceNumber: "INV-2024-0005", consultationFee: "1200", medicineFee: "450", labFee: "2800", roomFee: "8400", otherFees: "800", totalAmount: "13650", paidAmount: "5000", discountAmount: "500", philhealthDeduction: "3500", status: "Partially Paid", issuedAt: fmt(add(today, -3)), dueDate: fmt(add(today, 27)), notes: "CKD + DM admission. PhilHealth applied." },
    { patientId: patients[10].id, invoiceNumber: "INV-2024-0006", consultationFee: "800", medicineFee: "555", labFee: "800", roomFee: "0", otherFees: "0", totalAmount: "2155", paidAmount: "2155", discountAmount: "0", philhealthDeduction: "400", status: "Paid", issuedAt: fmt(add(today, -2)), dueDate: fmt(add(today, 28)), notes: "Thyroid follow-up + TSH + levothyroxine" },
    { patientId: patients[4].id, invoiceNumber: "INV-2024-0007", consultationFee: "600", medicineFee: "91", labFee: "350", roomFee: "0", otherFees: "0", totalAmount: "1041", paidAmount: "0", discountAmount: "0", philhealthDeduction: "350", status: "Unpaid", issuedAt: fmt(today), dueDate: fmt(add(today, 30)), notes: "General check-up + urinalysis + antihistamine" },
    { patientId: patients[2].id, invoiceNumber: "INV-2024-0008", consultationFee: "1000", medicineFee: "0", labFee: "1500", roomFee: "0", otherFees: "200", totalAmount: "2700", paidAmount: "0", discountAmount: "0", philhealthDeduction: "500", status: "Unpaid", issuedAt: fmt(today), dueDate: fmt(add(today, 30)), notes: "OB-GYN check-up + Pap smear" },
    { patientId: patients[6].id, invoiceNumber: "INV-2024-0009", consultationFee: "1500", medicineFee: "0", labFee: "0", roomFee: "0", otherFees: "0", totalAmount: "1500", paidAmount: "1500", discountAmount: "200", philhealthDeduction: "400", status: "Paid", issuedAt: fmt(add(today, -10)), dueDate: fmt(add(today, 20)), notes: "Neurology consultation" },
    { patientId: patients[7].id, invoiceNumber: "INV-2024-0010", consultationFee: "1500", medicineFee: "500", labFee: "3200", roomFee: "0", otherFees: "300", totalAmount: "5500", paidAmount: "2750", discountAmount: "0", philhealthDeduction: "1200", status: "Partially Paid", issuedAt: fmt(add(today, -8)), dueDate: fmt(add(today, 22)), notes: "Pre-surgical evaluation" },
  ];
  for (const b of billingData) {
    await db.insert(billingsTable).values(b).onConflictDoNothing();
  }
  const billings = await db.select().from(billingsTable);
  console.log(`     ✓ ${billings.length} billing records`);

  // ─── PAYMENTS ────────────────────────────────────────────────────────────────
  console.log("  → Payments…");
  const paymentData = [
    { billingId: billings[0].id, amount: "1805", method: "GCash", referenceNumber: "GC-2024-001", paidAt: fmt(add(today, -6)), receivedBy: "Leo Tan" },
    { billingId: billings[1].id, amount: "2000", method: "Cash", referenceNumber: null, paidAt: fmt(add(today, -7)), receivedBy: "Sofia Tan" },
    { billingId: billings[3].id, amount: "3290", method: "Credit Card", referenceNumber: "CC-2024-004", paidAt: fmt(today), receivedBy: "Leo Tan" },
    { billingId: billings[4].id, amount: "5000", method: "PhilHealth", referenceNumber: "PH-CLAIM-2024-001", paidAt: fmt(add(today, -2)), receivedBy: "Sofia Tan" },
    { billingId: billings[5].id, amount: "2155", method: "Maya", referenceNumber: "MY-2024-006", paidAt: fmt(add(today, -1)), receivedBy: "Leo Tan" },
    { billingId: billings[8].id, amount: "1500", method: "Cash", referenceNumber: null, paidAt: fmt(add(today, -10)), receivedBy: "Sofia Tan" },
    { billingId: billings[9].id, amount: "2750", method: "BDO Online", referenceNumber: "BDO-2024-010", paidAt: fmt(add(today, -5)), receivedBy: "Leo Tan" },
  ];
  for (const p of paymentData) {
    await db.insert(paymentsTable).values(p).onConflictDoNothing();
  }
  console.log(`     ✓ ${paymentData.length} payment records`);

  // ─── WARDS ───────────────────────────────────────────────────────────────────
  console.log("  → Wards & Beds…");
  const wardData = [
    { name: "Medical Ward A", wardType: "General", floor: "3rd Floor", totalBeds: 10, description: "General medicine ward for adult inpatients" },
    { name: "Medical Ward B", wardType: "General", floor: "3rd Floor", totalBeds: 10, description: "Overflow ward for medical cases" },
    { name: "Surgical Ward", wardType: "Surgical", floor: "4th Floor", totalBeds: 8, description: "Post-operative surgical recovery" },
    { name: "Cardiac Care Unit (CCU)", wardType: "ICU", floor: "5th Floor", totalBeds: 4, description: "Intensive care for cardiac patients" },
    { name: "Pediatric Ward", wardType: "Pediatric", floor: "2nd Floor", totalBeds: 8, description: "Inpatient ward for patients under 18" },
    { name: "Maternity Ward", wardType: "OB", floor: "2nd Floor", totalBeds: 6, description: "OB-GYN and maternity inpatient ward" },
    { name: "Private Rooms", wardType: "Private", floor: "6th Floor", totalBeds: 12, description: "Private rooms for all specialties" },
    { name: "Emergency Ward", wardType: "Emergency", floor: "Ground Floor", totalBeds: 6, description: "ER holding area for admitted patients pending transfer" },
  ];
  for (const w of wardData) {
    await db.insert(wardsTable).values(w).onConflictDoNothing();
  }
  const wards = await db.select().from(wardsTable);
  console.log(`     ✓ ${wards.length} wards`);

  // ─── BEDS ────────────────────────────────────────────────────────────────────
  const bedData: {wardId: number; bedNumber: string; status: string; patientId?: number; admittedAt?: string; notes?: string}[] = [];
  const wardBedCounts: Record<string, number> = {
    "Medical Ward A": 10, "Medical Ward B": 10, "Surgical Ward": 8,
    "Cardiac Care Unit (CCU)": 4, "Pediatric Ward": 8, "Maternity Ward": 6,
    "Private Rooms": 12, "Emergency Ward": 6,
  };

  for (const ward of wards) {
    const total = wardBedCounts[ward.name] || ward.totalBeds;
    for (let i = 1; i <= total; i++) {
      bedData.push({ wardId: ward.id, bedNumber: `${ward.name.substring(0, 2).toUpperCase()}-${String(i).padStart(2, "0")}`, status: "Available" });
    }
  }

  const occupiedBeds = [
    { wardName: "Medical Ward A", bedIdx: 0, patientIdx: 11, notes: "CKD + DM — Diet restriction, daily vitals" },
    { wardName: "Medical Ward A", bedIdx: 1, patientIdx: 9, notes: "COPD exacerbation — O2 support" },
    { wardName: "Medical Ward A", bedIdx: 2, patientIdx: 6, notes: "Admitted for observation — osteoarthritis pain management" },
    { wardName: "Cardiac Care Unit (CCU)", bedIdx: 0, patientIdx: 3, notes: "CAD monitoring — ECG q4h" },
    { wardName: "Surgical Ward", bedIdx: 0, patientIdx: 7, notes: "Pre-op for gallbladder surgery — NPO" },
  ];

  const wardBedMap: Record<string, typeof bedData> = {};
  for (const b of bedData) {
    const ward = wards.find(w => w.id === b.wardId);
    if (ward) {
      if (!wardBedMap[ward.name]) wardBedMap[ward.name] = [];
      wardBedMap[ward.name].push(b);
    }
  }

  for (const occ of occupiedBeds) {
    const wardBeds = wardBedMap[occ.wardName];
    if (wardBeds && wardBeds[occ.bedIdx]) {
      wardBeds[occ.bedIdx].status = "Occupied";
      wardBeds[occ.bedIdx].patientId = patients[occ.patientIdx]?.id;
      wardBeds[occ.bedIdx].admittedAt = fmt(add(today, -Math.floor(Math.random() * 3 + 1)));
      wardBeds[occ.bedIdx].notes = occ.notes;
    }
  }

  for (const b of bedData) {
    await db.insert(bedsTable).values(b).onConflictDoNothing();
  }
  const beds = await db.select().from(bedsTable);
  console.log(`     ✓ ${beds.length} beds`);

  // ─── STAFF TABLE ─────────────────────────────────────────────────────────────
  console.log("  → Staff records…");
  const staffData = [
    { firstName: "Maria", lastName: "Santos", role: "Nurse", email: "nurse@hanapcare.ph", contactNumber: "09171234567", departmentId: deptMap["Internal Medicine"], employeeId: "EMP-001", shift: "Day (7AM-3PM)", joinedAt: "2020-01-15" },
    { firstName: "Ana", lastName: "Reyes", role: "Receptionist", email: "receptionist@hanapcare.ph", contactNumber: "09181234567", departmentId: deptMap["Emergency"], employeeId: "EMP-002", shift: "Day (8AM-5PM)", joinedAt: "2021-03-01" },
    { firstName: "Juan", lastName: "Dela Cruz", role: "Pharmacist", email: "pharmacist@hanapcare.ph", contactNumber: "09191234567", departmentId: deptMap["Pharmacy"], employeeId: "EMP-003", shift: "Day (8AM-5PM)", joinedAt: "2019-06-10" },
    { firstName: "Grace", lastName: "Mendoza", role: "Lab Staff", email: "lab@hanapcare.ph", contactNumber: "09201234567", departmentId: deptMap["Laboratory"], employeeId: "EMP-004", shift: "Day (7AM-3PM)", joinedAt: "2022-01-20" },
    { firstName: "Leo", lastName: "Tan", role: "Cashier", email: "cashier@hanapcare.ph", contactNumber: "09211234567", departmentId: null, employeeId: "EMP-005", shift: "Day (8AM-5PM)", joinedAt: "2021-07-05" },
    { firstName: "Carmen", lastName: "Dela Cruz", role: "Nurse", email: "nurse.dela@hanapcare.ph", contactNumber: "09221234567", departmentId: deptMap["Surgical Ward"] ?? null, employeeId: "EMP-006", shift: "Night (11PM-7AM)", joinedAt: "2022-09-01" },
    { firstName: "Roberto", lastName: "Garcia", role: "Nurse", email: "nurse.garcia@hanapcare.ph", contactNumber: "09231234567", departmentId: deptMap["Pediatrics"], employeeId: "EMP-007", shift: "Evening (3PM-11PM)", joinedAt: "2023-02-15" },
    { firstName: "Rosa", lastName: "Flores", role: "Receptionist", email: "recept.flores@hanapcare.ph", contactNumber: "09241234567", departmentId: null, employeeId: "EMP-008", shift: "Evening (12PM-8PM)", joinedAt: "2023-05-10" },
    { firstName: "Kevin", lastName: "Lim", role: "Pharmacist", email: "pharma.lim@hanapcare.ph", contactNumber: "09251234567", departmentId: deptMap["Pharmacy"], employeeId: "EMP-009", shift: "Evening (2PM-10PM)", joinedAt: "2022-11-01" },
    { firstName: "Alex", lastName: "Mendoza", role: "Lab Staff", email: "lab.mendoza@hanapcare.ph", contactNumber: "09261234567", departmentId: deptMap["Laboratory"], employeeId: "EMP-010", shift: "Evening (3PM-11PM)", joinedAt: "2023-08-20" },
    { firstName: "Sofia", lastName: "Tan", role: "Cashier", email: "cashier.tan@hanapcare.ph", contactNumber: "09271234567", departmentId: null, employeeId: "EMP-011", shift: "Night (10PM-6AM)", joinedAt: "2023-12-01" },
  ];
  for (const s of staffData) {
    await db.insert(staffTable).values(s).onConflictDoNothing();
  }
  console.log(`     ✓ ${staffData.length} staff records`);

  console.log("\n✅ Demo seed complete!");
  console.log("\n📧 Account emails (all password: Neowise_24):");
  console.log("   Admin:         admin@hanapcare.ph");
  console.log("   Doctor:        doctor@hanapcare.ph  |  dr.santos@hanapcare.ph  |  dr.reyes@hanapcare.ph");
  console.log("   Nurse:         nurse@hanapcare.ph  |  nurse.dela@hanapcare.ph  |  nurse.garcia@hanapcare.ph");
  console.log("   Receptionist:  receptionist@hanapcare.ph  |  recept.flores@hanapcare.ph");
  console.log("   Pharmacist:    pharmacist@hanapcare.ph  |  pharma.lim@hanapcare.ph");
  console.log("   Lab Staff:     lab@hanapcare.ph  |  lab.mendoza@hanapcare.ph");
  console.log("   Cashier:       cashier@hanapcare.ph  |  cashier.tan@hanapcare.ph");
  console.log("   Support:       support@hanapcare.ph  |  cbolante24@gmail.com  |  support2@hanapcare.ph");
  console.log("   Patient:       patient1@gmail.com  |  patient2@gmail.com  |  patient3@gmail.com");

  await pool.end();
}

seed().catch((err) => {
  console.error("Demo seed failed:", err);
  process.exit(1);
});
