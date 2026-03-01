import Chat from '../models/chatsModel.js'
import User from '../models/userModel.js'
export const accessChat = async (req, res) => {
  try {
    const { userId, } = req.body;
    let isChat = await Chat.find({
      isGroupChat: false,
      users: { $all: [userId, req.user.id] }
    }).populate("users", "-password")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "fullname email profilePic"
        }
      });

    if (isChat.length > 0) {
      return res.status(200).json({
        chat: isChat[0],
        success: true
      })
    }
    else {
      const user = await User.findById(userId);
      let chat = new Chat({
        chatName: user.fullname,
        isGroupChat: false,
        users: [userId, req.user.id]
      })
      await chat.save();
      chat = await chat.populate("users", "-password");
      return res.status(201).json({
        chat,
        success: true
      })
    }

  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false
    })
  }
}

export const userChats = async (req, res) => {
  try {
    let chats = await Chat.find({
      users: { $in: [req.user.id] }
    })
      .populate("groupAdmin", "-password")
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
    return res.status(200).json({
      chats,
      success: true
    })

  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false
    })
  }
}

export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.body;
    const chat = await Chat.findByIdAndDelete(chatId, { new: true });
    if (!chat) {
      return res.status(404).json({
        message: "Chat not exist",
        success: false
      })
    }
    return res.status(200).json({
      message: 'Chat is deleted',
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false
    })
  }
}

export const createGroupChat = async (req, res) => {
  try {
    let { chatName, users } = req.body;
    if (!chatName || users.length == 0) {
      return res.status(400).json({
        message: "Please fill all the fields",
        success: false
      })
    }
    if (typeof users === "string") {
      users = JSON.parse(users);
    }

    users.push(req.user.id);
    if (users.length <= 2) {
      return res.status(400).json({
        message: "More than 2 users are required to create a group chat",
        success: false,
      })
    }
    const groupChat = await Chat.create({
      chatName,
      users,
      isGroupChat: true,
      groupAdmin: req.user.id
    })
    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate("groupAdmin", "-password")
      .populate("users", "-password")
    return res.status(201).json({
      groupChat: fullGroupChat,
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false
    })
  }
}

export const renameGroupChat = async (req, res) => {
  try {
    const { chatName, groupId } = req.body;
    const group = await Chat.findByIdAndUpdate(groupId, { chatName }, { new: true })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
    if (!group) {
      return res.status(404).json({
        message: "Group does not exist",
        success: false
      })
    }
    return res.status(200).json({

    })
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false
    })
  }
}

export const addToGroup = async (req, res) => {
  try {
    const { newUsers, groupId } = req.body;
    const group = await Chat.findByIdAndUpdate(groupId, {
      $push: { users: { $each: newUsers } }
    }, { new: true })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")

    if (!group) {
      return res.status(404).json({
        message: "Group not exist",
        success: false
      })
    }
    return res.status(200).json({
      group,
      success: true
    })
  }
  catch {
    return res.status(500).json({
      message: error.message,
      success: false
    })
  }
}

export const removeFromGroup = async (req, res) => {
  try {
    const { groupId, memberId } = req.body;
    const group = await Chat.findByIdAndUpdate(groupId, {
      $pull: { users: memberId }
    }, { new: true })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")

    if (!group) {
      return res.status(404).json({
        message: "Group not exist",
        success: false
      })
    }
    return res.status(200).json({
      group,
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false
    })
  }
}
