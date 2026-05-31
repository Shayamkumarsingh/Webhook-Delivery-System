import express from "express";
import { register, login , getMe ,getUserById ,refresh,logout } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { verifyApiKey } from "../middlewares/apiKey.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";


const router=express.Router();


router.post("/register",validate(registerSchema),register);
router.post("/login",validate(loginSchema),login);
router.get("/me",verifyApiKey,getMe);
router.get("/get/user/:id",verifyApiKey,getUserById);
router.post("/refresh", refresh);
router.post("/logout", logout);


export default router;