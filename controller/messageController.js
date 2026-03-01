import Chat from "../models/chatsModel.js";
import Message from "../models/messageModels.js";
import User from "../models/userModel.js";

export const sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;
    if (!content || !chatId) {
      return res.status(404).json({
        message: "Cannot send Message due to empty fields",
        success: false,
      })
    }
    let newMessage = await Message.create({
      sender: req.user.id,
      content,
      chat: chatId,
    })
    newMessage = await newMessage.populate("sender", "fullname profilePic");
    newMessage = await newMessage.populate("chat")
    newMessage = await User.populate(newMessage, {
      path: "chat.users",
      select: "fullname profilePic email"
    })

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: newMessage._id
    })

    return res.status(201).json({
      message: newMessage,
      success: true
    })

  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false
    })
  }
}

export const getChatMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    if (!chatId) {
      return res.status(404).json({
        message: "Please provide chat id",
        success: false
      })
    }
    let messages = await Message.find({
      chat : chatId
    })
      .populate("sender", "fullname profilePic")
      .populate("chat")

    return res.status(200).json({
      messages ,
      success : true 
    })

  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false
    })
  }
}