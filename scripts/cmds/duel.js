// duel.js
// Combined Duel + PremiumShop command for GOATBOT v2.5 style
// Author: Generated for you (BAYEJID) — features: duel, daily coin, shop (pets/skills/soldmate), RGB result image

const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const Canvas = require("canvas");

const USER_FOLDER = path.join(__dirname, "..", "..", "data", "users"); // adjust if your bot uses different folder
fs.ensureDirSync(USER_FOLDER);

// ------- Shop Data (edit/extend as needed) -------
const PETS = [
  { id: 1, name: "Wolf", price: 50000, desc: "Attack +7%", bonusAttack: 7 },
  { id: 2, name: "Dragon", price: 150000, desc: "Attack +20%", bonusAttack: 20 },
  { id: 3, name: "Rabbit", price: 15000, desc: "Speed +5%", bonusAttack: 3 },
  { id: 4, name: "Spider", price: 40000, desc: "Poison +10%", bonusAttack: 6 },
  { id: 5, name: "Phoenix", price: 120000, desc: "Heal +12%", bonusAttack: 12 },
  { id: 6, name: "Tiger", price: 80000, desc: "Crit +9%", bonusAttack: 9 },
  { id: 7, name: "Golem", price: 90000, desc: "Defense +11%", bonusAttack: 8 }
];

const SKILLS = [
  { id: 1, name: "Fire Skill", price: 30000, desc: "+12% Fire Damage", bonusAttack: 12 },
  { id: 2, name: "Water Skill", price: 25000, desc: "+10% Freeze Chance", bonusAttack: 10 },
  { id: 3, name: "Earth Skill", price: 35000, desc: "+15% Defense", bonusAttack: 8 },
  { id: 4, name: "Wind Skill", price: 20000, desc: "+8% Evade Rate", bonusAttack: 7 },
  { id: 5, name: "Shadow Skill", price: 50000, desc: "+18% Critical", bonusAttack: 15 }
];

const SOLDMATES = [
  { id: 1, name: "Hinata", price: 90000, desc: "+15% Heal", bonusAttack: 10 },
  { id: 2, name: "Mikasa", price: 120000, desc: "+20% Defense", bonusAttack: 12 },
  { id: 3, name: "Zero Two", price: 150000, desc: "+18% Damage", bonusAttack: 15 },
  { id: 4, name: "Nezuko", price: 80000, desc: "+15% Fire Resist", bonusAttack: 9 },
  { id: 5, name: "Kurumi", price: 180000, desc: "+25% Crit", bonusAttack: 20 }
];

// ------- Helpers: read/write user files -------
function userFilePath(uid) {
  return path.join(USER_FOLDER, `${uid}.json`);
}

async function loadUser(uid) {
  const p = userFilePath(uid);
  if (!(await fs.pathExists(p))) {
    const initial = {
      id: uid,
      coins: 1000,
      exp: 0,
      level: 1,
      lastDaily: 0,
      pets: [],
      skills: [],
      soldmate: null
    };
    await fs.writeJson(p, initial, { spaces: 2 });
    return initial;
  }
  return await fs.readJson(p);
}

async function saveUser(uid, data) {
  const p = userFilePath(uid);
  await fs.writeJson(p, data, { spaces: 2 });
}

// ------- Utils -------
function dayOfTs(ts) {
  const d = new Date(ts);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function ensureNumber(v, fallback = 0) {
  const n = parseInt(v, 10);
  return isNaN(n) ? fallback : n;
}

// ------- Canvas: create RGB result image -------
async function createResultImage({ avatarBuffer, name, gainCoins, gainExp, totalCoins, totalExp }) {
  // small card: 800x300
  const W = 800, H = 340;
  const canvas = Canvas.createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // background gradient
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#0f0c29");
  g.addColorStop(1, "#302b63");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // subtle pattern
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 40; i++) {
    ctx.fillRect((i * 43) % W, (i * 27) % H, 6, 6);
  }
  ctx.globalAlpha = 1;

  // avatar
  const ava = await Canvas.loadImage(avatarBuffer);
  const avSize = 160;
  const ax = 40, ay = 40;
  // circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(ax + avSize/2, ay + avSize/2, avSize/2, 0, Math.PI*2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(ava, ax, ay, avSize, avSize);
  ctx.restore();
  // avatar border glow
  ctx.beginPath();
  ctx.arc(ax + avSize/2, ay + avSize/2, avSize/2 + 6, 0, Math.PI*2);
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.stroke();

  // RGB name below avatar
  const nowHue = Math.floor((Date.now() / 40) % 360);
  const nameX = ax + avSize/2;
  const nameY = ay + avSize + 14;
  ctx.textAlign = "center";
  ctx.font = "bold 24px Sans";
  ctx.shadowBlur = 16;
  ctx.shadowColor = `hsl(${nowHue},100%,60%)`;
  ctx.fillStyle = `hsl(${nowHue},100%,70%)`;
  ctx.fillText(name, nameX, nameY);
  ctx.shadowBlur = 0;
  ctx.textAlign = "left";

  // Gains box
  const boxX = 230, boxY = 40, boxW = 520, boxH = 240;
  // panel
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  roundRect(ctx, boxX, boxY, boxW, boxH, 14);
  ctx.fill();

  // header
  ctx.font = "20px Sans";
  ctx.fillStyle = "#fff";
  ctx.fillText("Battle Rewards", boxX + 18, boxY + 36);

  // gained coins
  ctx.font = "bold 28px Sans";
  ctx.fillStyle = "#fff";
  ctx.fillText(`You gained: ${gainCoins} coins`, boxX + 18, boxY + 82);
  // gained exp
  ctx.fillText(`You gained: ${gainExp} exp`, boxX + 18, boxY + 122);

  // totals
  ctx.font = "18px Sans";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(`Total Coins: ${totalCoins}`, boxX + 18, boxY + 170);
  ctx.fillText(`Total Exp: ${totalExp}`, boxX + 18, boxY + 200);

  // small RGB bar
  const barX = boxX + 18, barY = boxY + boxH - 34, barW = boxW - 36, barH = 12;
  const grad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
  grad.addColorStop(0, `hsl(${nowHue},100%,60%)`);
  grad.addColorStop(0.5, `hsl(${(nowHue+120)%360},100%,60%)`);
  grad.addColorStop(1, `hsl(${(nowHue+240)%360},100%,60%)`);
  ctx.fillStyle = grad;
  ctx.fillRect(barX, barY, barW, barH);

  // return buffer
  return canvas.toBuffer();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ------- Command export -------
module.exports = {
  config: {
    name: "duel",
    aliases: ["duel", "fight", "battle"],
    version: "1.0",
    author: "BAYEJID",
    countDown: 3,
    role: 0,
    shortDescription: "Duel system + shop (pets, skills, soldmate)",
    longDescription: "Use /duel @user <bet> to duel, /duel coin for daily, /duel shop to open shop, /duel buy <type> <id> to purchase.",
  },

  onStart: async function ({ api, event, args }) {
    try {
      const senderID = event.senderID;
      const threadID = event.threadID;
      const body = (event.body || "").trim();

      // parse subcommand and args
      // Examples:
      // /duel @123456 500
      // /duel coin
      // /duel shop
      // /duel buy pet 1
      const parts = body.split(/\s+/).slice(1); // remove command itself
      const sub = parts[0] ? parts[0].toLowerCase() : "";

      // load sender
      const me = await loadUser(senderID);

      // ---------- DUEL: daily coin ---------- //
      if (sub === "coin") {
        const today = dayOfTs(Date.now());
        const last = me.lastDaily ? dayOfTs(me.lastDaily) : null;
        if (last === today) {
          return api.sendMessage("⚠️ You already claimed your daily duel coin today. Come back tomorrow.", threadID);
        }
        // random reward
        const coinGain = Math.floor(Math.random() * 901) + 100; // 100 - 1000
        const expGain = Math.floor(Math.random() * 91) + 10; // 10 - 100
        me.coins = (me.coins || 0) + coinGain;
        me.exp = (me.exp || 0) + expGain;
        me.lastDaily = Date.now();
        // level-up logic (simple): every 1000 exp = level up
        while (me.exp >= me.level * 1000) {
          me.exp -= me.level * 1000;
          me.level = (me.level || 1) + 1;
        }
        await saveUser(senderID, me);

        // avatar fetch + image
        const avatarURL = `https://graph.facebook.com/${senderID}/picture?height=1024&width=1024`;
        const avBuf = (await axios.get(avatarURL, { responseType: "arraybuffer" })).data;
        const imgBuf = await createResultImage({
          avatarBuffer: avBuf,
          name: event.senderName || (me.name || "You"),
          gainCoins: coinGain,
          gainExp: expGain,
          totalCoins: me.coins,
          totalExp: me.exp
        });

        return api.sendMessage({ body: `✅ You got ${coinGain} coins & ${expGain} exp!`, attachment: imgBuf }, threadID);
      }

      // ---------- DUEL: shop listing ---------- //
      if (sub === "shop") {
        let msg = "💠 Duel Shop — choose a category (use `/duel buy <type> <id>`)\n\n";
        msg += "1) Pets — `/duel buy pet <id>`\n";
        msg += "2) Skills — `/duel buy skill <id>`\n";
        msg += "3) Soldmate — `/duel buy soldmate <id>`\n\n";
        msg += "Pets available:\n";
        for (const p of PETS) msg += `${p.id}. ${p.name} — ${p.price.toLocaleString()} coins — ${p.desc}\n`;
        msg += `\nSkills available:\n`;
        for (const s of SKILLS) msg += `${s.id}. ${s.name} — ${s.price.toLocaleString()} coins — ${s.desc}\n`;
        msg += `\nSoldmates:\n`;
        for (const sm of SOLDMATES) msg += `${sm.id}. ${sm.name} — ${sm.price.toLocaleString()} coins — ${sm.desc}\n`;
        return api.sendMessage(msg, threadID);
      }

      // ---------- DUEL: buy ---------- //
      if (sub === "buy") {
        const type = parts[1] ? parts[1].toLowerCase() : null;
        const id = ensureNumber(parts[2], 0);
        if (!type || !id) return api.sendMessage("Usage: /duel buy <pet|skill|soldmate> <id>", threadID);

        let item, listName;
        if (type === "pet") { item = PETS.find(x => x.id === id); listName = "pet"; }
        else if (type === "skill") { item = SKILLS.find(x => x.id === id); listName = "skill"; }
        else if (type === "soldmate") { item = SOLDMATES.find(x => x.id === id); listName = "soldmate"; }
        else return api.sendMessage("Type must be pet | skill | soldmate", threadID);

        if (!item) return api.sendMessage("Item not found.", threadID);
        if ((me.coins || 0) < item.price) return api.sendMessage("You don't have enough coins.", threadID);

        // Deduct and add item
        me.coins -= item.price;
        if (listName === "pet") {
          if (!me.pets) me.pets = [];
          // disallow buying same pet twice
          if (me.pets.find(p => p.id === item.id)) return api.sendMessage("You already own this pet.", threadID);
          me.pets.push({ id: item.id, name: item.name, boughtAt: Date.now() });
        } else if (listName === "skill") {
          if (!me.skills) me.skills = [];
          if (me.skills.find(s => s.id === item.id)) return api.sendMessage("You already own this skill.", threadID);
          me.skills.push({ id: item.id, name: item.name, boughtAt: Date.now() });
        } else {
          // soldmate (only one)
          if (me.soldmate && me.soldmate.id === item.id) return api.sendMessage("You already own this soldmate.", threadID);
          me.soldmate = { id: item.id, name: item.name, boughtAt: Date.now() };
        }

        await saveUser(senderID, me);
        return api.sendMessage(`✅ Purchased ${item.name} for ${item.price.toLocaleString()} coins.`, threadID);
      }

      // ---------- DUEL: challenge ---------- //
      // expecting: /duel @user <bet>
      // find mention id in event.mentions or args
      const mentionIds = event.mentions ? Object.keys(event.mentions) : [];
      if (mentionIds.length === 0) {
        return api.sendMessage("Usage:\n/duel @user <bet>\n/duel coin\n/duel shop\n/duel buy <pet|skill|soldmate> <id>", threadID);
      }
      const targetID = mentionIds[0];
      if (targetID === senderID) return api.sendMessage("You cannot duel yourself.", threadID);

      const betArg = parts.find(p => /^\d+$/.test(p));
      if (!betArg) return api.sendMessage("Specify bet amount. Example: /duel @user 500", threadID);
      const bet = ensureNumber(betArg, 0);
      if (bet <= 0) return api.sendMessage("Bet must be a positive number.", threadID);

      // reload in case changed
      const challenger = await loadUser(senderID);
      const opponent = await loadUser(targetID);

      if ((challenger.coins || 0) < bet) return api.sendMessage("You don't have enough coins to bet.", threadID);
      if ((opponent.coins || 0) < bet) return api.sendMessage("Opponent doesn't have enough coins to match the bet.", threadID);

      // compute power scores
      function computePower(user) {
        let power = (user.level || 1) * 10;
        power += Math.floor(Math.random() * 100);
        // pet and skill bonuses
        if (user.pets && user.pets.length > 0) {
          for (const p of user.pets) {
            const petDef = PETS.find(x => x.id === p.id);
            if (petDef) power += (petDef.bonusAttack || 0);
          }
        }
        if (user.skills && user.skills.length > 0) {
          for (const s of user.skills) {
            const sDef = SKILLS.find(x => x.id === s.id);
            if (sDef) power += Math.floor((sDef.bonusAttack || 0) * 0.6);
          }
        }
        if (user.soldmate) {
          const sm = SOLDMATES.find(x => x.id === user.soldmate.id);
          if (sm) power += Math.floor((sm.bonusAttack || 0) * 0.9);
        }
        return power;
      }

      const powA = computePower(challenger);
      const powB = computePower(opponent);

      // winner determination
      let winnerId, loserId, winnerName;
      if (powA === powB) {
        // tie -> random
        winnerId = Math.random() < 0.5 ? senderID : targetID;
      } else {
        winnerId = powA > powB ? senderID : targetID;
      }
      loserId = winnerId === senderID ? targetID : senderID;

      // apply coin transfer and exp reward
      const winner = await loadUser(winnerId);
      const loser = await loadUser(loserId);

      // transfer bet
      loser.coins = Math.max(0, (loser.coins || 0) - bet);
      winner.coins = (winner.coins || 0) + bet;

      // exp reward = 10% of bet + random
      const expGain = Math.floor(bet * 0.1) + Math.floor(Math.random() * 50);
      winner.exp = (winner.exp || 0) + expGain;

      // update levels simple
      while (winner.exp >= (winner.level || 1) * 1000) {
        winner.exp -= (winner.level || 1) * 1000;
        winner.level = (winner.level || 1) + 1;
      }

      await saveUser(winnerId, winner);
      await saveUser(loserId, loser);

      // prepare result image for winner (rgb style)
      const winnerInfo = winnerId === senderID ? challenger : opponent;
      const nameToShow = winnerId === senderID ? (event.senderName || "You") : (event.mentions ? (event.mentions[targetID] || "Opponent") : "Opponent");

      // fetch avatar of winner
      const winnerAvatarURL = `https://graph.facebook.com/${winnerId}/picture?height=1024&width=1024`;
      const winnerAvBuf = (await axios.get(winnerAvatarURL, { responseType: "arraybuffer" })).data;

      const resultImgBuf = await createResultImage({
        avatarBuffer: winnerAvBuf,
        name: (winnerId === senderID ? (event.senderName || "You") : (event.mentions ? event.mentions[targetID] : "Winner")),
        gainCoins: bet,
        gainExp: expGain,
        totalCoins: winner.coins,
        totalExp: winner.exp
      });

      // send message
      let outMsg = "";
      outMsg += `⚔️ Duel Result\n`;
      outMsg += `Winner: ${winnerId === senderID ? (event.senderName || "You") : (event.mentions ? event.mentions[targetID] : "Opponent")}\n`;
      outMsg += `You gained ${bet.toLocaleString()} coins and ${expGain} exp.\n`;
      outMsg += `New balance — Coins: ${winner.coins.toLocaleString()}, Exp: ${winner.exp}\n`;

      await api.sendMessage({ body: outMsg, attachment: resultImgBuf }, threadID);

      return;
    } catch (err) {
      console.error("DUEL CMD ERROR:", err);
      try { await api.sendMessage("❌ Duel command error: " + (err.message || err), event.threadID); } catch(e){}
    }
  }
};
