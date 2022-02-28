const functions = require("firebase-functions");

// eslint-disable-next-line max-len
const {initializeApp} = require("firebase-admin/app");
initializeApp();
// const firebaseAdmin = require("firebase-admin");
// exports.initializeApp = () => firebaseAdmin.initializeApp();
// exports.initializeApp();

const discord = require("./notifi_discord");
const discordCollect = discord.discordCollect;
const setupMoralis = discord.setupMoralis;
const setupDiscord = discord.setupDiscord;

const discordPromise = setupDiscord();
const moralisPromise = setupMoralis();

// Avalanche2 - 2947655460104831016
// Avalanche1 - 927374343552532490

exports.scheduledDiscordCollect =
  functions.pubsub.schedule("every 5 minutes").onRun( async (context) => {
    await discordPromise;
    await moralisPromise;
    const result = await discordCollect("927374343552532490");
    const result2 = await discordCollect("947655460104831016");
    return {result: result, result2: result2};
  });


exports.DiscordCollect = functions.https.onRequest(async (req, res) => {
  await discordPromise;
  await moralisPromise;
  const result = await discordCollect("927374343552532490");
  const result2 = await discordCollect("947655460104831016");
  res.json({result: result, result2: result2});
});
