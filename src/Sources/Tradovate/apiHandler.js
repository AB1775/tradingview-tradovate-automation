////////////////////////
//  Classes / Objects //
////////////////////////
export class credentials {
    ACCOUNT_ID = null
    ACCOUNT_SPEC = null
    USERNAME = null
    PASSWORD = null
    CID = null
    SEC = null
    APP_ID = null
    APP_VERSION = null
    DEVICE_ID = null
}

export const apiURLs = {
    REQ_TOKEN_URL:      null,
    RENEW_TOKEN_URL:    null,
    PLACE_ORDER_URL:    null,
    PLACE_OCO_URL:      null,
    GET_ORDERS_URL:     null,
    CANCEL_ORDER_URL:   null,
    GET_ACCT_URL:       null
}

export class authResponse {
    accessToken = null
    expirationTime = null

    constructor(accessToken, expirationTime) {
        this.accessToken = accessToken
        this.expirationTime = expirationTime
    }
}

export class order {
    // Root Order
    accountID = null
    action = null
    symbol = null
    orderQty = null
    orderType = null
    price = null

    // Bracket One
    b1Action = null
    b1OrderType = null
    b1Price = null
    b1TimeInForce = null

    // Bracket Two
    b2Action = null
    b2OrderType = null
    b2Price = null
    b2TimeInForce = null

    constructor(accountID, action, symbol, orderQty, orderType, price, b1Action, b1OrderType, b1Price, b1TimeInForce, b2Action, b2OrderType, b2Price, b2TimeInForce) {
        // Root Order
        this.accountID = accountID
        this.action = action
        this.symbol = symbol
        this.orderQty = orderQty
        this.orderType = orderType
        this.price = price

        // Bracket One
        this.b1Action = b1Action
        this.b1OrderType = b1OrderType
        this.b1Price = b1Price
        this.b1TimeInForce = b1TimeInForce

        // Bracket Two
        this.b2Action = b2Action
        this.b2OrderType = b2OrderType
        this.b2Price = b2Price
        this.b2TimeInForce = b2TimeInForce
    }

    outputParameterTypes() {
        console.log("[accountID Type]: " + typeof this.accountID)
        console.log("[action Type]: " + typeof this.action)
        console.log("[symbol Type]: " + typeof this.symbol)
        console.log("[orderQty Type]: " + typeof this.orderQty)
        console.log("[orderType Type]: " + typeof this.orderType)
        console.log("[price Type]: " + typeof this.price)
        console.log("[b1Action Type]: " + typeof this.b1Action)
        console.log("[b1OrderType Type]: " + typeof this.b1OrderType)
        console.log("[b1Price Type]: " + typeof this.b1Price)
        console.log("[b1TimeInForce Type]: " + typeof this.b1TimeInForce)
        console.log("[b2Action Type]: " + typeof this.b2Action)
        console.log("[b2OrderType Type]: " + typeof this.b2OrderType)
        console.log("[b2Price Type]: " + typeof this.b2Price)
        console.log("[b2TimeInForce Type]: " + typeof this.b2TimeInForce)
    }
}

export class orderIDs {
    orderId = null
    oco1Id = null
    oco2Id = null

    constructor(orderId, oco1Id, oco2Id) {
        this.orderId = orderId
        this.oco1Id = oco1Id
        this.oco2Id = oco2Id
    }
}

///////////////////
//   Functions   //
///////////////////

// Authentication
export function createAuthPacket(USERNAME, PASSWORD) {
    return {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: `{"name":"${credentials.USERNAME}","password":"${credentials.PASSWORD}","appId":"${credentials.APP_ID}","appVersion":"${credentials.APP_VERSION}","deviceId":"${credentials.DEVICE_ID}","cid":"${credentials.CID}","sec":"${credentials.SEC}"}`
    }
}

export function renewAuthPacket(accessToken) {
    return {
            "method": "GET",
            "headers": {"Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json"}
        }
}

export async function sendAuthPacket(packet, url) {
    try {
        const response = await fetch(url, packet)
        if (!response.ok) {
            console.error("sendAuthPacket() Error: " + response.status + " - " + response.statusText)
        } else {
            const authData = await response.json()
            const parsedAuthData = new authResponse(authData.accessToken, authData.expirationTime)
            return parsedAuthData
        }
    } catch (e) {
        console.error("sendAuthPacket() Error: " + e)
    }
}

// OCO Orders
export function createOrder(accountID, action, symbol, orderQty, orderType, price, b1Action, b1OrderType, b1Price, b1TimeInForce, b2Action, b2OrderType, b2Price, b2TimeInForce) {
    const populatedOrder = new order(accountID, action, symbol, orderQty, orderType, price, b1Action, b1OrderType, b1Price, b1TimeInForce, b2Action, b2OrderType, b2Price, b2TimeInForce)
    return populatedOrder
}

export function createOCOPacket(accessToken, order) {
    const stop = {
        action: order.b2Action,
        orderType: order.b2OrderType,
        stopPrice: order.b2Price,
        timeInForce: order.b2TimeInForce
    }

    const mainOrderBody = {
        accountSpec: credentials.ACCOUNT_SPEC,
        action: order.b1Action,
        symbol: order.symbol,
        orderQty: order.orderQty,
        orderType: order.b1OrderType,
        price: order.b1Price,
        timeInForce: order.b1TimeInForce,
        isAutomated: true,
        other: stop
    }

    return {
        method: 'POST',
        headers: {Authorization: `Bearer ${accessToken}`, Accept: 'application/json'},
        body: JSON.stringify(mainOrderBody)
    }   
}

export function createOrderPacket(accessToken, order) {    
    const mainOrderBody = {
        accountSpec: credentials.ACCOUNT_SPEC,
        accountId: order.accountID,
        action: order.action,
        symbol: order.symbol,
        orderQty: order.orderQty,
        orderType: order.orderType,
        price: order.price,
        isAutomated: true
    }

    return {
        method: 'POST',
        headers: {Authorization: `Bearer ${accessToken}`, Accept: 'application/json'},
        body: JSON.stringify(mainOrderBody)
    }
}

export async function sendOrderPacket(packet, url) {
    try {
        const response = await fetch(url, packet)
        if (!response.ok) {
            console.log(response)
            console.error("sendOrderPacket() Error: " + response.status + " - " + response.statusText)
        } else {
            const orderData = await response.json()
            
            console.log("[ Order Data from sendOrderPacket() ]")
            console.log(orderData)
            
            const parsedOrderData = new orderIDs(orderData.orderId, orderData.oco1Id, orderData.oco2Id)
            return parsedOrderData
        }
    } catch (e) {
        console.error("sendOrderPacket() Error: " + e)
    }
}

// Account Identification & Management (As-Needed) //
export function createAccountListPacket(accessToken) {
    return {
        method: 'GET',
        headers: {"Accept": "application/json", "Authorization": `Bearer ${accessToken}`}
    }
}

export async function sendAccountListPacket(packet, url) {
    try {
        const response = await fetch(url, packet)
        
        if (!response.ok) {
            console.log(response)
            console.error("sendAccountListPacket() Error: " + response.status + " - " + response.statusText)
        } else {
            const data = await response.json()
            console.log("[ Your Account Data - Note Before Clearing ]")
            console.log(data)
        }
    } catch (e) {
        console.error("sendAccountListPacket() Error: " + e)
    }
}
