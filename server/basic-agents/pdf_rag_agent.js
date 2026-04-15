
import dotenv from "dotenv";
import { ChatMistralAI } from "@langchain/mistralai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { tool } from '@langchain/core/tools';
import z from "zod";
import { PDFParse } from 'pdf-parse';

dotenv.config();

async function run() {
    // Load the PDF and extract text
    const parser = new PDFParse({ url: '../dummyData/GRU.pdf' });
    const pdfData = await parser.getText();
    const pdfText = pdfData.text;

    const docs = [new Document({ pageContent: pdfText, metadata: { file: 'GRU.pdf' } })];

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200
    });

    const chunks = await splitter.splitDocuments(docs);

    const embeddings = new MistralAIEmbeddings({
        apiKey: process.env.MISTRAL_API_KEY,
        model: "mistral-embed",
    });

    const vectorstore = new MemoryVectorStore(embeddings);

    await vectorstore.addDocuments(chunks);

    const retrievalTools = tool(
        async ({query}) => {
            const docs = await vectorstore.similaritySearch(query, 1);
            const serializedDocs = docs.map((doc) => doc.pageContent).join('\n')
            return serializedDocs
        },
        {
            name: 'retrieve',
            description: 'Retrieve the most relevant chunk of text from the PDF document.',
            schema: z.object({
                query: z.string(),
            })
        }
    );

    const llm = new ChatMistralAI({
        apiKey: process.env.MISTRAL_API_KEY,
        modelName: "mistral-small-2506"
    });

    const agent = createReactAgent({
        llm,
        tools: [retrievalTools]
    });

    const results = await agent.invoke({
        messages: [{ role: "user", content: "What is the document is all about??" }]
    });

    console.log(results);
    console.log(results.messages.at(-1).content);
}

run();
