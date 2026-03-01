import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import getDataUri from '../middleware/dataUri.js';
import cloudinary from '../middleware/cloudinary.js';

export const signup = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    if (!fullname || !email || !password) {
      res.status(400).json({
        message: "Please enter all fields",
        success: false
      })
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({
        message: "User exist",
        success: false
      })
    }
    const hashedPassword = await bcrypt.hash(password, 13);
    const file = req.file;
    let cloudResponse;
    if (file) {
      const fileUri = getDataUri(file);
      cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
        folder: 'ChatApp'
      });
    }
    const user = new User({
      fullname,
      email,
      password: hashedPassword
    })
    if (cloudResponse) {
      user.profilePic = cloudResponse.secure_url
    }
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });
    return res.status(200)
      .cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' })
      .json({
        message: "You are now registered",
        user,
        success: true
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400)
        .json({
          message: "Please Enter all fields",
          success: false,
        });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400)
        .json({
          message: "Incorrect Email",
          success: false
        })
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400)
        .json({
          message: "Password is Incorrect",
          success: false
        })
    }
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });
    return res.status(200)
      .cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' })
      .json({
        message: "You are logged In",
        user,
        success: true
      });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const logout = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "You are Logged Out",
      success: true
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const getAllUser = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
        $or: [
          { fullname: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
        _id: { $ne: req.user._id },
      }
      : {};
    const users = await User.find(keyword);
    return res.status(200).json({
      users,
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}