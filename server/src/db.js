import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI

let client
let db

/** Connects to MongoDB and ensures the indexes the routes rely on exist. Call once at startup. */
export async function connect() {
  if (!uri) {
    throw new Error('MONGODB_URI is not set — see server/README.md for how to get a free connection string.')
  }
  client = new MongoClient(uri)
  await client.connect()
  db = client.db()

  await db.collection('users').createIndex({ email: 1 }, { unique: true })
  await db.collection('users').createIndex({ id: 1 }, { unique: true })
  for (const name of ['expenses', 'trips', 'debts']) {
    await db.collection(name).createIndex({ id: 1 }, { unique: true })
    await db.collection(name).createIndex({ userId: 1 })
  }
  await db.collection('settings').createIndex({ userId: 1 }, { unique: true })
}

/** Returns the collections routes read/write. Only valid after connect() resolves. */
export function collections() {
  return {
    users: db.collection('users'),
    expenses: db.collection('expenses'),
    trips: db.collection('trips'),
    debts: db.collection('debts'),
    settings: db.collection('settings'),
  }
}

/** Drops Mongo's internal _id and the ownership field before a document goes out over the API. */
export function stripInternal(doc) {
  if (!doc) return doc
  const { _id, userId: _userId, ...rest } = doc
  return rest
}
