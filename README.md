# tradingview-tradovate-automation
Translates TradingView alerts to syntax compatible with the Tradovate API for automated futures trading.

## What this project does
This project receives JSON webhooks from TradingView and converts them into Tradovate-compatible order packets (single orders and OCO order). It is intended to be the bridge between TradingView strategies and Tradovate order endpoints. It is also a DIY alternative to the many subscription services offering this functionality.

## Features
* Accepts TradingView JSON alerts and maps fields to Tradovate API payloads
* Supports sendorder and OCO (sendoco) endpoints
* Minimal, configurable transform logic for limit and stop orders

## Quick Start (High Level)
1. Clone the repo and install Express (npm)
2. Configure Tradovate credentials and any other secrets as environment variables.
3. Start the service (node index.js) on an HTTPS endpoint and point your TradingView alert webhook to it.
4. Send a sample alert to verify the project transforms the alert into Tradovate order packets.

## Example alert JSON
```json
{
  "action":"{{strategy.order.action}}",
  "symbol":"ESZ21",
  "orderQty":1,
  "orderType":"Limit",
  "price":{{close}}
}
```

## How it works
* The app accepts a TradingView webhook, parses the JSON, and builds one or more Tradovate order packets.
* Limit orders are implemented as OCO (one-cancels-other) where applicable: the take-profit and stop-loss orders are sent to the Tradovate OCO endpoint and the root order is sent to the sendorder endpoint.
* Responses from Tradovate are parsed to obtain order IDs and status information.

## Security Notes
* Webhooks should be served over HTTPS and allow incoming requests from 52.89.214.238, 34.212.75.30, 54.218.53.128, and 52.32.178.7.
* Do not expose admin endpoints publicly.
* When using SSH to access a deployed machine, always authenticate using keys, disable password login, disable root login altogether via SSH. If password authentication is absolutely required, consider using a service such as Fail2Ban.

## References
- Tradovate API: https://api.tradovate.com/
- TradingView docs: https://www.tradingview.com/charting-library-docs/latest/introduction
- PineScript: https://www.tradingview.com/pine-script-docs/welcome/
