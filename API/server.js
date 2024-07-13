import express from 'express';
import mongoose from 'mongoose';
import dotenv from "dotenv";


import TodoRoute from "./src/routes/todo.js";
import AuthRoute from "./src/routes/auth.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
dotenv.config();

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO);
        console.log("Connected to Database.")
    } catch (error) {
        console.log("Database Connection Error!");
    }
};

// Middleware
app.use(cors({origin:"http://localhost:3000", credentials:true}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", AuthRoute);
app.use("/api/todo", TodoRoute);


app.use((err, req, res, next) =>{
    const errorStatus = err.status || 500;
    const errorMessage = err.message || "Error";

    return res.status(errorStatus).send(errorMessage);
});

app.listen(8000, () => {
    connect();
    console.log("Server is running!");
});