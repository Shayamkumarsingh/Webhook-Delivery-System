import express from "express";
import { getAll,retry,remove } from "../controllers/dlq.controller.js";

const router =express.Router();

router.get("/",getAll);
router.post("/retry/:id",retry);
router.delete("/:id",remove);

export default router;