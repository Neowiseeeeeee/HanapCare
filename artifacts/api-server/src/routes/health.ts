import { Router, type IRouter } from "express";
import { isDbConfigured } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  res.json({ status: "ok", dbConfigured: isDbConfigured });
});

export default router;
