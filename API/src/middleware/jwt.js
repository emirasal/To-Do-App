import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";

export const verifyToken = (req, res, next) => {

    const token = req.cookies.accessToken;


    if(!token) next(createError(401, "Not authenticated"));

    jwt.verify(token, process.env.JWT_KEY, async (err,payload) => {
        if (err) {
            next(403, "Token is not valid.");
        } 
        else {
            req.userId = payload.id;

            next();
        }
    });

}
