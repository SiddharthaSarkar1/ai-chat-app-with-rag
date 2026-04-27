import { MistralAIEmbeddings } from "@langchain/mistralai";
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import dotenv from "dotenv";

dotenv.config()

const embeddings = new MistralAIEmbeddings({
    apiKey: process.env.MISTRAL_API_KEY,
    model: "mistral-embed",
});

export const vectorStore = await PGVectorStore.initialize(embeddings, {
    postgresConnectionOptions: {
      connectionString: process.env.DATABASE_URL,
    },
    tableName: 'transcripts',
    columns: {
      idColumnName: 'id',
      vectorColumnName: 'vector',
      contentColumnName: 'content',
      metadataColumnName: 'metadata',
    },
    distanceStrategy: 'cosine',
  });

