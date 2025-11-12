const fs = require("fs");
const axios = require("axios");

module.exports = {
  config: {
    name: "botpp",
    aliases: ["setdp", "botprofile"],
    version: "1.1",
    author: "Bayejid",
    countDown: 3,
    role: 2, // ✅ ONLY ADMIN CAN USE
    shortDescription: "Set bot profile picture",
    longDescription: "Only admins can reply to a photo and set bot profile picture",
    category: "admin"
  },

  onStart: async function ({ api, event, usersData }) {
    
    // ✅ Permission check
    const userRole = this.config.role;
    if (userRole > event.role) {
      return api.sendMessage("❌ You are not an admin, you cannot use this command.", event.threadID, event.messageID);
    }

    try {
      // Check reply attachment
      if (!event.messageReply || event.messageReply.attachments.length === 0) {
        return api.sendMessage("❗ Please reply to a photo.", event.threadID, event.messageID);
      }

      const attachment = event.messageReply.attachments[0];
      if (attachment.type !== "photo") {
        return api.sendMessage("❗ Please reply to a valid photo.", event.threadID, event.messageID);
      }

      const imageURL = attachment.url;
      const path = __dirname + "/botdp.png";

      // Download image
      const getImage = (await axios.get(imageURL, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(path, Buffer.from(getImage, "utf-8"));

      // Change bot DP
      api.changeAvatar(fs.createReadStream(path), (err) => {
        if (err) {
          console.log(err);
          api.sendMessage("❌ Failed to update profile picture.", event.threadID, event.messageID);
        } else {
          api.sendMessage("✅ Bot profile picture updated successfully!", event.threadID, event.messageID);
        }

        fs.unlinkSync(path);
      });

    } catch (e) {
      console.log(e);
      return api.sendMessage("⚠️ Something went wrong!", event.threadID, event.messageID);
    }
  }
};
