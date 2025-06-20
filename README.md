# wck-token-oauth-joiner
WCK Token Joiner 2024 | Puppeteer + Discord OAuth2 | Selfbot | Node.js

# FEATURES
|- Puppeteer-Based Web Discord Token Login  
|- OAuth2 Authorization & Server Joiner  
|- Express Web Server for Redirect URI Handling  
|- Supports Multiple Tokens & Multiple Servers  
|- Token Retry Logic + Already Joined Token Cache  
|- Custom Webhook or Logging Ready  
|- WIO.DB + CSY.DB Integration  

# PURPOSE OF THE PROJECT
This script automatically logs into Discord using Puppeteer and simulates a user joining a Discord server via OAuth2 authorization. The goal is to simplify mass account participation into a server through bot-invite and user authorization flow.

# HOW IT WORKS
1. Tokens are loaded from `tokens.txt`  
2. Server IDs are loaded from `servers.txt`  
3. A Puppeteer browser automates login and authorizes the bot for each token  
4. An Express server handles the OAuth2 redirect for `code` retrieval  
5. Users are added to the server using `guilds.join` scope  
6. Joined tokens are cached locally to prevent reprocessing

# CONFIGURATION

Edit `config.js` with your own bot details:

```js
module.exports = {
  bot: {
    id: "YOUR_BOT_CLIENT_ID",
    secret: "YOUR_BOT_CLIENT_SECRET",
    token: "YOUR_BOT_TOKEN"
  },
  web: {
    port: 6969,
    url: "http://localhost:6969"
  }
}
