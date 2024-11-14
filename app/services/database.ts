import { CosmosClient } from "@azure/cosmos";

const COSMOS_ENDPOINT = process.env.AZURE_COSMOS_ENDPOINT as string;
const COSMOS_KEY = process.env.AZURE_COSMOS_KEY as string;
const COSMOS_DATABASE = process.env.AZURE_COSMOS_DATABASE as string;

export const client = new CosmosClient({ endpoint: COSMOS_ENDPOINT, key: COSMOS_KEY });
export const database = client.database(COSMOS_DATABASE);
