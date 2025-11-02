// viralvid.js
// Author & Owner: BAYEJID
// Purpose: Send viral videos (Only Bot Admin can use)

const { GoatWrapper } = require('fca-liane-utils');

module.exports = {
  config: {
    name: "viralvid",
    aliases: ["vv", "sxvid"], // শর্টকাট নাম
    author: "BAYEJID",
    role: 2, // Only Bot Admin
    shortDescription: "Send viral videos",
    longDescription: "Bot admin can choose and send viral videos",
    category: "media",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ event, api }) {
    // শুধু Bot Admin চেক
    if (!global.GoatBot.config.adminBot.includes(event.senderID)) {
      return api.sendMessage("❌ এই কমান্ড শুধু Bot Admin এর জন্য!", event.threadID, event.messageID);
    }

    const msg = 
`📽 VIRAL VIDEO MENU 📽

1. AFRIN LINK 🤤🥵
2. JANNAT TOHA 🥵
3. RIDHI SEX 🥵🥒
4. TASNIYA 1:33 🥵🍼`;

    return api.sendMessage(msg, event.threadID, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        type: "choose"
      });
    });
  },

  onReply: async function ({ event, api, Reply }) {
    if (event.senderID !== Reply.author) return;
    const { type } = Reply;

    if (type === "choose") {
      if (event.body == "1") {
        return api.sendMessage({
          body: "🔥 AFRIN LINK আসছে 🤤🥵",
          attachment: await global.utils.getStreamFromURL("https://files.catbox.moe/fvl65w.mp4")
        }, event.threadID);
      }
      else if (event.body == "2") {
        return api.sendMessage({
          body: "🔥 JANNAT TOHA 🥵",
          attachment: await global.utils.getStreamFromURL("https://files.catbox.moe/jpyzub.mp4")
        }, event.threadID);
      }
      else if (event.body == "3") {
        return api.sendMessage({
          body: "🔥 RIDHI SEX 🥵🥒",
          attachment: await global.utils.getStreamFromURL("https://files.catbox.moe/m5ca76.mp4")
        }, event.threadID);
      }
      else if (event.body == "4") {
        return api.sendMessage({
          body: "🔥 TASNIYA 1:33 🥵🍼",
          attachment: await global.utils.getStreamFromURL("https://files.catbox.moe/z0abit.mp4")
        }, event.threadID);
      }
      else {
        return api.sendMessage("❌ Invalid Option!", event.threadID, event.messageID);
      }
    }
  }
};
