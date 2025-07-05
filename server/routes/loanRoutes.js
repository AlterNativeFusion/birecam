import { Router } from "express";
import { cancelUserLoanRequest, getLoansPendientes, getUserLoanHistory, requestLoan, returnLoan, updateLoanEstado, getLoanHistorial, getLoanReport, getLoansPendientesPorUsuario } from "../controllers/loanController.js";

const router = Router();

router.post('/request', requestLoan); // USADO

router.post('/return', returnLoan);

router.post('/update', updateLoanEstado); // USADO

router.get('/', getLoansPendientes);

router.get('/history/:dni', getUserLoanHistory); // USADO

router.delete('/cancel/:id_prestamo', cancelUserLoanRequest);

router.get('/history', getLoanHistorial);

router.get('/loanreport', getLoanReport); //USADO

router.get('/pendiente/:dni/', getLoansPendientesPorUsuario); //USADO

export default router;