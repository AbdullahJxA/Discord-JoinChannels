/* -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
//                                         Packages
var WebSocket = require(`ws`)
var fs = require(`fs`)
var readline = require(`readline`)
var { Client } = require(`discord.js-selfbot-v13`)
var chalk = require(`chalk`)
var config = require(`./config.json`)
var accounts = fs.readFileSync(`./tokens.txt`, `utf8`)
console.log(chalk.red(`[DEBUG] Found [ ${accounts.split(`\n`).length} ] tokens`))
console.log(chalk.red(`[DEBUG] Made by JxA https://jxa.world | https://github.com/AbdullahJxA`))
//                                         Packages
/* -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */

/* -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
//                                  Websocket Connection
async function discordWebsocket(token) {
    var ws = new WebSocket(`wss://gateway.discord.gg/?v=10&encoding=json`)// Discord's Websocket
    ws.on(`open`, () => {
        ws.send(JSON.stringify({
            op: 2,
            d: {
                token: token,
                intents: 513,
                properties: {
                    $os: `linux`,
                    $browser: `my_library`,
                    $device: `my_library`
                }
            }
        }))
    })
    ws.on(`message`, (data) => {
        var payload = JSON.parse(data)
        var { t, d, op } = payload

        if (op === 10) {
            var { heartbeat_interval } = d
            setInterval(() => {
                ws.send(JSON.stringify({ op: 1, d: null }))
            }, heartbeat_interval)
        }

        if (t === `READY`) {
            ws.send(JSON.stringify({ op: 4, d: { guild_id: config.Guild.ID, channel_id: config.Guild.ChannelID, self_mute: config.VoiceStatus.selfMute, self_deaf: config.VoiceStatus.selfDeaf } }))
            // the code above is used to connect to the voice channel
            console.log(chalk.grey(`[DEBUG] Joined the channel`))
        }
    })
}
//                                  Websocket Connection
/* -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */

/* -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
//                                  Starting the account
async function startbot(token) {
    var client = new Client()
    client.on(`ready`, async () => {
        console.log(chalk.green(`[DEBUG] ${client.user.username} is now online`))
    })
    await client.login(token).catch(error => {
        console.log(chalk.red(`[DEBUG] ${token} is not working!`))
    })
}
//                                  Starting the account
/* -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */

/* -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
//                   Reading the tokens from the txt file then starting them
async function startup() {
    var tokens = []
    var fileStream = fs.createReadStream(`tokens.txt`)
    var rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity })
    for await (var line of rl) {
        if (line.trim()) {
            tokens.push(line.trim())
        }
    }
    for (var token of tokens) {
        await startbot(token)
        discordWebsocket(token)
    }
}
//                   Reading the tokens from the txt file then starting them
/* -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
startup()