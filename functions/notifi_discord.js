/* eslint-disable camelcase */
// Require the necessary discord.js classes
const {Client, Intents} = require("discord.js");
// eslint-disable-next-line max-len
const {token, Moralis_ServerURL, Moralis_AppID, Moralis_User, Moralis_Password} = require("./config.json");
const functions = require("firebase-functions");
const {Timestamp, getFirestore} = require("firebase-admin/firestore");

const client = new Client({intents: [Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MESSAGES,
]});
exports.setupDiscord = () => {
  return client.login(token).then(console.log("Discord Login Complete"));
};

const Moralis = require("moralis/node");
console.log("Moralis Version: " + Moralis.CoreManager.get("VERSION"));
const MoralisDiscordMessage = Moralis.Object.extend("DiscordMessages");

exports.setupMoralis = () => {
  // eslint-disable-next-line max-len
  return Moralis.start( {serverUrl: Moralis_ServerURL, appId: Moralis_AppID}).then(
      Moralis.User.logIn(Moralis_User, Moralis_Password,
          {usePost: true}).then(
          console.log("Moralis Started!"),
      ),
  );
};


exports.discordCollect = async (id) => {
  try {
    // const id = "927374343552532490";
    let startStamp = 0;
    let count = 0;
    const db = getFirestore();
    const dn = db.collection("discordNotifi").doc(id);
    const doc = await dn.get();
    if (doc && doc.exists) {
      startStamp = doc.get("startingTimestamp").toDate();
    }
    const runTime = new Date();
    const channel = await client.channels.fetch(id);
    const filter1 = (m) => m.createdTimestamp > startStamp;
    functions.logger.info(`${id}: Channel=${channel.name}`);
    const mess = await channel.messages.fetch();
    count = mess.filter(filter1).length;
    // eslint-disable-next-line max-len
    functions.logger.info(`${channel.name} where  createdTimestamp > ${startStamp} processing ${mess.filter(filter1).length} messages`,
        {
          id: id,
          channel: channel,
        });
    mess.filter(filter1).forEach( (message) => {
      // console.log(`${message.author.username} SAID ${message.id}`);
      const dm = new MoralisDiscordMessage();
      dm.set("content", message.content);
      dm.set("discordUsername", message.author.username );
      dm.set("discordID", message.id);
      dm.set("discordUrl", message.url);
      dm.save();
    });
    dn.set({
      "name": channel.name,
      "startingTimestamp": Timestamp.fromDate(runTime),
    });
    return count;
  } catch (err) {
    functions.logger.error(err.message, err);
    return false;
  }
};


