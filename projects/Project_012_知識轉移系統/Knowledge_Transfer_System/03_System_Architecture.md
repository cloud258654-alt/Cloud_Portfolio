# System Architecture

## Overview

The system connects user channels to an AI assistant layer, then uses retrieval, embeddings, vector search, and language models to generate grounded answers.

## Flow

1. User accesses the system from Web, Mobile, or LINE.
2. AI Assistant receives questions or tasks.
3. RAG Engine retrieves relevant knowledge.
4. Embedding Engine converts content into semantic vectors.
5. Vector Database stores and searches embeddings.
6. Large Language Model generates the final answer.
7. Audit and permission controls protect access.

## Core Storage

- PostgreSQL for relational data.
- pgvector for vector search.
- MinIO for object storage.

## Knowledge Types

- Documents
- FAQ
- Experience records
- SOP and process documents
- Multimedia knowledge
