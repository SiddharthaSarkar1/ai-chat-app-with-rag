import dotenv from "dotenv";
import { ChatMistralAI } from "@langchain/mistralai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { Document } from "@langchain/core/documents";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

import data from "./dummyData/data.js"


dotenv.config();

const video1 = data[0]

const docs = [new Document({ pageContent: video1.transcript, metadata: { video_id: video1.video_id } })]

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
})

const chunks = await splitter.splitDocuments(docs)

const embeddings = new MistralAIEmbeddings({
    apiKey: process.env.MISTRAL_API_KEY,
    model: "mistral-embed",
});

const vectorstore = new MemoryVectorStore(embeddings)
   
await vectorstore.addDocuments(chunks)

// const llm = new ChatMistralAI({
//     apiKey: process.env.MISTRAL_API_KEY,
//     modelName: "mistral-small-2506"
// })

// const agent = createReactAgent({
//     llm,
//     tools: []
// })

// const results = await agent.invoke({
//     messages: [{role: "user", content: "What is Generative AI?"}]
// })

// console.log(results);

// console.log(results.messages.at(-1).content);



