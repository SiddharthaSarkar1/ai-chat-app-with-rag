# DOCUCHAT RAG Explorer

Leverage the power of Retrieval-Augmented Generation to explore any PDF document. RAG Explorer helps you navigate dense reports, textbooks, and articles with simple questions.

This project is a full-stack RAG application featuring a React frontend and a Node.js backend, leveraging the power of LangChain.js and Mistral AI to allow you to chat with your documents.

## Features

*   **Document Upload:** Upload PDF documents directly through the web interface.
*   **RAG Pipeline:** Uses LangChain.js to process documents, generate embeddings, and orchestrate the question-answering flow.
*   **AI Models:** Powered by Mistral AI for both embeddings and language generation.
*   **Vector Storage:** Utilizes a PostgreSQL database with the `pgvector` extension for efficient semantic search.
*   **Streaming API:** The backend is set up to handle and stream responses for a real-time chat experience.

## Tech Stack

*   **Frontend:** React
*   **Backend:** Node.js, Express.js
*   **AI:** LangChain.js, Mistral AI
*   **Database:** PostgreSQL 
*   **Embeddings:** Mistral AI Embeddings
