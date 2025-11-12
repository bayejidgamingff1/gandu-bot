// promote.js
// Messenger bot command: reply to a photo and run "promote" to generate a promo poster.
// Usage (reply to image):
//   promote
//   promote Title | Subtitle

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
  config: {
    name: "promote",
    aliases: ["promo", "promotion"],
    version: "1.0",
    author: "BAYEJID GAMING",
    countDown: 5,
    role: 0,
    shortDescription: "Generate a promotional poster from replied photo",
    longDescription: "Reply to an image with this command. Optional: provide Title | Subtitle after command.",
    category: "image"
  },

  onStart: async function ({ api, event, args }) {
    try {
      const threadID = event.threadID || event.senderID;
      const messageID = event.messageID;
      const senderID = event.senderID;

      // 1) Check reply
      if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments.length) {
        return api.sendMessage("❌ Reply kore kono photo diye ei command use korun.", threadID);
      }

      // 2) Find first image attachment (jpg/png)
      const imageAttachment = event.messageReply.attachments.find(a => {
        const t = (a.type || "").toLowerCase();
        return t.includes("photo") || t.includes("image") || /\.(jpg|jpeg|png|gif)$/i.test(a.url || a.filename || "");
      });

      if (!imageAttachment) {
        return api.sendMessage("❌ Reply kora message e kono supported image attachment paini.", threadID);
      }

      // 3) Parse args for Title and Subtitle (format: Title | Subtitle)
      let fullText = (args && args.join(" ")) || "";
      let title = "";
      let subtitle = "";
      if (fullText.includes("|")) {
        const parts = fullText.split("|").map(s => s.trim());
        title = parts[0] || "";
        subtitle = parts.slice(1).join(" | ") || "";
      } else {
        // if single string provided, use it as title
        title = fullText.trim();
      }

      if (!title) title = "PROMOTE";
      if (!subtitle) subtitle = "Check this out!";

      // 4) Download image
      const imageUrl = imageAttachment.url || imageAttachment.largePreviewUrl || imageAttachment.previewUrl;
      if (!imageUrl) return api.sendMessage("❌ Image URL pawa jay nai.", threadID);

      const tmpDir = path.join(__dirname, "tmp_promote");
      await fs.ensureDir(tmpDir);

      const originalPath = path.join(tmpDir, `inp_${messageID}_${Date.now()}.jpg`);
      const outPath = path.join(tmpDir, `promo_${messageID}_${Date.now()}.png`);

      const response = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 20000 });
      await fs.writeFile(originalPath, Buffer.from(response.data), 'binary');

      // 5) Create canvas and design poster
      // Poster size: 1200 x 1800 (portrait); image inside rounded rect near top
      const WIDTH = 1200;
      const HEIGHT = 1800;
      const canvas = createCanvas(WIDTH, HEIGHT);
      const ctx = canvas.getContext('2d');

      // background gradient
      const g = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
      g.addColorStop(0, '#0f172a'); // dark blue-ish
      g.addColorStop(1, '#1f2937'); // darker grey
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // subtle pattern / vignette
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 200; i++) {
        ctx.beginPath();
        const x = Math.random() * WIDTH;
        const y = Math.random() * HEIGHT;
        const r = Math.random() * 8;
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Load user's image
      const userImg = await loadImage(originalPath);

      // Draw framed image with drop shadow
      const MARGIN = 80;
      const imgBoxW = WIDTH - MARGIN * 2;
      const imgBoxH = Math.round(imgBoxW * (userImg.height / userImg.width));
      const maxImgBoxH = Math.round(HEIGHT * 0.55);
      let drawW = imgBoxW;
      let drawH = imgBoxH;
      if (drawH > maxImgBoxH) {
        drawH = maxImgBoxH;
        drawW = Math.round(drawH * (userImg.width / userImg.height));
      }
      const imgX = Math.round((WIDTH - drawW) / 2);
      const imgY = MARGIN + 40;

      // shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 40;
      ctx.fillStyle = '#000000';
      // rounded rect background for image
      const radius = 28;
      roundRect(ctx, imgX - 10, imgY - 10, drawW + 20, drawH + 20, radius);
      ctx.fill();
      ctx.restore();

      // image clipped to rounded rect
      roundClip(ctx, imgX, imgY, drawW, drawH, 20);
      ctx.drawImage(userImg, imgX, imgY, drawW, drawH);
      ctx.restore();

      // overlay gradient on bottom of image for contrast with text
      const og = ctx.createLinearGradient(0, imgY + drawH - 200, 0, imgY + drawH);
      og.addColorStop(0, 'rgba(0,0,0,0)');
      og.addColorStop(1, 'rgba(0,0,0,0.65)');
      ctx.fillStyle = og;
      ctx.fillRect(imgX, imgY + drawH - 220, drawW, 220);

      // Title text (big)
      // choose font sizes based on width
      const titleFontSize = 72;
      const subtitleFontSize = 36;

      // Title: put partially overlapping bottom of image
      ctx.font = `700 ${titleFontSize}px Sans`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // shadow for title
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#fff';
      ctx.fillText(title.toUpperCase(), WIDTH / 2, imgY + drawH + 110);

      // subtitle
      ctx.shadowBlur = 6;
      ctx.font = `${subtitleFontSize}px Sans`;
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.fillText(subtitle, WIDTH / 2, imgY + drawH + 160);

      // footer banner (call-to-action)
      const footerH = 140;
      const footerY = HEIGHT - footerH - 40;
      // rounded banner
      ctx.fillStyle = '#ff4d4f';
      roundRect(ctx, 80, footerY, WIDTH - 160, footerH, 20);
      ctx.fill();

      // footer text
      ctx.font = `700 40px Sans`;
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText('FOLLOW / JOIN / CONTACT', WIDTH / 2, footerY + footerH / 2 - 8);

      // small credit
      ctx.font = `400 20px Sans`;
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText(`Promoted by @${senderID}`, WIDTH - 90, HEIGHT - 20);

      // write file
      const buffer = canvas.toBuffer('image/png');
      await fs.writeFile(outPath, buffer);

      // 6) Send generated image
      const attach = fs.createReadStream(outPath);
      await api.sendMessage({
        body: `✅ Promotional poster created.\nTitle: ${title}\nSubtitle: ${subtitle}`,
        attachment: attach
      }, threadID);

      // cleanup
      try { await fs.unlink(originalPath); } catch(e) {}
      try { await fs.unlink(outPath); } catch(e) {}
      // keep tmp dir for a short time or optionally remove
    } catch (err) {
      console.error("promote.js error:", err);
      const threadID = (event && (event.threadID || event.senderID)) || null;
      if (threadID) api.sendMessage("❌ Error generating promotion image. Try again.", threadID);
    }
  }
};

// helper: rounded rect path
function roundRect(ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// helper: clip a rounded rect then keep drawing in that clip
function roundClip(ctx, x, y, w, h, r) {
  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.clip();
    }
