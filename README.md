# tradingview-tradovate-automation
This project translates TradingView alerts to syntax compatible with the Tradovate API for automated futures trading.

## Project Requirements
Running this program requires a paid TradinView plan (Essential or better) to access alerts and webhooks over HTTPS and access to the TradingView API (a funded account with a balance of $1,000 or greater and a $25 per month subscription to the API). This project can be ran locally or on one of several cloud platforms. For hosting, ensure that SSH keys are used for access and that root login is disabled for SSH. If password authentication for SSH is absolutely required, implement a service such as Fail2Ban to prevent excessive failed password attempts. This project does not contain a pre-built strategy, only the javascript infrastructure required to automate a strategy. For more information, see the documentation below:

#### Tradovate API Documentation
```
https://api.tradovate.com/
```
#### TradingView Documentation
```
https://www.tradingview.com/charting-library-docs/latest/introduction
```
#### PineScript Documentation
```
https://www.tradingview.com/pine-script-docs/welcome/
```
#### Let's Encrypt Documentation (for HTTPS / SSL / TLS info)
```
https://letsencrypt.org/docs/
```
#### Digital Ocean Droplet Documentation (I personally use this solution for hosting)
```
https://docs.digitalocean.com/products/droplets/
```
#### Fail2Ban Documentation
```
https://help.ubuntu.com/community/Fail2ban
```

## Project Overview
This project takes JSON alerts from TradingView and transforms them into valid Tradovate API syntax for automated futures trading. For my implementation, I use the following JSON structure to send alerts. Note that take-profit and stop-loss calculations are hard-coded within the project itself because, for my case, they are fixed values. Both the root order (sent via TradingView) and the OCO bracket order (created locally) are combined into a single instance of the order class despite originating from two different sources.
```json
{
  "action":"{{strategy.order.action}}",
  "symbol":"Your symbol here",
  "orderQty":1,
  "orderType":"Limit",
  "price":{{close}} 
}
```

The root order is sent to the "sendorder" endpoint on the Tradovate API:
```javascript
let sendRoot = sendOrderPacket(rootOrderPacket, apiURLs.PLACE_ORDER_URL)
```
while the OCO order is sent to the "sendoco" endpoint:
```javascript
let sendOCO = sendOrderPacket(ocoOrderPacket, apiURLs.PLACE_OCO_URL)
```
The responses associated with each of these packets is then pared, returning the order ID associated with each order.

The logic for limit orders for this project is implemented using OCO orders, where the triggering of one order automatically cancels the other. These can be found in server.js:
```javascript
// OSO Orders
b1Action = "Buy"           // Take Profit
b1OrderType = "Limit"
b1Price = parsedOrderPrice - 10.00
b1TimeInForce = "Day"
  
b2Action = "Buy"           // Stop-Loss
b2OrderType = "Stop"
b2Price = parsedOrderPrice + 10.00
b2TimeInForce = "Day"
```

For strategies that do not require fixed stops or take-profit values, the best options are to either calculate them dynamically within your PineScript or to only use the "sendorder" endpoint to send one packet that opens the position and another packet that closes the position. Everything in this project can be customized as long as the authentication flow and access token renewal functionality remains intact.
