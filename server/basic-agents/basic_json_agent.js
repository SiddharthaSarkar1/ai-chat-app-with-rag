import dotenv from "dotenv";
import { ChatMistralAI } from "@langchain/mistralai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { Document } from "@langchain/core/documents";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { tool } from '@langchain/core/tools';

import data from "../dummyData/data.js"
import z from "zod";
import { MemorySaver } from '@langchain/langgraph';


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

// const retrieveDocs = await vectorstore.similaritySearch(
//     "What was the finish time of Norris?",
//     1
// )

// console.log(retrieveDocs);

//retrieval tools
const retrievalTools = tool(
    async ({ query }) => {
        console.log("Retrieving documents for query===================");
        
        const docs = await vectorstore.similaritySearch(query, 3)
        const serializedDocs = docs.map((doc) => doc.pageContent).join('\n')
        return serializedDocs
    },
    {
        name: 'retrieve',
        description: 'Retrieve the most relevent chunk of text from the transcript of a youtube video',
        schema: z.object({
            query: z.string(),
        })
    }
)

const llm = new ChatMistralAI({
    apiKey: process.env.MISTRAL_API_KEY,
    modelName: "mistral-small-2506"
})

// const memorySaver = new MemorySaver()

const agent = createReactAgent({
    llm,
    tools: [retrievalTools]
})

const results = await agent.invoke({
    messages: [{ role: "user", content: "What was Norris's grid position?" }]
}
)

console.log(results);

console.log(results.messages.at(-1).content);