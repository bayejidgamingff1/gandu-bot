const fs = require("fs");
const path = require("path");
const Canvas = require("canvas");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["ping", "up"],
    version: "3.8",
    author: "Azad", //author change korle tor marechudi
    countDown: 5,
    role: 0,
    shortDescription: "Show bot uptime in image",
    longDescription: "Generate a high-quality image that shows bot uptime, ping, and owner",
    category: "system",
    guide: "{p}uptime"
  },

  onStart: async function ({ event, message }) {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

    // Measure ping
    const start = Date.now();
    await message.reply({ body: "⚡ Checking ping..." });
    const ping = Date.now() - start;

    // Create canvas
    const canvas = Canvas.createCanvas(1000, 500);
    const ctx = canvas.getContext("2d");

    // Load background
    const bgUrl = "https://i.imgur.com/DEWxbDN.png";
    const bgImg = await Canvas.loadImage(bgUrl);
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    // Gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "rgba(0,0,0,0.25)");
    gradient.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Text shadow
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.shadowBlur = 8;

    const leftMargin = 40;
    let startY = 120;

    // Title
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 60px Sans";
    ctx.fillText("🤖 Bot Uptime", leftMargin, startY);

    // Info texts
    ctx.fillStyle = "#F0F0F0";
    ctx.font = "bold 40px Sans";
    startY += 100;

    const infoTexts = [
      `⏳ Uptime: ${uptimeStr}`,
      `📶 Ping: ${ping} ms`,
      `👑 Owner: BAYEJID`
    ];

    const spacing = 80;
    infoTexts.forEach(text => {
      ctx.fillText(text, leftMargin, startY);
      startY += spacing;
    });

    // Save temp file
    const filePath = path.join(__dirname, "uptime.png");
    fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

    // Send final image
    await message.reply({
      body: `𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐔𝐒\n• 💤 𝐔𝐩𝐭𝐢𝐦𝐞 : ${uptimeStr}\n• ⚡ 𝐏𝐢𝐧𝐠 : ${ping} ms\n• 👑 𝐎𝐰𝐧𝐞𝐫 : BAYEJID`,
      attachment: fs.createReadStream(filePath)
    });

    // Cleanup
    fs.unlinkSync(filePath);
  }
};
