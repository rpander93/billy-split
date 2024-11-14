import { BlobClient, BlobSASPermissions, BlobServiceClient } from "@azure/storage-blob";

const CONNECTION_STRING = process.env.AZURE_BLOB_CONNECTION_STRING as string;
const BLOB_CONTAINER = process.env.AZURE_BLOB_CONTAINER as string;

const blobServiceClient = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(BLOB_CONTAINER);

export async function link(name: string) {
  const blobClient = containerClient.getBlobClient(name);
  const sasToken = await generateSasToken(blobClient);

  return sasToken;
}

export async function upload(file: File, name: string) {
  await containerClient
    .getBlockBlobClient(name)
    .uploadData(await file.arrayBuffer());
}

function generateSasToken(blobClient: BlobClient) {
  const startDate = new Date();
  const expiryDate = new Date(startDate);
  expiryDate.setMinutes(startDate.getMinutes() + 15);

  return blobClient.generateSasUrl({
    permissions: BlobSASPermissions.from({
      read: true,
      write: false,
      delete: false,
    }),
    expiresOn: expiryDate,
  });
}
