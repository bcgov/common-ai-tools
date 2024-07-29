// @ts-nocheck
import 'dotenv/config'
import type { NextFunction, Request, Response } from 'express';

// Langchain AI modules
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
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
   * Create Vector embeddings based on a document source (RAG)
   * @param _req 
   * @param res 
   * @param next 
   */
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // --------- get documents from GitHub repo source, using Github API
      // ref: https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28#get-repository-content
      const { Octokit: Octokit } = await import('octokit');
      // authenticate - use a personal token, authorized for bcgov org
      const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
      });
      // get list of wiki pages
      const repoFiles: unknown = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: req.body.owner,
        repo: req.body.repo,
        path: req.body.path,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });
      const urlArray = repoFiles.data
        .filter((file) => file.type === 'file')
        .map((file) => file.download_url);

        let response: unknown = {
          owner: req.body.owner,
          repo: req.body.repo,
          path: req.body.path,
          urlCount: urlArray.length,
          urls: []
        };
        
      // add vectors to a database
      for (const url of urlArray) {
        // get document
        const loader = new CheerioWebBaseLoader(url);
        const document = await loader.load();

        const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
          chunkSize: 500,
          chunkOverlap: 50
        });
        const splits = await splitter.splitDocuments([document]);
        console.log(`splits ${splits}`);
        
        // create vectors in chromadb database (running in separate container)
        const vectorStore = await Chroma.fromDocuments(
          splits,
          new OpenAIEmbeddings(),
          {
            collectionName: req.body.repo,
            url: "http://localhost:8000", // Optional, will default to this value
          }
        );
        console.log(`vectorStore ${vectorStore}`);
        response.urls.push(url)
      }
      
      res.status(200).send(response);
      
    } catch (e: unknown) {
      next(e);
    }
  },

  query: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const model = new ChatOpenAI({});
      const vectorStore = await Chroma.fromExistingCollection(
        new OpenAIEmbeddings(),
        { collectionName: req.body.repo }
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
  
      console.log(req.body.question);

      const result = {
        owner: req.body.owner,
        repo: req.body.repo,
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
