// @ts-nocheck
import 'dotenv/config'
import type { NextFunction, Request, Response } from 'express';
// Langchain AI modules
// import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { StringOutputParser } from "@langchain/core/output_parsers";


const controller = {

  /**
   * index content in pdf's
   */
  upload: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loader = new PDFLoader(req.file.path);
      const docs = await loader.load();
      // add vectors to a database
      let splits;
      for (const doc of docs) {
        const textSplitter = new RecursiveCharacterTextSplitter({
          chunkSize: 500,
          chunkOverlap: 50
        });
        splits = await textSplitter.createDocuments([doc.pageContent]);
        console.dir(splits, { depth: null });
        // create vectors in chromadb database (running in separate container)
        const vectors = await Chroma.fromDocuments(
          splits,
          new OpenAIEmbeddings(),
          {
            // collectionName: req.body.repo,
            collectionName: req.query.formId,
            url: "http://localhost:8000", // Optional, will default to this value
          }
        );
        console.dir(vectors, { depth: null });
      }
      res.sendStatus(201, splits.length);
    } catch (e: unknown) {
      next(e);
    }
  },

  /**
   * query content from pdf's
   */
  question: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const model = new ChatOpenAI({});
      const vectorStore = await Chroma.fromExistingCollection(
        new OpenAIEmbeddings(),
        { collectionName: `${req.body.formId}` }
      );
      const retriever = vectorStore.asRetriever();
      const prompt =
        PromptTemplate.fromTemplate(`Answer the question based only on the following context:
      {context}
      Question: {question}`);
      const chain = RunnableSequence.from([
        {
          context: retriever.pipe(formatDocumentsAsString),
          question: new RunnablePassthrough(),
        },
        prompt,
        model,
        new StringOutputParser(),
      ]);
      const response = {
        formId: `${req.body.formId}`,
        answer: await chain.invoke(req.body.question)
      };
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  /**
   * index content in a github repo
   */
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = {
        repo: req.body.repo, // eg: "https://github.com/bcgov/common-object-management-service-docs"
        branch: req.body.branch ?? 'main', // eg: "main"
        ignore: (req.body.path && req.body.path.length) ? ['*', '/*', `!/${req.body.path}/`] : [], // eg: "docs"
        ignorePath: req.body.ignorePath ?? [], // eg: ".yaml"
        recursive: req.body.recursive ?? true  // eg: true
      }
      // https://js.langchain.com/v0.2/docs/integrations/document_loaders/web_loaders/github
      // https://v02.api.js.langchain.com/classes/langchain_community_document_loaders_web_github.GithubRepoLoader.html#ignorePaths
      const config = {
        branch: data.branch,
        recursive: data.recursive,
        ignore: data.ignore,
        ignorePaths: data.ignorePaths,
        unknown: "warn",
        maxConcurrency: 5, // Defaults to 2
      };
      const loader = new GithubRepoLoader(
        data.repo, config
      );
      const docs = await loader.load();
      // reformat
      const documents = docs.map(d => {
        return {
          file: d.metadata.source,
          pageContent: d.pageContent
        };
      });
      // let response = '';
      let response: unknown = {
        repo: req.body.repo,
        branch: req.body.branch,
        path: req.body.path,
        ignorePaths: req.body.ignorePaths,
        fileCount: documents.length,
        files: documents.map(d => d.file),
        vectorStore: `${req.body.repo}/${req.body.path}`,
        vectorCount: 0
      };
      // add vectors to a database
      for (const doc of documents) {
        const textSplitter = new RecursiveCharacterTextSplitter({
          chunkSize: 500,
          chunkOverlap: 50
        });
        const splits = await textSplitter.createDocuments([doc.pageContent]);
        console.log(`splits ${splits.length}`);
        // create vectors in chromadb database (running in separate container)
        await Chroma.fromDocuments(
          splits,
          new OpenAIEmbeddings(),
          {
            // collectionName: req.body.repo,
            collectionName: `${/[^/]*$/.exec(req.body.repo)[0]}`,
            url: "http://localhost:8000", // Optional, will default to this value
          }
        );
        response.vectorCount = response.vectorCount + splits.length;
      }
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  },

  /**
   * query content in a github repo
   */
  query: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const model = new ChatOpenAI({});
      const vectorStore = await Chroma.fromExistingCollection(
        new OpenAIEmbeddings(),
        { collectionName: `${/[^/]*$/.exec(req.body.repo)[0]}` }
      );
      const retriever = vectorStore.asRetriever();
      const prompt =
        PromptTemplate.fromTemplate(`Answer the question based only on the following context:
      {context}
  
      Question: {question}`);

      const chain = RunnableSequence.from([
        {
          context: retriever.pipe(formatDocumentsAsString),
          question: new RunnablePassthrough(),
        },
        prompt,
        model,
        new StringOutputParser(),
      ]);
      const result = {
        repo: req.body.repo,
        branch: req.body.branch,
        path: req.body.path,
        answer: await chain.invoke(req.body.question)
      };
      const response: Object = result;
      res.status(200).send(response);
    } catch (e: unknown) {
      next(e);
    }
  }

};

export default controller;
