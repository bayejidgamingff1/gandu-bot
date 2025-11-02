const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "anime",
    aliases: ["ani"], // এখন ani লিখলেও কাজ করবে
    version: "1.0",
    author: "BAYEJID",
    description: "Send random anime video",
    cooldown: 3,
    category: "fun"
};

module.exports.onStart = async function ({ api, event }) {
    // Anime ভিডিও লিস্ট
    const videos = [
        "https://files.catbox.moe/4bvqij.mp4",
        "https://files.catbox.moe/l507c4.mp4",
        "https://files.catbox.moe/sa39xw.mp4",
        "https://files.catbox.moe/qvy3bt.mp4",
        "https://files.catbox.moe/bg926l.mp4",
        "https://files.catbox.moe/jahkln.mp4",
        "https://files.catbox.moe/p0kgxl.mp4",
        "https://files.catbox.moe/5dvfyo.mp4",
        "https://files.catbox.moe/dlpilg.mp4"
    ];

    // Random ভিডিও বেছে নেওয়া
    const videoURL = videos[Math.floor(Math.random() * videos.length)];
    const filePath = path.join(__dirname, "anime_random.mp4");

    try {
        // Download the video
        const response = await axios.get(videoURL, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));

        // Send the video
        await api.sendMessage(
            {
                body: "✅ THAT'S YOUR ANIME VIDEO BBY ❤️‍🩹✨",
                attachment: fs.createReadStream(filePath)
            },
            event.threadID,
            () => fs.unlinkSync(filePath) // পাঠানোর পর ফাইল ডিলিট করবে
        );
    } catch (error) {
        console.error(error);
        api.sendMessage("❌ Failed to send Anime video.", event.threadID);
    }
};
