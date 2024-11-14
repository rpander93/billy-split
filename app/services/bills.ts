import { OnlineScannedBill, ScannedBill } from "~/types";
import { database } from "./database";
import { upload } from "./files";

const CONTAINER_SCANS = process.env.AZURE_COSMOS_CONTAINER_SCANS as string;

export async function addScannedBill(element: ScannedBill, file: File): Promise<OnlineScannedBill> {
  const shareCode = createShareCode(16);
  const fileExtension = file.name.substring(file.name.lastIndexOf("."));
  const fileName = shareCode + fileExtension;

  const retVal: OnlineScannedBill = {
    id: shareCode,
    file_name: shareCode + fileExtension,
    created_on: Date.now() / 1000,
    share_code: shareCode,
    ...element,
  };

  await Promise.all([
    upload(file, fileName),
    database.container(CONTAINER_SCANS).items.upsert<OnlineScannedBill>(retVal)
  ]);

  return retVal;
}

export async function findScannedBill(elementId: string): Promise<OnlineScannedBill | null> {
  const { resource } = await database.container(CONTAINER_SCANS)
    .item(elementId, elementId)
    .read<OnlineScannedBill>();

  return resource ?? null;
}

function createShareCode(length: number): string {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }

  return result;
}
