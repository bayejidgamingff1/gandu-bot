const fs = require("fs").promises;
const fssync = require("fs");
const path = require("path");
const axios = require("axios");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "owner",
    version: "1.4",
    author: "BAYEJID 💥",
    category: "owner",
    guide: {
      en: "Use !owner or type Bayejid Admin to view owner info."
    }
  },

  onStart: async function ({ api, event }) {
    if (!this.sentThreads) this.sentThreads = {};
    if (this.sentThreads[event.threadID]) return;
    this.sentThreads[event.threadID] = true;

    const ownerInfo = {  
      name: "𝐁𝐀𝐘𝐄𝐉𝐈𝐃 🕊️",  
      gender: "Male 🧑🏻",  
      bio: "💥 OH FUCK 💥",  
      nick: "BAYEJID",  
      hobby: "Gaming 🎮",  
      from: "Bangladesh 🇧🇩",  
      age: "15+",  
      status: " Student"  
    };  

    const sec = process.uptime();  
    const botUptime = `${Math.floor(sec / 86400)}d ${Math.floor(sec % 86400 / 3600)}h ${Math.floor(sec % 3600 / 60)}m`;  
    const now = moment().tz("Asia/Dhaka").format("h:mm A • dddd");  

    const body = `
🌸┌───────────────┐🌸
𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢
🌸└───────────────┘🌸

✧ Name ➝ ${ownerInfo.name}
✧ Gender ➝ ${ownerInfo.gender}
✧ From ➝ ${ownerInfo.from}
✧ Age ➝ ${ownerInfo.age}
✧ Hobby ➝ ${ownerInfo.hobby}
✧ Status ➝ ${ownerInfo.status}

━━━━━━━━━━━━━━

✦ Bot Name ➝ ${ownerInfo.bio}
✦ Admin ➝ ${ownerInfo.nick}

━━━━━━━━━━━━━━

✨ Uptime ➝ ${botUptime}
✨ Time ➝ ${now}

📝 Any problem? Contact: ${ownerInfo.nick}
`;

    // Updated owner photo URL
    const imageUrl = "https://files.catbox.moe/eaydp3.jpg";
    const imagePath = path.join(__dirname, "cache", "owner.jpg");  

    try {  
      const response = await axios.get(imageUrl, { responseType: "stream" });  
      const writer = response.data.pipe(fssync.createWriteStream(imagePath));  
      await new Promise((resolve, reject) => {  
        writer.on("finish", resolve);  
        writer.on("error", reject);  
      });  

      const msg = await api.sendMessage({  
        body,  
        attachment: fssync.createReadStream(imagePath)  
      }, event.threadID);  

      this.lastOwnerMsgID = msg.messageID;  
      await fs.unlink(imagePath);  

    } catch (e) {  
      console.error("Error sending owner image:", e);  
      const msg = await api.sendMessage(body, event.threadID);  
      this.lastOwnerMsgID = msg.messageID;  
    }

  },

  onChat: async function ({ api, event }) {
    if (!event.body) return;
    const msg = event.body.toLowerCase().trim();

    if (msg === "!owner" || msg === "bayejid admin") {  
      await this.onStart({ api, event });  
    }
  }
};
