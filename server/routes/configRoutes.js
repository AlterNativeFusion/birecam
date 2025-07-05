import { Router } from "express";
import { getNotacionesAutor, getNotacionesCategoria, registerAdmin, registerNotacionAutor, registerNotacionCategoria, updateNotacionAutor, deleteNotacionAutor, updateNotacionCategoria, deleteNotacionCategoria } from "../controllers/configController.js";

const router = Router();

router.post('/regadmin', registerAdmin);
router.post('/regnotacionautor', registerNotacionAutor);
router.post('/regnotacioncategoria', registerNotacionCategoria);
router.get('/notacionesautor', getNotacionesAutor);
router.get('/notacionescategoria', getNotacionesCategoria);
router.delete('/config/notacionesautor/:id', deleteNotacionAutor);
router.put('/config/notacionesautor/:id', updateNotacionAutor);
router.delete('/config/notacionescategoria/:id', deleteNotacionCategoria);
router.put('/config/notacionescategoria/:id', updateNotacionCategoria);

export default router;