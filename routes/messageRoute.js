import express from 'express' ;
import { getChatMessage, sendMessage } from '../controller/messageController.js';
import verifyJWT from '../middleware/authMiddleware.js';

const router = express.Router() ;

router.route("/").post(verifyJWT,sendMessage) ;
router.route("/:chatId").get(verifyJWT,getChatMessage) ;

export default router