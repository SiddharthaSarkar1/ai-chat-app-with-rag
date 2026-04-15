import express from "express"
import cors from "cors";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json({ limit: '200mb' }));
app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello World!")
})

app.post("/generate", async (req, res) => {
    const { query, thread_id } = req.body;
    console.log(query, thread_id);

    const results = await agent.invoke(
        {
            messages: [
                {
                    role: 'user',
                    content: query,
                },
            ],
        },
        { configurable: { thread_id } }
    );

    res.send(results.messages.at(-1)?.content);

})

app.listen(3000, () => {
    console.log(`Server listening on port http://localhost:${PORT}`);
})
