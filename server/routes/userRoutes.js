import { Router } from "express";
import { registerUser, getUser, getUserByDni, deleteUser, updateUser, searchUsers } from "../controllers/userController.js";

const router = Router();

router.get('/', getUser);

router.get('/search', searchUsers);

router.get('/:dni', getUserByDni);

router.post('/register', registerUser); //USADO

router.delete('/:dni', deleteUser);

router.put('/:dni', updateUser);

export default router;