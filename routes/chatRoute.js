import express from 'express'
import verifyJWT from '../middleware/authMiddleware.js';
import { accessChat, addToGroup, createGroupChat, deleteChat, removeFromGroup, renameGroupChat, userChats } from '../controller/chatController.js';

const router = express.Router() ;

router.route("/").post(verifyJWT,accessChat).get(verifyJWT,userChats).delete(verifyJWT,deleteChat) ;
router.route("/group").post(verifyJWT,createGroupChat)
router.route("/group/rename").put(verifyJWT,renameGroupChat)
router.route("/group/add").put(verifyJWT,addToGroup)
router.route("/group/remove").put(verifyJWT , removeFromGroup) 


export default router 