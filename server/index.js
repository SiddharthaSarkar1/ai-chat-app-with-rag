import express from "express";
import cors from "cors";
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { createAgent, invokeAgent } from './agent.js';
import dotenv from "dotenv";

dotenv.config();

let chat_history = [];

const PORT = process.env.PORT || 3000;

const app = express();

// Configure multer for file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json({ limit: '200mb' }));

// Permissive CORS for development
app.use(cors());

app.get("/api/", (req, res) => {
    res.send("Hello World!");
});

// New endpoint for handling PDF uploads
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        console.log("Processing PDF...");
        // SOLUTION: Convert the Buffer from multer into a Uint8Array.
        const uint8Array = new Uint8Array(req.file.buffer);
        // Now, pass the Uint8Array to the constructor. This will work.
        const parser = new PDFParse(uint8Array);
        const pdfData = await parser.getText();
        console.log("PDF text extracted, creating agent...");
        await createAgent(pdfData.text); // Create the RAG agent
        // I've also kept your original response message and added a history reset
        chat_history = [];
        res.status(200).json({ message: 'PDF processed and RAG agent is ready.' });

    } catch (error) {
        console.error("Error processing PDF:", error);
        res.status(500).send('Error processing PDF.');
    }
});

// Updated endpoint for generation
app.post("/generate", async (req, res) => {
    const { query, chat_history = [] } = req.body;

    if (!query) {
        return res.status(400).send("Query is required.");
    }

    try {
        const result = await invokeAgent(query, chat_history);
        res.send(result);
    } catch (error) {
        console.error("Error during generation:", error);
        res.status(500).send(error.message);
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port http://localhost:${PORT}`);
});
