const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const DB_PATH = path.join(__dirname, "publicphoto_db.json");

async function uploadToCatbox(fileUrl) {
  try {
    const res = await axios({
      method: "POST",
      url: "https://catbox.moe/user/api.php",
      headers: { "Content-Type": "multipart/form-data" },
      data: {
        reqtype: "urlupload",
        url: fileUrl
      }
    });
    return res.data;
  } catch (err) {
    console.error("Catbox upload failed:", err);
    return null;
  }
}

async function saveToDB(photoUrl) {
  let db = [];
  if (fs.existsSync(DB_PATH)) db = JSON.parse(await fs.readFile(DB_PATH, "utf8"));
  db.push({ url: photoUrl, time: Date.now() });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

async function getPhotos(hours = null) {
  if (!fs.existsSync(DB_PATH)) return [];
  const db = JSON.parse(await fs.readFile(DB_PATH, "utf8"));
  if (!hours) return db.map(p => p.url);

  const limit = Date.now() - hours * 60 * 60 * 1000;
  return db.filter(p => p.time >= limit).map(p => p.url);
}

module.exports = {
  config: {
    name: "publicphoto",
    aliases: ["pphoto"],
    version: "1.0",
    author: "BAYEJID",
    countDown: 5,
    role: 2, // only admin can use this command
    shortDescription: "Show photos uploaded by bot",
    longDescription: "Automatically uploads Messenger photos to Catbox and lists them via this command",
    category: "admin"
  },

  // 📸 Auto upload section — detect photo messages
  onMessage: async function ({ event }) {
    try {
      if (!event.attachments || event.attachments.length === 0) return;
      for (const att of event.attachments) {
        if (att.type === "photo" && att.url) {
          const link = await uploadToCatbox(att.url);
          if (link) await saveToDB(link);
        }
      }
    } catch (e) {
      console.error("Error in onMessage:", e);
    }
  },

  // 🧾 Command handler
  onStart: async function ({ message, args, role }) {
    try {
      const is24h = args[0] === "-24h";
      const photos = await getPhotos(is24h ? 24 : null);

      if (photos.length === 0)
        return message.reply(is24h ? "📭 গত ২৪ ঘন্টায় কোনো ছবি আপলোড হয়নি!" : "📭 এখনো কোনো ছবি আপলোড হয়নি।");

      let text = is24h
        ? `🕒 গত ২৪ ঘন্টায় ${photos.length}টি আপলোডকৃত ছবি:\n\n`
        : `📸 মোট ${photos.length}টি আপলোডকৃত ছবি:\n\n`;

      for (let i = 0; i < photos.length; i++) {
        text += `Photo ${i + 1}: ${photos[i]}\n`;
      }

      await message.reply(text);
    } catch (e) {
      console.error(e);
      message.reply("❌ কিছু একটা ভুল হয়েছে!");
    }
  }
};
