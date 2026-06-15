import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import patientsRouter from "./patients";
import appointmentsRouter from "./appointments";
import doctorsRouter from "./doctors";
import departmentsRouter from "./departments";
import consultationsRouter from "./consultations";
import labRouter from "./lab";
import pharmacyRouter from "./pharmacy";
import billingRouter from "./billing";
import wardsRouter from "./wards";
import staffRouter from "./staff";
import notificationsRouter from "./notifications";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dashboardRouter);
router.use(patientsRouter);
router.use(appointmentsRouter);
router.use(doctorsRouter);
router.use(departmentsRouter);
router.use(consultationsRouter);
router.use(labRouter);
router.use(pharmacyRouter);
router.use(billingRouter);
router.use(wardsRouter);
router.use(staffRouter);
router.use(notificationsRouter);

export default router;
