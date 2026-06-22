import { readEnv } from "./readEnv.js"
import https from 'node:https'
import { app, domain, port, options } from './Sources/TradingView/server.js'
import { apiURLs, credentials, authResponse, createAuthPacket, sendAuthPacket, renewAuthPacket } from './Sources/Tradovate/apiHandler.js'

readEnv("../.env", 0)
readEnv("../.env", 1)

// Authentication Flow
let initAuthPacket = createAuthPacket(credentials.USERNAME, credentials.PASSWORD)
let initResponse = await sendAuthPacket(initAuthPacket, apiURLs.REQ_TOKEN_URL)

export let accessToken = initResponse.accessToken  // Export me to server.js to build packets

const server = https.createServer(options, app).listen(port, () => {
    console.log(`[Server Running] @ Port ${port}`)
})

setInterval(() => {})

setInterval(() => {
    console.log("[+] Token Renewal")
        
    let renewalPacket = renewAuthPacket(accessToken)
        
    let renewResponse = sendAuthPacket(renewalPacket, apiURLs.RENEW_TOKEN_URL)

    accessToken = renewResponse.accessToken 
        
}, 75 * 60 * 1000)
