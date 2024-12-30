import { CosmosClient } from "@azure/cosmos";

const COSMOS_ENDPOINT = process.env.VITE_AZURE_COSMOS_ENDPOINT as string;
const COSMOS_KEY = process.env.VITE_AZURE_COSMOS_KEY as string;
const COSMOS_DATABASE = process.env.VITE_AZURE_COSMOS_DATABASE as string;

export const client = new CosmosClient({ endpoint: COSMOS_ENDPOINT, key: COSMOS_KEY });
export const database = client.database(COSMOS_DATABASE);
