import express from 'express'
import fs from 'node:fs'
import { credentials, apiURLs, order, createOrder, createOrderPacket, createOCOPacket, sendOrderPacket } from '../Tradovate/apiHandler.js'
import { accessToken } from '../../index.js'

export const app = express()
app.use(express.json())

app.use((req, res, next) => {                     // Validate Request Type
  if (req.method != 'POST') {
    res.writeHead(405).end()
  } else {
    next()
  }
})

export const domain = '' // Populate Me
export const port = 443

export const options = {
  key: fs.readFileSync(`/etc/letsencrypt/live/${domain}/privkey.pem`, 'utf8'),
  cert: fs.readFileSync(`/etc/letsencrypt/live/${domain}/fullchain.pem`, 'utf8'),
  minVersion: 'TLSv1.2',
  honorCipherOrder: true
}

// Define Routes
app.post('/', (req, res) => {
  res.writeHead(200).end()
  try {
    const { action, symbol, orderQty, orderType, price } = req.body
    // Build root order parameters
    let parsedAction = req.body.action
    const parsedSymbol = req.body.symbol
    const parsedOrderQty = req.body.orderQty
    const parsedOrderType = req.body.orderType
    const parsedOrderPrice = req.body.price

    // Add custom parameters for final OCO packet
    let b1Action = null
    let b1OrderType = null
    let b1Price = null
    let b1TimeInForce = null

    let b2Action = null
    let b2OrderType = null
    let b2Price = null
    let b2TimeInForce = null

    // Populate custom parameters for 10-point take profit and stop-loss
    switch (parsedAction) {
        case 'buy':
            parsedAction = "Buy"

            // OCO Orders
            b1Action = "Sell"           // Take Profit
            b1OrderType = "Limit"
            b1Price = parsedOrderPrice + 10.00
            b1TimeInForce = "Day"
  
            b2Action = "Sell"           // Stop-Loss
            b2OrderType = "Stop"
            b2Price = parsedOrderPrice - 10.00
            b2TimeInForce = "Day"
            break;
        case 'sell':
            parsedAction = "Sell"

            // OSO Orders
            b1Action = "Buy"           // Take Profit
            b1OrderType = "Limit"
            b1Price = parsedOrderPrice - 10.00
            b1TimeInForce = "Day"
  
            b2Action = "Buy"           // Stop-Loss
            b2OrderType = "Stop"
            b2Price = parsedOrderPrice + 10.00
            b2TimeInForce = "Day"
            break;
        default:
            console.error(`[Alert Error]: ${parsedAction} is not a valid action.`)
            break;
    }

    // Build order using order constructor
   const alertOrder = new order(credentials.ACCOUNT_ID, parsedAction, parsedSymbol, parsedOrderQty, parsedOrderType, parsedOrderPrice, b1Action, b1OrderType, b1Price, b1TimeInForce, b2Action, b2OrderType, b2Price, b2TimeInForce)

  // Build and send order packets using the newly populated alertOrder
  const rootOrderPacket = createOrderPacket(accessToken, alertOrder)
  const ocoOrderPacket = createOCOPacket(accessToken, alertOrder)

  console.log("[ root order packet ]")
  console.log(rootOrderPacket)

  console.log("[ oco order packet ]")
  console.log(ocoOrderPacket)

  let sendRoot = sendOrderPacket(rootOrderPacket, apiURLs.PLACE_ORDER_URL)
  let sendOCO = sendOrderPacket(ocoOrderPacket, apiURLs.PLACE_OCO_URL)
  } catch (e) {
    console.error("Error: Unable to Parse Order Alert Data")
  }
})
