import express from 'express';
import { connectDB } from './db/connectDB.js';
import dotenv from "dotenv";
import authRoutes from './routes/auth.js';
import cookieParser from 'cookie-parser';
//import cors from 'cors';
dotenv.config();

const app = express()

const PORT = process.env.PORT || 5000;

app.use(express.json()); // allows us to parse incoming requests:req.body

app.use(cookieParser()); // allows us to parse incoming cookies:req.cookie.cookieName

//app.use(cors());

app.use("/api/auth", authRoutes );

app.listen(5000, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
    console.log("Server started at http://localhost:" + PORT);
});