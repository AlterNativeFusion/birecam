import { Router } from "express";
import { loginUsuario } from "../controllers/loginController.js";

const router = Router();

router.post('/', loginUsuario);

export default router;