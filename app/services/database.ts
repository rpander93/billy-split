import { MongoClient, type Db, type Collection, type Document } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI as string;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE as string;

let _client: MongoClient | undefined;
let _handle: Db | undefined;

export async function database(): Promise<Db> {
  if (_client === undefined) {
    _client = new MongoClient(MONGODB_URI);
    await _client.connect();
  }

  // biome-ignore lint: blabla
  return (_handle = _handle ?? _client.db(MONGODB_DATABASE));
}

export async function collection<T extends Document>(
  name: string,
): Promise<Collection<T>> {
  const connection = await database();

  return connection.collection<T>(name);
}
