import { Router } from "express";
import { db } from "@workspace/db";
import { billingsTable, paymentsTable, auditLogsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

const BILLING_ROLES = ["Admin", "Cashier", "Doctor", "Nurse", "Receptionist"];

const BASE_QUERY = `
  SELECT
    b.id, b.patient_id as "patientId",
    concat(p.first_name, ' ', p.last_name) as "patientName",
    b.invoice_number as "invoiceNumber",
    b.consultation_fee as "consultationFee",
    b.medicine_fee as "medicineFee",
    b.lab_fee as "labFee",
    b.room_fee as "roomFee",
    b.other_fees as "otherFees",
    b.total_amount as "totalAmount",
    b.paid_amount as "paidAmount",
    b.discount_amount as "discountAmount",
    b.philhealth_deduction as "philhealthDeduction",
    b.status, b.issued_at as "issuedAt",
    b.due_date as "dueDate", b.notes,
    b.created_at as "createdAt"
  FROM billings b
  LEFT JOIN patients p ON p.id = b.patient_id
`;

router.get("/billings", requireAuth, async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = 20;
    const offset = (page - 1) * limit;
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(billingsTable);

    let rows: any[];
    if (req.query.status && req.query.patientId) {
      const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE b.status = ${req.query.status as string} AND b.patient_id = ${Number(req.query.patientId)} ORDER BY b.created_at DESC LIMIT ${limit} OFFSET ${offset}`);
      rows = r.rows as any[];
    } else if (req.query.status) {
      const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE b.status = ${req.query.status as string} ORDER BY b.created_at DESC LIMIT ${limit} OFFSET ${offset}`);
      rows = r.rows as any[];
    } else if (req.query.patientId) {
      const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE b.patient_id = ${Number(req.query.patientId)} ORDER BY b.created_at DESC LIMIT ${limit} OFFSET ${offset}`);
      rows = r.rows as any[];
    } else {
      const r = await db.execute(sql`${sql.raw(BASE_QUERY)} ORDER BY b.created_at DESC LIMIT ${limit} OFFSET ${offset}`);
      rows = r.rows as any[];
    }
    return res.json({ data: rows, total: Number(count), page });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/billings", requireAuth, requireRole(...BILLING_ROLES), async (req, res) => {
  try {
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(billingsTable);
    const invoiceNumber = `INV-${String(Number(count) + 1).padStart(6, "0")}`;
    const today = new Date().toISOString().split("T")[0];
    const [billing] = await db.insert(billingsTable).values({
      ...req.body,
      invoiceNumber,
      issuedAt: today,
      paidAmount: "0",
      status: "Unpaid",
    }).returning();

    await db.insert(auditLogsTable).values({
      action: "CREATE_BILLING",
      tableName: "billings",
      recordId: billing.id,
      userId: req.jwtUser!.sub,
      userName: req.jwtUser!.fullName,
      details: `Invoice ${invoiceNumber} created`,
    });

    const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE b.id = ${billing.id}`);
    return res.status(201).json((r.rows as any[])[0] ?? billing);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/billings/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE b.id = ${id}`);
    if (!(r.rows as any[]).length) return res.status(404).json({ error: "Billing not found" });
    return res.json((r.rows as any[])[0]);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/billings/:id", requireAuth, requireRole(...BILLING_ROLES), async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.update(billingsTable).set(req.body).where(eq(billingsTable.id, id));

    await db.insert(auditLogsTable).values({
      action: "UPDATE_BILLING",
      tableName: "billings",
      recordId: id,
      userId: req.jwtUser!.sub,
      userName: req.jwtUser!.fullName,
      details: `Billing record updated`,
    });

    const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE b.id = ${id}`);
    if (!(r.rows as any[]).length) return res.status(404).json({ error: "Billing not found" });
    return res.json((r.rows as any[])[0]);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/payments", requireAuth, async (req, res) => {
  try {
    let q = db.select().from(paymentsTable);
    if (req.query.billingId) {
      q = q.where(eq(paymentsTable.billingId, Number(req.query.billingId))) as any;
    }
    const rows = await q.orderBy(sql`${paymentsTable.paidAt} desc`);
    return res.json(rows);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/payments", requireAuth, requireRole(...BILLING_ROLES), async (req, res) => {
  try {
    const { billingId, amount } = req.body;
    if (!billingId || !amount) {
      return res.status(400).json({ error: "billingId and amount are required" });
    }
    const today = new Date().toISOString();
    const [payment] = await db.insert(paymentsTable).values({ ...req.body, paidAt: today }).returning();
    const [billing] = await db.select().from(billingsTable).where(eq(billingsTable.id, billingId));
    if (billing) {
      const newPaid = Number(billing.paidAmount) + Number(amount);
      const total = Number(billing.totalAmount);
      const status = newPaid >= total ? "Paid" : newPaid > 0 ? "Partially Paid" : "Unpaid";
      await db.update(billingsTable).set({ paidAmount: String(newPaid), status }).where(eq(billingsTable.id, billingId));

      await db.insert(auditLogsTable).values({
        action: "RECORD_PAYMENT",
        tableName: "payments",
        recordId: payment.id,
        userId: req.jwtUser!.sub,
        userName: req.jwtUser!.fullName,
        details: `Payment of ₱${Number(amount).toLocaleString()} recorded for billing #${billingId}`,
      });
    }
    return res.status(201).json(payment);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
