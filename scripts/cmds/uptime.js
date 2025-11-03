const fs = require("fs");
const path = require("path");
const Canvas = require("canvas");
const os = require("os");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["ping", "up", "status"],
    version: "5.0",
    author: "BAYEJID", // updated author
    countDown: 5,
    role: 0,
    shortDescription: "Show bot uptime in futuristic UI",
    longDescription: "High-end system monitor styled card",
    category: "system",
    guide: "{p}uptime"
  },

  onStart: async function ({ message }) {

    // Uptime
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);
    const uptimeStr = `${h}h ${m}m ${s}s`;

    // Ping
    const start = Date.now();
    await message.reply("⚡ Checking ping...");
    const ping = Date.now() - start;

    // Ping color
    let pingColor = "#00FF00";
    if (ping > 300) pingColor = "#FF0000";
    else if (ping > 150) pingColor = "#FFD700";

    // System stats
    const ramTotal = (os.totalmem() / 1024 / 1024).toFixed(0);
    const ramUsed = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(0);
    const cpuLoad = (os.loadavg()[0] * 10).toFixed(1);

    // Time (Bangladesh)
    const timeBD = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

    // Canvas
    const canvas = Canvas.createCanvas(1100, 600);
    const ctx = canvas.getContext("2d");

    const bg = await Canvas.loadImage("https://files.catbox.moe/7dh46k.png");
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // Dark overlay
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header neon
    ctx.shadowColor = "cyan";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#00FFFF";
    ctx.font = "bold 70px Sans";
    ctx.fillText("🚀 SYSTEM STATUS", 50, 120);

    // Glow divider line
    ctx.shadowBlur = 15;
    ctx.fillRect(50, 150, 1000, 2);

    // Glass box
    ctx.shadowBlur = 0;
    function roundRect(x,y,w,h,r){
      ctx.beginPath();
      ctx.moveTo(x+r,y);
      ctx.lineTo(x+w-r,y);
      ctx.quadraticCurveTo(x+w,y,x+w,y+r);
      ctx.lineTo(x+w,y+h-r);
      ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
      ctx.lineTo(x+r,y+h);
      ctx.quadraticCurveTo(x,y+h,x,y+h-r);
      ctx.lineTo(x,y+r);
      ctx.quadraticCurveTo(x,y,x+r,y);
      ctx.closePath();
    }
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.strokeStyle = "rgba(0,255,255,0.3)";
    ctx.lineWidth = 3;
    roundRect(50,180,620,360,25);
    ctx.fill(); ctx.stroke();

    // Texts
    ctx.shadowColor = "black";
    ctx.shadowBlur = 9;
    ctx.fillStyle = "white";
    ctx.font = "bold 42px Sans";

    let y = 250;
    ctx.fillText(`⏳ Uptime : ${uptimeStr}`, 80, y); y+=60;

    ctx.fillStyle = pingColor;
    ctx.fillText(`⚡ Ping : ${ping} ms`, 80, y); y+=60;

    ctx.fillStyle = "white";
    ctx.fillText(`🧠 CPU Load : ${cpuLoad}%`, 80, y); y+=60;

    ctx.fillText(`💾 RAM : ${ramUsed}/${ramTotal} MB`, 80, y); y+=60;

    ctx.fillText(`🕒 Time : ${timeBD}`, 80, y); y+=60;

    ctx.fillText(`👑 Owner : BAYEJID`, 80, y);

    // Owner avatar
    const avatar = await Canvas.loadImage("https://files.catbox.moe/eaydp3.jpg");
    ctx.save();
    ctx.beginPath();
    ctx.arc(910, 300, 130, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, 780, 170, 260, 260);
    ctx.restore();

    // Glow ring
    ctx.beginPath();
    ctx.arc(910, 300, 130, 0, Math.PI * 2);
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 8;
    ctx.shadowColor = "cyan";
    ctx.shadowBlur = 28;
    ctx.stroke();

    // Version badge
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(0,255,255,0.25)";
    roundRect(820, 450, 200, 60, 12);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "bold 35px Sans";
    ctx.fillText("v5.0 Build", 850, 495);

    const filePath = path.join(__dirname, "uptime.png");
    fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

    await message.reply({
      body: `✅ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗨𝗣𝗗𝗔𝗧𝗘𝗗\n• Uptime: ${uptimeStr}\n• Ping: ${ping}ms\n• CPU: ${cpuLoad}%\n• RAM: ${ramUsed}/${ramTotal}MB`,
      attachment: fs.createReadStream(filePath)
    });

    fs.unlinkSync(filePath);
  }
};
