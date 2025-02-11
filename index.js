import "dotenv/config"
import express from "express"
import cors from "cors"
import stripe from "stripe"

import db from "./db.js"

const app = express()

// This is your test secret API key.
const stripeAPI = stripe(process.env.STRIPE_SECRET_KEY)

app.use(cors())
app.use(express.static("public"))
app.use(express.json())

app.get("/", function (req, res) {
  res.send({
    hello: "Welcome!",
  })
})

app.get("/products", async (req, res) => {
  try {
    const products = await db.getProducts()

    res.send({ products: products })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" })
  }
})

app.post("/create-payment-intent", async (req, res) => {
  const { item } = req.body

  const productData = await db.getProductDetails(item?.id)

  // Check if the product data is found
  if (!productData) {
    res.status(500).send({
      paymentIntent: "Data not found",
    })
    return
  }

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripeAPI.paymentIntents.create({
    amount: productData?.amount * 100,
    currency: productData?.currency?.toLowerCase(),
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  })

  const intentId = await db.addBookingIntent(paymentIntent.client_secret)

  res.send({
    intentId,
  })
})

app.post("/get-payment-intent", async (req, res) => {
  const { intentId } = req.body
  const clientSecret = await db.getClientSecret(intentId)

  res.send({
    clientSecret,
  })
})

app.get("/payment-status/:bookingIntendId", async (req, res) => {
  const bookingIntendId = req.params.bookingIntendId

  const clientSecret = await db.getClientSecret(bookingIntendId)

  if (!clientSecret) {
    res.status(500).send({
      paymentIntent: "Data Not found",
    })
  }

  const intentId = clientSecret.split("_secret_")?.[0]

  const paymentIntent = await stripeAPI.paymentIntents.retrieve(intentId)

  res.send({
    paymentIntent,
  })
})

app.listen(4242, () => console.log("Node server listening on port 4242!"))
