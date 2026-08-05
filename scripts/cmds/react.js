const fs = require("fs-extra");
const path = __dirname + "/cache/autoReactUsers.json";

// cache ফোল্ডার না থাকলে স্বয়ংক্রিয়ভাবে তৈরি করবে
function ensureDirectoryExistence(filePath) {
  const dirname = require("path").dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

module.exports = {
  config: {
    name: "react",
    version: "1.0.1",
    author: "Your Name",
    countDown: 5,
    role: 1, // শুধুমাত্র এডমিন ব্যবহার করতে পারবে
    shortDescription: "নির্দিষ্ট ইউজারের মেসেজে অটো রিয়্যাক্ট সেট করা",
    longDescription: "ইউজার আইডি দিয়ে নির্দিষ্ট রিঅ্যাকশন অন/অফ করুন।",
    category: "admin",
    guide: {
      en: "{p}react <emoji> <uid1> <uid2> ...\nবন্ধ করতে: {p}react off <uid1> <uid2> ..."
    }
  },

  onStart: async function ({ args, message, event }) {
    if (args.length < 2) {
      return message.reply("⚠️ ফরম্যাট ঠিক নেই!\nব্যবহার: react ❤️ [UID1] [UID2]");
    }

    ensureDirectoryExistence(path);

    // আগের ডেটা লোড করা
    let autoReactData = {};
    if (fs.existsSync(path)) {
      try {
        autoReactData = JSON.parse(fs.readFileSync(path, "utf-8"));
      } catch (e) {
        autoReactData = {};
      }
    }

    const modeOrEmoji = args[0];
    const uids = args.slice(1);

    if (modeOrEmoji.toLowerCase() === "off") {
      // রিয়্যাক্ট অফ করার জন্য
      let removedCount = 0;
      uids.forEach(uid => {
        if (autoReactData[uid]) {
          delete autoReactData[uid];
          removedCount++;
        }
      });

      fs.writeFileSync(path, JSON.stringify(autoReactData, null, 2));
      return message.reply(`✅ ${removedCount} জন ইউজারের জন্য অটো রিয়্যাক্ট বন্ধ করা হয়েছে।`);
    } else {
      // রিয়্যাক্ট সেট করার জন্য
      const emoji = modeOrEmoji;
      let addedCount = 0;

      uids.forEach(uid => {
        autoReactData[uid] = emoji;
        addedCount++;
      });

      fs.writeFileSync(path, JSON.stringify(autoReactData, null, 2));
      return message.reply(`✅ ${addedCount} জন ইউজারের জন্য '${emoji}' রিয়্যাক্ট সেট করা হয়েছে।`);
    }
  },

  // নতুন মেসেজ আসলেই এই ফাংশনটি রান হবে
  onChat: async function ({ api, event }) {
    if (!fs.existsSync(path)) return;

    try {
      const autoReactData = JSON.parse(fs.readFileSync(path, "utf-8"));
      const senderID = event.senderID;

      // ইউজার যদি লিস্টে থাকে, তবে রিয়্যাক্ট দিবে
      if (autoReactData[senderID]) {
        const emoji = autoReactData[senderID];
        api.setMessageReaction(emoji, event.messageID, (err) => {}, true);
      }
    } catch (error) {
      console.log("Auto React Error:", error);
    }
  }
};
