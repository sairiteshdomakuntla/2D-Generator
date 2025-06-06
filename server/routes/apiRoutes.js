const express=require('express');
const router=express.Router();

const {generateCode}=require('../controllers/codeController');

router.post('/generate-code',generateCode);

module.exports=router;