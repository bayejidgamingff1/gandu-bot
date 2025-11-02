const axios = require("axios");
const fs = require("fs");
const ytSearch = require("yt-search");

const apiBase = "https://you-tube-video-api-by-arafat.vercel.app/yt";

async function downloadFile(url, fileName) {
  const response = (await axios.get(url, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(fileName, Buffer.from(response));
  return fs.createReadStream(fileName);
}

async function getThumbnailStream(url) {
  const response = await axios.get(url, { responseType: "stream" });
  return response.data;
}

module.exports = {
  config: {
    name: "sing",
    version: "2.0.0",
    aliases: [],
    author: "Arafat | Modified by ChatGPT",
    countDown: 5,
    role: 0,
    description: { en: "Search and download audio from YouTube" },
    category: "media",
    guide: { en: "simply type: sing despacito" }
  },

  // ✅ PREFIXLESS TRIGGER
  onChat: async function ({ api, event }) {
    const body = event.body?.toLowerCase();
    if (!body) return;

    if (body.startsWith("sing ")) {
      const args = body.split(" ").slice(1);
      return this.onStart({ api, args, event, commandName: "sing" });
    }
  },

  onStart: async ({ api, args, event, commandName }) => {
    const keyword = args.join(" ");
    if (!keyword) return api.sendMessage("❌ *Please provide a song name.*", event.threadID, event.messageID);

    try {
      const searchResults = (await ytSearch(keyword)).videos.slice(0, 6);
      if (!searchResults || searchResults.length === 0)
        return api.sendMessage("⭕ *No results found for:* " + keyword, event.threadID, event.messageID);

      let msg = "🎶 *Search Results:*\n\n";
      for (let i = 0; i < searchResults.length; i++) {
        const video = searchResults[i];
        msg += `✨ *${i + 1}.* ${video.title}\n⏱ Duration: ${video.timestamp}\n👤 Channel: ${video.author.name}\n\n`;
      }

      const thumbnails = await Promise.all(searchResults.map(v => getThumbnailStream(v.thumbnail)));

      api.sendMessage(
        { body: msg + "➡ Reply with a number (1-6) to download the audio.", attachment: thumbnails },
        event.threadID,
        (err, infoMsg) => {
          global.GoatBot.onReply.set(infoMsg.messageID, {
            commandName,
            messageID: infoMsg.messageID,
            author: event.senderID,
            results: searchResults
          });
        },
        event.messageID
      );

    } catch (err) {
      console.log(err);
      api.sendMessage("❌ *Failed to search YouTube.*", event.threadID, event.messageID);
    }
  },

  onReply: async ({ event, api, Reply }) => {
    try {
      const { results } = Reply;
      const choice = parseInt(event.body);

      if (isNaN(choice) || choice < 1 || choice > results.length)
        return api.sendMessage("❌ *Invalid choice.* Enter a number between 1-6.", event.threadID, event.messageID);

      const video = results[choice - 1];
      const videoURL = video.url;

      const { data } = await axios.get(`${apiBase}?url=${encodeURIComponent(videoURL)}&type=mp3`);
      if (!data.status || !data.download_url)
        return api.sendMessage("❌ *Failed to download audio.*", event.threadID, event.messageID);

      const fileName = "audio.mp3";
      await downloadFile(data.download_url, fileName);

      await api.unsendMessage(Reply.messageID);
      api.sendMessage(
        { body: `🎵 *Downloaded:* ${video.title}`, attachment: fs.createReadStream(fileName) },
        event.threadID,
        () => fs.unlinkSync(fileName),
        event.messageID
      );

    } catch (err) {
      console.log(err);
      api.sendMessage("❌ *Failed to download audio.*", event.threadID, event.messageID);
    }
  }
};
