import express from 'express';
import { connectDB } from './db/connectDB.js';
import dotenv from "dotenv";
import authRoutes from './routes/auth.js';
//import cors from 'cors';
dotenv.config();

const app = express()

const PORT = process.env.PORT || 5000;

app.use(express.json());


//app.use(cors());


app.use("/api/auth", authRoutes );

app.listen(5000, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
    console.log("Server started at http://localhost:" + PORT);
});