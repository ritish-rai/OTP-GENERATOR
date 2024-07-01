const express=require("express");
const router=new express.Router();
const controllers=require('../Controllers/userController'); 
router.post('/user/register',controllers.userregister);
router.post('/user/sendotp',controllers.userOtpSend);
router.post('/user/login',controllers.userLogin);
module.exports=router;