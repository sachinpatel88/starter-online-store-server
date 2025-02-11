import { JSONFilePreset } from "lowdb/node"
import { v4 as uuidv4 } from "uuid"

const defaultData = {
  bookingIntents: [],
  products: [],
}
const db = await JSONFilePreset("db.json", defaultData)

const addBookingIntent = async (clientSecret) => {
  // Alternatively you can call db.write() explicitely later
  // to write to db.json
  const intentId = uuidv4()
  db.data.bookingIntents.push({ id: intentId, clientSecret })
  await db.write()
  return intentId
}

const getClientSecret = async (intentId) => {
  const data = db.data.bookingIntents.find(
    (bookingIntent) => bookingIntent.id === intentId
  )

  return data?.clientSecret || ""
}

const getProducts = async () => {
  const data = db.data.products

  return data
}

const getProductDetails = async (productId) => {
  const data = db.data.products.find((product) => product.id === productId)

  return data
}

export default {
  addBookingIntent,
  getClientSecret,
  getProductDetails,
  getProducts,
}
