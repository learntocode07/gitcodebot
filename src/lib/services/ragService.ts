import { AIMessage, SystemMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import {
  RunnableMap,
  RunnablePassthrough,
  RunnableSequence,
  RunnableWithMessageHistory,
} from "@langchain/core/runnables";

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { MessagesPlaceholder } from "@langchain/core/prompts";
import { MongoChatHistory } from "./chatService";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantVectorStore } from "@langchain/qdrant";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ToolMessage } from "@langchain/core/messages";
import { formatDocumentsAsString } from "langchain/util/document";
import { pull } from "langchain/hub";

export let ragChainWithSource: any = null;

export const SYSTEM_PROMPT = `
You are an AI assistant that helps users with questions about a specific GitHub Repository.
You are provided with the repository URL and contents that are relevant to the user's questions.
You can answer questions about the repository, its files, and its structure and related concepts.
If you do not know the answer, you should say "I don't know" instead of making up an answer.
`;

export async function initChatChain(repo_name: string, repo_owner: string, save_money: boolean = false) {
  const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_CLUSTER_URL,
    apiKey: process.env.QDRANT_API_TOKEN,
  });

  const embeddings = new OpenAIEmbeddings({
    modelName: "text-embedding-3-large",
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      client: qdrantClient,
      url: process.env.QDRANT_CLUSTER_URL,
      collectionName: `${repo_owner}.${repo_name}`,
      contentPayloadKey: "page_content",
      metadataPayloadKey: "metadata",
    }
  );

  const retriever = vectorStore.asRetriever({
    k: parseInt(process.env.QDRANT_RETRIEVAL_K || "10"),
  });

  const llm = new ChatOpenAI({
    modelName: process.env.OPENAI_MODEL_NAME || "gpt-4",
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0"),
    streaming: true,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    new SystemMessage(SYSTEM_PROMPT),
    HumanMessagePromptTemplate.fromTemplate(
      "{input}\n\nContext from the repository:\n{context}\n\nPlease answer the question based on the context."
    ),
  ]);

  console.log(`Using Qdrant collection: ${repo_owner}.${repo_name}`);

  /** RAG Workflow
   *  User input (e.g., { input: "What's a vector DB?" })
   *     ↓
   *   RunnableWithMessageHistory
   *       ↳ injects .history
   *     ↓
   *   inputProcessor (adds context via retriever)
   *     ↓
   *   .assign() adds .history explicitly
   *     ↓
   *   coreChainWithDocs (prompt → LLM → output parser)
   *     ↓
   *   ragChainWithSource (RunnableWithMessageHistory)
   *     ↳ gets message history from MongoChatHistory
   *     ↳ manages input and history messages
   */

  const inputProcessor = RunnableMap.from({
    input: (input: string) => input,
    context: async (i: any) => {
      const docs = await retriever.invoke(i.input);
      console.log("i.input:", i.input);
      console.log(docs);
      return formatDocumentsAsString(docs);
    },
  });

  console.log("Input processor initialized with retriever context");

  const coreChain = RunnableSequence.from([
    prompt,
    llm,
    new StringOutputParser(),
  ]);

  const coreChainWithDocs = inputProcessor
    .assign({
      chat_history: (i: any) => i.chat_history,
      input: (i: any) => i.input,
      context: (i: any) => i.context,
    })
    .pipe(coreChain);

  ragChainWithSource = new RunnableWithMessageHistory({
    runnable: coreChainWithDocs,
    getMessageHistory: (session_id: string) => new MongoChatHistory(session_id),
    inputMessagesKey: "input",
    historyMessagesKey: "chat_history",
  });
}
