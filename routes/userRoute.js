import express from 'express'
import { getAllUser, login, logout, signup } from '../controller/userController.js';
import { singleUpload } from '../middleware/multer.js';
import verifyJWT from '../middleware/authMiddleware.js';

const router = express.Router() ;

router.route("/signup").post(singleUpload,signup)
router.route("/login").post( login ) ;
router.route("/logout").post(verifyJWT ,logout) ;
router.route("/").get(verifyJWT,getAllUser);

export default router ;