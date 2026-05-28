import express from "express";
import { create, getAll, remove } from "../controllers/webhook.controller.js";
import { validate } from "../middlewares/validate.middleware.js";

import { createWebhookSchema } from "../validators/webhook.validator.js";


const router =express.Router();


router.post("/create",validate(createWebhookSchema),create);
router.get("/", getAll); 
router.get("/getall",getAll);
router.delete("/:id",remove);

export default router;