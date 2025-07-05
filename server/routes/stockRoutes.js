import { Router } from "express";
import { registerBook, getBook, getStock, deleteStock, filterStock, updateStock, getBookById, getCategory, getGroupedBooks } from "../controllers/stockController.js";

const router = Router();

router.post('/', registerBook);

router.get('/book', getBook);

router.get('/book/:codigo_libro', getBookById);

router.get('/inventory', getStock);

router.put('/inventory/:id', deleteStock);

router.get('/search', filterStock);

router.get('/grouped', getGroupedBooks) //USADO

router.put('/:id_inventario', updateStock);

router.get('/category', getCategory);

export default router;