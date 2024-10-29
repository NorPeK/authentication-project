import express from 'express';
import { connectDB } from './db/connectDB.js';
import dotenv from "dotenv";
import authRoutes from './routes/auth.js';
dotenv.config();

const app = express()

const PORT = process.env.PORT;

app.get("/" , (req, res) => {
    res.send("hellodedsasad");
})

app.use("/api/auth", authRoutes );

app.listen(3000, () => {
    connectDB();
    console.log("Server is running on port 3000");
    console.log("Server started at http://localhost:" + PORT);
});