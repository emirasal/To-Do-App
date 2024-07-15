import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
    try {
      const { email, password } = req.body;
  
      if (email === '') return res.status(404).send("Please enter an email!");
      if (password === '') return res.status(404).send("Please enter a password!");

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(404).json({ message: "User exists" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 7);
      const newUser = new User({
        email: email,
        password: hashedPassword,
      });
  
      await newUser.save();
      res.status(201).send(req.body.email);
    } catch (err) {
      next(err);
    }
  };

export const login = async (req, res, next) => {
    try {
        const { email, password} = req.body;

        const user = await User.findOne({ email });

        if (password === '') return res.status(404).send("Please enter a password!");
        if (!user) return res.status(404).send("No such user!");

        const isCorrect = bcrypt.compareSync(password, user.password);

        if (!isCorrect) {
            return res.status(401).send("Wrong credentials.");
        }

        const token = jwt.sign({
            id: user._id,
        }, process.env.JWT_KEY);

        res.cookie("accessToken", token, {
            httpOnly: false,
        });
        

        res.status(200).send("Successful Login!");
    } catch (err) {
        next(err); 
    }
};


export const logout = async (req, res) =>{
    try {
        res.clearCookie("accessToken", {
            sameSite:"none",
        }).status(200).send("User is logged out.");
    } catch(err) {
        next(err);
    }
}