// Require the necessary discord.js classes
const { Client, Intents, DiscordMessageCollector } = require('discord.js');
const { token, Moralis_ServerURL, Moralis_AppID, Moralis_User, Moralis_Password } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Login to Discord with your client's token
client.login(token);

const  Moralis = require('moralis/node');
console.log("Moralis Version: " + Moralis.CoreManager.get("VERSION"));

const MoralisDiscordMessage = Moralis.Object.extend("DiscordMessages");


const collect = async (client, startTime) => {
    try {
        const channel = await client.channels.fetch("927374343552532490")
        const filter1 = m => m.createdTimestamp > startTime;
        const mess = await channel.messages.fetch()
        console.log(`${channel.name} since ${startTime} processing ${mess.length}`);
        mess.filter(filter1).forEach( (message) => {
            console.log(`${message.author.username} SAID ${message.id}`);
            const dm = new MoralisDiscordMessage();
            dm.set("content", message.content);
            dm.set("discordUsername",message.author.username );
            dm.set("discordID", message.id);
            dm.set("discordUrl", message.url);
            dm.save();
        })
        /*const filter = m => true;
        const collector = channel.createMessageCollector({ filter, time: 15000 });
        collector.on('collect', m => {
                console.log(`Collected ${m.content}`);
            });
            collector.on('end', collected => {
                console.log(`Collected ${collected.size} items`);
            });
        */
    }
    catch (err) {
        console.log("Failed...");
        console.error(err.message);
    }
}

// When the client is ready, run this code (only once)
client.once('ready', async () => {
	console.log('Discord Client Ready!');
    await Moralis.start({ serverUrl: Moralis_ServerURL, appId: Moralis_AppID });
    const user = await Moralis.User.logIn(Moralis_User, Moralis_Password, { usePost: true });
    console.log('Moralis Started!');
    const interval = 60*1000
    const doCollect = () => {
        const startStamp = Date.now() - interval;
        collect(client, startStamp);
    };
    doCollect();
    setInterval(doCollect,interval);
});


