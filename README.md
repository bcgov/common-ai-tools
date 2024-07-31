# A Documentation Q&A API (supported by a LLM)

An experimental 'Copilot' Proof-of-concept, leveraging Retrieval-Augmented Generation (RAG) architecture to enhance documentation support for users.
The copilot will assist in automating response to users, by combining the retrieval of relevant information with the generation of contextual insights

The '/app' directory contains a simple NodeJS app, and express server that supports a `create` (create vector embeddings from documents in a github repo) and `query` (question and answer) features.
