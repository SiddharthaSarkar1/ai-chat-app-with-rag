# Full Stack RAG with React, Node.js, and LangChain

This project is a full-stack Retrieval-Augmented Generation (RAG) application that allows you to chat with your documents. It features a React frontend and a Node.js backend, leveraging the power of LangChain.js and Mistral AI.

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

---

## Getting Started

### Prerequisites

*   Node.js and npm installed.
*   A Mistral AI API Key.
*   A PostgreSQL database.