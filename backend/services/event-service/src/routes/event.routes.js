import express from "express";
import { create } from "../controllers/event.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { idempotency } from "../middlewares/idempotency.middleware.js";
import { eventSchema } from "../validators/event.validator.js";
import { verifyUser } from "../middlewares/auth.middleware.js";



const router=express.Router();

router.use(verifyUser);

router.post("/",idempotency,validate(eventSchema),create);

export default router;