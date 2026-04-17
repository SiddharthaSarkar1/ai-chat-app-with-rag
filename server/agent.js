import { ChatMistralAI } from "@langchain/mistralai";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
    RunnablePassthrough,
    RunnableSequence,
} from "@langchain/core/runnables";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import dotenv from "dotenv";

dotenv.config();

const llm = new ChatMistralAI({
    apiKey: process.env.MISTRAL_API_KEY,
    model: "mistral-small-latest",
    temperature: 0,
});

const embeddings = new MistralAIEmbeddings({
    apiKey: process.env.MISTRAL_API_KEY,
    model: "mistral-embed",
});

let retriever;

// This helper function replaces the broken import
const formatDocs = (docs) => {
    return docs.map((doc) => doc.pageContent).join("\n\n");
};

export const createAgent = async (text) => {
    console.log("Splitting text...");
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    const docs = await textSplitter.createDocuments([text]);

    console.log("Creating and populating vector store...");

    const vectorStore = await PGVectorStore.fromDocuments(docs, embeddings, {
        postgresConnectionOptions: {
            connectionString: process.env.DATABASE_URL,
        },
        tableName: 'transcripts',
        // --- THIS IS THE FIX ---
        // Explicitly tell PGVectorStore what to name the content column.
        // This ensures the column is created with this name AND the insert uses this name.
        contentColumnName: 'content', 
        // -----------------------
        ensureTableInDatabase: true, 
    });

    console.log("Vector store created and populated successfully.");

    retriever = vectorStore.asRetriever();
    console.log("Retriever created successfully.");
};

const contextualizeQSystemPrompt = `Given a chat history and the latest user question
which might reference context in the chat history, formulate a standalone question
which can be understood without the chat history. Do NOT answer the question,
just reformulate it if needed and otherwise return it as is.`;

const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
    ["system", contextualizeQSystemPrompt],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
]);

const qaSystemPrompt = `You are an assistant for question-answering tasks.
Use the following pieces of retrieved context to answer the question.
If you don't know the answer, just say that you don't know.
Use three sentences maximum and keep the answer concise.

{context}`;

const qaPrompt = ChatPromptTemplate.fromMessages([
    ["system", qaSystemPrompt],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
]);

export const invokeAgent = async (input, chat_history) => {
    if (!retriever) {
        throw new Error("Retriever not initialized. Please upload a PDF first.");
    }

    const contextualizeQChain = RunnableSequence.from([
        {
            input: (input) => input.input,
            chat_history: (input) => input.chat_history,
        },
        contextualizeQPrompt,
        llm,
        new StringOutputParser(),
    ]);

    const ragChain = RunnableSequence.from([
        RunnablePassthrough.assign({
            context: (input) =>
                contextualizeQChain.pipe(retriever).pipe(formatDocs).invoke(input),
        }),
        qaPrompt,
        llm,
        new StringOutputParser(),
    ]);

    return ragChain.invoke({
        input: input,
        chat_history: chat_history,
    });
};
