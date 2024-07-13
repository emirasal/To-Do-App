import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) =>{
    
    try {

        const { email, password } = req.body;

        const hashhedPassword = await bcrypt.hash(password, 7);
        const newUser = new User({
            email: email,
            password: hashhedPassword,
        });

        await newUser.save();
        res.status(201).send(req.body.email);

    } catch(err) {
        next(err);
    }
} 

export const login = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).send("No such user");
        }

        const isCorrect = bcrypt.compareSync(req.body.password, user.password);

        if (!isCorrect) {
            return res.status(401).send("Wrong credentials.");
        }

        const token = jwt.sign({
            id: user._id,
        }, process.env.JWT_KEY);

        
        console.log(token);
        res.cookie("accessToken", token, {
            httpOnly: true
        }).status(200).send(req.body.email);

    } catch (err) {
        next(err); 
    }
};

export const logout = async (req, res) =>{
    try {
        res.clearCookie("accessToken", {
            sameSite:"none",
            secure: true,
        }).status(200).send("User is logged out.");
    } catch(err) {
        next(err);
    }
}