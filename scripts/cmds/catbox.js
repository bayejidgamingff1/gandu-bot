const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");

module.exports.config = {
  name: "catbox",
  aliases: ["cat","cb"],
  version: "3.0",
  author: "BAYEJID",
  role: 0,
  category: "utility",
  description: "Upload multiple mp4/mp3/photos to catbox",
  countdown: 5,
  guide: {
    en: "Reply to multiple attachments"
  }
};

module.exports.onStart = async ({ api, event }) => {
  try {
    const att = event.messageReply?.attachments;

    if (!att?.length) {
      return api.sendMessage("❌ Please reply to attachments!", event.threadID, event.messageID);
    }

    const uploading = await api.sendMessage("✨ Uploading… Please wait ✨", event.threadID);

    let result = "👇👇\n\n";

    for (let i = 0; i < att.length; i++) {

      const a = att[i];
      const ext = a.type === "audio" ? "mp3"
                : a.type === "video" ? "mp4"
                : a.type === "photo" ? "png"
                : "dat";

      const filePath = path.join(__dirname, `cache_${i}.${ext}`);
      const buffer = (await axios.get(a.url, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(filePath, buffer);

      const form = new FormData();
      form.append("reqtype", "fileupload");
      form.append("fileToUpload", fs.createReadStream(filePath));

      const upload = await axios.post("https://catbox.moe/user/api.php", form, {
        headers: form.getHeaders()
      });

      result += `File ${i + 1}: ${upload.data}\n`;
      fs.unlinkSync(filePath);
    }

    await api.unsendMessage(uploading.messageID);

    api.sendMessage(result, event.threadID, event.messageID);

  } catch (err) {
    console.log(err);
    api.sendMessage("❌ Failed to upload files.", event.threadID, event.messageID);
  }
};
