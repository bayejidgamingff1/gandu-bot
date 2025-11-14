// rankcard.js — Power Isekai Profile Card v4 (RGB / Neon / Info Box)
// Author: BAYEJID (upgraded v4)
// Usage examples:
//  !rankcard
//  !rankcard age:21 gender:M
//  !rankcard @otherUser age:25 gender:F

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const Canvas = require("canvas");
const GIFEncoder = require("gifencoder");

module.exports = {
  config: {
    name: "rankcard",
    aliases: ["rank", "profile", "profilecard"],
    version: "4.0",
    author: "BAYEJID", // author change korle toder maire chudi.
    countDown: 6,
    role: 0,
    shortDescription: "Isekai Power Profile Card (animated, RGB, detailed)",
    longDescription: "Animated profile card with name, age, gender, level, XP, coins and power rating. Supports optional args and viewing other users.",
  },

  onStart: async function ({ event, api }) {
    // helper to safely parse arguments
    const parseArgs = (rawText) => {
      const args = {};
      // simple key:value like age:21 gender:M
      const parts = rawText.split(/\s+/);
      for (const p of parts) {
        const m = p.match(/^age[:=](\d{1,3})$/i);
        if (m) { args.age = parseInt(m[1], 10); continue; }
        const mg = p.match(/^gender[:=](male|female|m|f|other|unknown)$/i);
        if (mg) {
          const g = mg[1].toLowerCase();
          if (g === "m" || g === "male") args.gender = "Male";
          else if (g === "f" || g === "female") args.gender = "Female";
          else args.gender = "Unknown";
          continue;
        }
      }
      return args;
    };

    try {
      // Determine sender and potential mentioned target
      const senderID = event.senderID;
      let targetID = senderID;
      // event.mentions may be an object mapping id->name in many frameworks
      if (event.mentions && typeof event.mentions === "object") {
        const mentionIds = Object.keys(event.mentions);
        if (mentionIds.length > 0) targetID = mentionIds[0];
      }

      // Parse optional args from message body (robust across frameworks)
      const rawMsg = (event.body || event.message && event.message.body || "").trim();
      // Remove command trigger word if present (like "!rankcard")
      const withoutCmd = rawMsg.replace(/^[!\/]?\w+\s*/i, "");
      const parsed = parseArgs(withoutCmd);

      // Fetch name of target
      let name = "Unknown Hero";
      try {
        const info = await api.getUserInfo(targetID);
        name = info[targetID]?.name || name;
      } catch (e) {
        // fallback keep Unknown Hero
      }

      // Age/Gender: priority -> args -> stored profile (not implemented) -> random fallback
      let age = parsed.age || (Math.floor(Math.random() * 40) + 14); // random 14-53
      let gender = parsed.gender || ["Male","Female","Unknown"][Math.floor(Math.random() * 3)];

      // Stats (replace these with real DB values if you have)
      const level = Math.floor(Math.random() * 60) + 1;
      const xp = Math.floor(Math.random() * 1000);
      const coins = Math.floor(Math.random() * 10000);
      // Power rating: 1-5 stars based on level
      const powerStars = Math.min(5, Math.max(1, Math.ceil(level / 12)));

      // Notify user
      await api.sendMessage("⚔️ Crafting your Power Isekai Profile Card... (v4) 🌈", event.threadID);

      // Choose random background from your 4 images
      const backgrounds = [
        "https://files.catbox.moe/rwzlln.png",
        "https://files.catbox.moe/lhzs9d.png",
        "https://files.catbox.moe/u31k8z.png",
        "https://files.catbox.moe/m6k8ip.png"
      ];
      const bgURL = backgrounds[Math.floor(Math.random() * backgrounds.length)];

      // Fetch avatar image of target
      const avatarURL = `https://graph.facebook.com/${targetID}/picture?height=1024&width=1024`;
      const avatarBuf = (await axios.get(avatarURL, { responseType: "arraybuffer" })).data;

      // Load images
      const avatarImg = await Canvas.loadImage(avatarBuf);
      const bgImg = await Canvas.loadImage(bgURL);

      // Canvas & GIF encoder setup
      const W = 1000;
      const H = 420;
      const frames = 30; // smoother animation
      const encoder = new GIFEncoder(W, H);
      const tmpDir = path.join(__dirname, "tmp_rank_v4");
      await fs.ensureDir(tmpDir);
      const outPath = path.join(tmpDir, `rank_v4_${targetID}_${Date.now()}.gif`);
      const stream = fs.createWriteStream(outPath);
      encoder.createReadStream().pipe(stream);
      encoder.start();
      encoder.setRepeat(0); // 0 = loop
      encoder.setDelay(60); // ms
      encoder.setQuality(12);

      // Optional font registration if you add fonts to assets
      try {
        Canvas.registerFont(path.join(__dirname, "assets", "Poppins-Bold.ttf"), { family: "Poppins" });
        Canvas.registerFont(path.join(__dirname, "assets", "Poppins-Regular.ttf"), { family: "PoppinsReg" });
      } catch (e) { /* ignore if fonts missing */ }

      // helper for rounded rect
      function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      }

      // Animation loop
      for (let f = 0; f < frames; f++) {
        const canvas = Canvas.createCanvas(W, H);
        const ctx = canvas.getContext("2d");

        // draw background
        ctx.drawImage(bgImg, 0, 0, W, H);

        // subtle vignette
        const vg = ctx.createLinearGradient(0, 0, 0, H);
        vg.addColorStop(0, "rgba(0,0,0,0.05)");
        vg.addColorStop(1, "rgba(0,0,0,0.25)");
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, W, H);

        // compute hue for RGB cycling
        const hue = (f * 12) % 360;

        // left: avatar area
        const ax = 80, ay = 60, asize = 260;

        // animated RGB aura (radial gradient with pulse)
        const pulse = 1 + Math.sin((f / frames) * Math.PI * 2) * 0.12;
        const auraRadius = asize * 0.7 * pulse;
        const auraGrad = ctx.createRadialGradient(ax + asize/2, ay + asize/2, 20, ax + asize/2, ay + asize/2, auraRadius);
        auraGrad.addColorStop(0, `hsla(${hue},100%,60%,0.85)`);
        auraGrad.addColorStop(0.4, `hsla(${(hue+80)%360},100%,55%,0.45)`);
        auraGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(ax + asize/2, ay + asize/2, auraRadius, 0, Math.PI*2);
        ctx.fill();

        // subtle particles (small moving dots) — simple decorative
        for (let p = 0; p < 8; p++) {
          const t = (f + p * 3) / frames;
          const px = ax + asize/2 + Math.cos(t * Math.PI * 2 + p) * (auraRadius * 0.6);
          const py = ay + asize/2 + Math.sin(t * Math.PI * 2 + p) * (auraRadius * 0.45);
          ctx.fillStyle = `hsla(${(hue + p*30)%360},100%,60%,${0.5 - p*0.04})`;
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI*2);
          ctx.fill();
        }

        // draw avatar clipped circle with border
        ctx.save();
        ctx.beginPath();
        ctx.arc(ax + asize/2, ay + asize/2, asize/2 - 6, 0, Math.PI*2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, ax, ay, asize, asize);
        ctx.restore();

        // outer glow ring
        ctx.beginPath();
        ctx.arc(ax + asize/2, ay + asize/2, asize/2 + 6, 0, Math.PI*2);
        ctx.lineWidth = 6;
        ctx.strokeStyle = `hsla(${(hue+180)%360},100%,60%,0.35)`;
        ctx.stroke();

        // info box (panel)
        const boxX = 380, boxY = 50, boxW = 560, boxH = 320, radius = 18;
        // semi-transparent dark pane with border gradient
        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = "rgba(10,10,18,0.55)";
        roundRect(ctx, boxX, boxY, boxW, boxH, radius);
        ctx.fill();

        // neon border (animated)
        ctx.lineWidth = 3;
        const borderGrad = ctx.createLinearGradient(boxX, boxY, boxX+boxW, boxY+boxH);
        borderGrad.addColorStop(0, `hsla(${hue},100%,60%,0.95)`);
        borderGrad.addColorStop(0.5, `hsla(${(hue+120)%360},90%,60%,0.9)`);
        borderGrad.addColorStop(1, `hsla(${(hue+240)%360},90%,60%,0.9)`);
        ctx.strokeStyle = borderGrad;
        roundRect(ctx, boxX+1.5, boxY+1.5, boxW-3, boxH-3, radius-3);
        ctx.stroke();
        ctx.restore();

        // HEADER: name with glowing RGB text
        ctx.font = "bold 36px Poppins, Sans";
        ctx.textBaseline = "top";
        ctx.fillStyle = `hsl(${hue},100%,70%)`;
        ctx.shadowColor = `hsl(${(hue+180)%360},100%,60%)`;
        ctx.shadowBlur = 24;
        ctx.fillText(name, boxX + 30, boxY + 24);
        ctx.shadowBlur = 0;

        // Sub-info: Age, Gender
        ctx.font = "20px PoppinsReg, Sans";
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.fillText(`Age: ${age}`, boxX + 30, boxY + 78);
        ctx.fillText(`Gender: ${gender}`, boxX + 30, boxY + 108);

        // Stats block
        ctx.font = "20px PoppinsReg, Sans";
        ctx.fillStyle = "rgba(220,220,255,0.95)";
        ctx.fillText(`Level: ${level}`, boxX + 30, boxY + 148);
        ctx.fillText(`XP: ${xp} / 1000`, boxX + 30, boxY + 178);
        ctx.fillText(`Coins: ${coins}`, boxX + 30, boxY + 208);

        // Power stars display
        const starX = boxX + 30;
        const starY = boxY + 238;
        const starSize = 26;
        for (let s = 0; s < 5; s++) {
          ctx.beginPath();
          const cx = starX + s * (starSize + 8);
          const cy = starY;
          // draw simple star - here use a filled polygonless star using text star char
          ctx.font = `${starSize}px Sans`;
          if (s < powerStars) {
            ctx.fillStyle = `hsl(${(hue + s*20)%360},100%,60%)`;
            ctx.fillText("★", cx, cy);
          } else {
            ctx.fillStyle = "rgba(255,255,255,0.16)";
            ctx.fillText("★", cx, cy);
          }
        }
        ctx.font = "18px PoppinsReg, Sans";
        ctx.fillStyle = "rgba(200,200,255,0.9)";
        ctx.fillText("Power", starX + 5 + 5* (starSize + 8), starY + 6);

        // Neon XP bar (big)
        const barX = boxX + 300, barY = boxY + 240, barW = 220, barH = 22;
        // background slot
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        roundRect(ctx, barX, barY, barW, barH, 12);
        ctx.fill();
        // animated gradient fill
        const progress = Math.max(0, Math.min(1, xp / 1000));
        const g = ctx.createLinearGradient(barX - f*12, barY, barX + barW, barY);
        g.addColorStop(0, `hsl(${(hue)%360},100%,60%)`);
        g.addColorStop(0.5, `hsl(${(hue+90)%360},100%,60%)`);
        g.addColorStop(1, `hsl(${(hue+180)%360},100%,60%)`);
        ctx.fillStyle = g;
        roundRect(ctx, barX + 1, barY + 1, (barW - 2) * progress, barH - 2, 10);
        ctx.fill();
        // subtle glow for bar
        ctx.shadowColor = `hsl(${hue},100%,60%)`;
        ctx.shadowBlur = 18;
        roundRect(ctx, barX + 1, barY + 1, (barW - 2) * progress, barH - 2, 10);
        ctx.fill();
        ctx.shadowBlur = 0;

        // small label on the right
        ctx.font = "16px PoppinsReg, Sans";
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fillText(`${Math.round(progress * 100)}%`, barX + barW + 8, barY + 2);

        // Footer: special badge if user is target same as sender (you)
        ctx.font = "18px PoppinsReg, Sans";
        if (targetID === senderID) {
          // place "Soulbound" badge
          const badgeX = boxX + boxW - 150;
          const badgeY = boxY + boxH - 50;
          // badge bg
          ctx.fillStyle = `rgba(0,0,0,0.35)`;
          roundRect(ctx, badgeX, badgeY, 120, 34, 10);
          ctx.fill();
          // badge gradient text
          const bgrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + 120, badgeY + 34);
          bgrad.addColorStop(0, `hsl(${(hue+200)%360},100%,60%)`);
          bgrad.addColorStop(1, `hsl(${(hue+290)%360},100%,60%)`);
          ctx.fillStyle = bgrad;
          ctx.fillText("☆ Soulbound", badgeX + 12, badgeY + 6);
        }

        // final touch: top left small title
        ctx.font = "14px PoppinsReg, Sans";
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fillText("Isekai Profile • V4", boxX + 12, boxY - 24);

        // Add frame to GIF
        encoder.addFrame(ctx);
      } // end frames loop

      encoder.finish();

      // wait for write finish
      await new Promise((resolve) => stream.on("finish", resolve));

      // Send the result
      await api.sendMessage(
        {
          body: `✨ ${name}'s Power Isekai Profile (v4)`,
          attachment: fs.createReadStream(outPath),
        },
        event.threadID,
        () => {
          // cleanup
          try { fs.unlinkSync(outPath); } catch (e) {}
        }
      );

    } catch (err) {
      console.error("Rankcard v4 error:", err);
      try {
        await api.sendMessage("❌ RankCard v4 Error: " + (err.message || err), event.threadID);
      } catch(e){}
    }
  },
};
