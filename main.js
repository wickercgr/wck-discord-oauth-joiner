const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require("path");
const db = require("csy.db");
const ps = require("prompt-sync");
const express = require("express");
const prompt = ps();
const config = require("./config.js");
const axios = require("axios")
const DiscordOauth2 = require("discord-oauth2");
const oauth = new DiscordOauth2();
const util = require('util');
const origConsoleLog = console.log;
const chalk = require('chalk');
const { JsonDatabase } = require("wio.db");
const database = new JsonDatabase({ databasePath: "./database.json" });


console.log = function () {
	const now = new Date();
	const options = {
		timeZone: 'Europe/Istanbul',
		hour12: false,
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	};
	const formattedDate = chalk.rgb(255, 255, 255)('[' + now.toLocaleString('tr-TR', options) + ']');
	const args = Array.from(arguments);
	args.unshift(formattedDate);
	origConsoleLog.apply(console, args);
};

let control = 1

setTimeout(async function () {
    if (control === 1) {
let buildnumber = (Math.random() + 1).toString(8).substring(13);
const totaltoken = fs.readFileSync('tokens.txt', 'utf-8').split('\r\n').filter(Boolean);
const totalserver = fs.readFileSync('servers.txt', 'utf-8').split('\r\n').filter(Boolean);
console.log(chalk.green("[WCK SCRIPT] ") + chalk.rgb(255, 255, 255)("Loaded ") + chalk.green(totalserver.length) + chalk.green(" Servers ") + chalk.green("+ "));
console.log(chalk.green("[WCK SCRIPT] ") + chalk.rgb(255, 255, 255)("Loaded ") + chalk.green(totaltoken.length) + chalk.green(" Tokens ") + chalk.green("+ "));
console.log(chalk.green("[WCK SCRIPT] ") + chalk.rgb(255, 255, 255)("Status ") + chalk.green("+ "));
console.log(chalk.green("[WCK SCRIPT] ") + chalk.rgb(255, 255, 255)("Build Number ") + chalk.green("" + (buildnumber) + ""));
console.log("")

//console.log(chalk.green("[INFO] ") + chalk.rgb(255, 255, 255)("LOADED TOKENS ") + chalk.rgb(255, 255, 255)("[ " + tokenler.length + " ]"));

const BROWSER_CONFIG = {
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-infobars',
    '--window-position=0,0',
    '--window-size=1000,700',
  ],
  defaultViewport: null,
  ignoreHTTPSErrors: true,
  headless: false,
 // executablePath: 'doldurunuz',

}

const wait = (ms) => new Promise((res) => { setTimeout(() => { res() }, ms) });

const oauth2 = async(browser, Page, token, { now, max }) => {
  return new Promise(async(res) => {
    var er = false;
    try {
		var oauth2 = `https://discord.com/api/oauth2/authorize?client_id=${config.bot.id}&redirect_uri=${encodeURIComponent(config.web.url)}&response_type=code&scope=identify%20guilds.join`;

		await Page.bringToFront();
		await Page.goto('https://www.discord.com', {"waitUntil" : "networkidle0", timeout: 70000});
		await Page.evaluate('function login(token) {setInterval(() => {document.body.appendChild(document.createElement `iframe`).contentWindow.localStorage.token = `"${token}"`}, 50);setTimeout(() => {location.reload();}, 2500);}login("'+token+'")')
		let consoletoken = token.slice(3, 15);
	console.log(chalk.rgb(51, 119, 255)("AI <> ") + chalk.rgb(255, 255, 255)(`LOGIN DISCORD TOKEN PROCCES`) + chalk.red(" [" + consoletoken + "....]") + chalk.green(' +'));
		await Page.goto(oauth2, {"waitUntil" : "networkidle0", timeout: 70000});
		await Page.waitForSelector('button[type=button]');
		await Page.evaluate(() => Array.from(document.querySelectorAll('button[type=button]'), async(element) => {
			if(element.textContent == "Authorize" || element.textContent == "Yetkilendir")
			await element.click()
		}));

		await Page.waitForFunction('document.querySelector("body").innerText.includes("success")', { timeout: 3 * 60 * 1000 });
		await wait(2000);
		console.log(chalk.rgb(51, 119, 255)("AI <> ") + chalk.rgb(255, 255, 255)(`${now}/${max} HAS JOINED THE SERVER, TOKEN WRITTEN TO JOINED FILE`) + chalk.green(' +'));
		db.set(`already_${token}`, new Date().getTime());
		res(true);
	} catch (err) {
		fs.writeFile('unjoined.txt', `${token}`, (err) => {
			if (err) throw err;
			console.log(chalk.rgb(51, 119, 255)("AI <> ") + chalk.green(`${now}/${max} HAS JOINED ERROR, TOKEN WRITTEN TO UNJOINED FILE`) + chalk.red(' -'));
		});
		er = true;
	}
    if(er) {
      res(true);
    }
  });
}

const start = async(index, token, stat) => {
    const browser = await puppeteer.launch(BROWSER_CONFIG);
	const DiscordPage = (await browser.pages())[0];
    await oauth2(browser, DiscordPage, token, stat);
    browser.close();
	};

	const webstart = async(server) => {
	let app = express();
    app.all("/", async(req, res) => {
        let code = req.query.code;
        if(code) {
          let data = {
            'client_id': config.bot.id,
            'client_secret': config.bot.secret,
            'grant_type': 'authorization_code',
            'code': code,
			'redirect_uri': config.web.url
          }
          let headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
          }

          const body = new URLSearchParams(data)
          let control1 = await axios.post("https://discord.com/api/oauth2/token", body, { headers }).catch(err => err + "1");
          if(control1?.data && typeof control1?.data == "object") {
            let { access_token: access, refresh_token: refresh } = control1?.data;
            let control2 = await axios.get('https://discord.com/api/users/@me', { headers: { 'Authorization': `${control1?.data?.token_type} ${access}` } }).catch(err => err + "1");
            if (control2?.status != 401) {
				let userId = control2?.data?.id;

				var suc = false;
				await oauth.addMember({ guildId: server, botToken: config.bot.token, userId: userId, accessToken: access }).catch((e) => {
					e + "1";
				}).then(x => {
					suc = true;
				});

				if(suc) {
					return res.send("success");
				}
            } else {
              return res.send("error")
            }
          } else {
            return res.send("error")
          }
          return res.send("error");
        } else {
          res.send("nonred")
        }
    });

	app.listen(config.web.port);
}

(async() => {
	await console.log(chalk.rgb(51, 119, 255)("AI <> ") + chalk.rgb(255, 255, 255)(`CONNECTING WITH SERVER`) + chalk.green(' +'));
	var tokensFile = await fs.readFileSync(path.join(__dirname, "/tokens.txt"), "utf-8");
	var tokens = tokensFile.split("\n");
	const servers = fs.readFileSync('servers.txt', 'utf-8').split('\r\n').filter(Boolean);
	let server = servers[0]
	let amount = tokens.length
	console.log(chalk.rgb(51, 119, 255)("AI <> ") + chalk.rgb(255, 255, 255)(`SCRIPT ONLINE`) + chalk.green(' +'));

	if(isNaN(amount)) return console.log("INVALID NUMBER!");

	if(tokens.length < Number(amount)) return console.log("Big a Number!");
	await webstart(server);

	var lgbt = 0;

	for(var i = 0; i < tokens.length; i++) {
		if(lgbt >= amount) break;
		var tkn = String(tokens[i]).replace(/\r?\n|\r/g, '');
		if(db.has(`already_${tkn}`)) {
			console.log(chalk.rgb(51, 119, 255)("AI <> ") + chalk.rgb(255, 255, 255)(`${(i + 1)}/${tokens.length} IS ALREADY ON THE SERVER, SWITCHED TO NEXT TOKEN`) + chalk.green(' +'));
			continue;
		}

		await start(i, tkn, { now: (i + 1), max: tokens.length });
		lgbt++;
		await wait(3000);
	}
	console.log(chalk.rgb(51, 119, 255)("AI <> ") + chalk.rgb(255, 255, 255)(`ALL TOKENS ARE PROCESSED`) + chalk.green(' +'));
})();

    }
}, 2000);