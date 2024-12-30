import { ScannedBill } from "~/types";

const FORM_RECOGNIZER_URL = import.meta.env.VITE_AZURE_FORM_RECOGNIZER_URL as string;
const FORM_RECOGNIZER_API_KEY = import.meta.env.VITE_AZURE_FORM_RECOGNIZER_API_KEY as string;

export async function extractor(image: File) {
  const queueTicket = await queueParseImage(image);
  if (!queueTicket.ok) throw new Error(`Upstream failed. Received error: ${queueTicket.statusText}`);

  const locationUri = queueTicket.headers.get("Operation-Location");
  if (null === locationUri) throw new Error("Upstream failed. Missing 'Operation-Location' header.");

  let loopCount = 0;
  while(loopCount < 10) {
    await sleep(500);

    const scanOutcome = await pollScanOutcome(locationUri);
    const scanOutcomeContent = (await scanOutcome.json()) as AnalyzeResponseType;

    if (scanOutcomeContent.status === "succeeded") {
      return parseAzureResponse(scanOutcomeContent);
    }

    loopCount += 1;
  }

  throw new Error("Upstream failed. Timeout exceeded.");
}

function queueParseImage(file: File) {
  return fetch(FORM_RECOGNIZER_URL, {
    duplex: "half",
    method: "POST",
    headers: {
      "Content-Type": file.type,
      "Ocp-Apim-Subscription-Key": FORM_RECOGNIZER_API_KEY,
    },
    body: file.stream(),
  });
}

function pollScanOutcome(location: string) {
  return fetch(location, {
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": FORM_RECOGNIZER_API_KEY
    },
  });
}

function parseAzureResponse(response: AnalyzeResponseType): ScannedBill {
  if (!response.analyzeResult?.documents[0]) {
    throw new Response("Upstream failed. No analyzed document returned", { status: 502 });
  }

  const document = response.analyzeResult.documents[0];

  return {
    date: (document.fields.TransactionDate?.valueDate as string | undefined) ?? null,
    name: (document.fields.MerchantName?.valueString as string | undefined) ?? null,
    currency:
      // @ts-expect-error no exhaustive types for document
      (document.fields.TaxDetails?.valueArray?.[0]?.valueObject?.Amount.valueCurrency.currencyCode as
        | string
        | undefined) ?? null,
    line_items:
      // @ts-expect-error no exhaustive types for document
      document.fields.Items.valueArray?.map(element => ({
        description: element.valueObject.Description?.valueString ?? "Unknown",
        amount: element.valueObject.Quantity?.valueNumber ?? 1,
        total_price: element.valueObject.TotalPrice?.valueNumber ?? 0.0,
      })) ?? [],
  };
}

function sleep(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), ms);
  });
}


interface AnalyzeResponseType {
  status: string;
  analyzeResult?: {
    documents: Array<{
      docType: string;
      fields: Record<string, Record<string, string | object | Array<unknown>>>;
    }>;
  };
}
