const { getPrefix } = global.utils; 
const { commands, aliases } = global.GoatBot;
const axios = require("axios");

module.exports = {
  config: {
    name: "help",
    version: "4.3",
    author: "BAYEJID 💥",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Modern stylish help menu with image and separators" },
    longDescription: { en: "Displays all commands grouped by category with emojis, header image, and separators." },
    category: "system",
    guide: { en: "{pn}help [command]" },
    priority: 1,
  },

  onStart: async function ({ api, message, args, event, threadsData, role }) {
    const { threadID, messageID } = event;
    const prefix = getPrefix(threadID);

    // Emoji map per category
    const categoryEmojis = {
      "18+": "🔞",
      admin: "🛡️",
      bot: "🤖",
      islamic: "🕌",
      special: "✨",
      tools: "🛠️",
      utility: "⚙️",
      ai: "🧠",
      anime: "🌸",
      araf: "🎨",
      automation: "⚡",
      "box chat": "📦",
      chat: "💬",
      config: "⚙️",
      contacts: "📇",
      convert: "🔄",
      custom: "🖌️",
      "date-system": "⏰",
      download: "⬇️",
      economy: "💰",
      fun: "😂",
      funny: "🤣",
      game: "🎮",
      general: "📌",
      goatbot: "🐐",
      group: "👥",
      image: "🖼️",
      info: "ℹ️",
      information: "📝",
      logo: "🏷️",
      love: "❤️",
      media: "🎵",
      "no prefix": "❌",
      nsfw: "🔥",
      other: "🔹",
      owner: "👑",
      photo: "📸",
      rank: "🏆",
      system: "💻",
      "ai & gpt": "🤖🧠",
      "fun & game": "🎉🎮",
      "image generator": "🎨🖌️",
    };

    // If user asks for specific command info
    if (args[0]) {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(`❌ Command "${commandName}" not found.`);
        return;
      }

      const config = command.config;
      const usage = (config.guide?.en || "No guide available.")
        .replace(/{p}/g, prefix)
        .replace(/{n}/g, config.name);

      const response = `
╭────── 📖 COMMAND INFO 📖 ──────╮
│ Command: ${config.name}
│ Author: ${config.author || "Unknown"}
│ Description: ${config.longDescription?.en || "No description available."}
│ Aliases: ${config.aliases?.join(", ") || "None"}
│ Version: ${config.version || "1.0"}
│ Permission: ${roleToString(config.role)}
│ Time Per Usage: ${config.countDown || 1}s
│ Guide: ${usage}
╰──────────────────────────────────╯
`;

      await message.reply(response);
      return;
    }

    // Group commands by category
    const categories = {};
    for (const [name, cmd] of commands) {
      if (cmd.config.role > 1 && role < cmd.config.role) continue;
      const category = (cmd.config.category || "OTHER").toLowerCase();
      if (!categories[category]) categories[category] = [];
      categories[category].push(name);
    }

    // Sort commands alphabetically
    for (const cat in categories) categories[cat].sort();

    // Header image (Updated with your image)
    const headerImageUrl = "https://files.catbox.moe/eaydp3.jpg";
    const responseImage = await axios.get(headerImageUrl, { responseType: "stream" });

    // Build modern styled message with separators
    let msg = "💖 ALL COMMANDS OF THIS BOT 💖\n\n";

    for (const [category, cmds] of Object.entries(categories)) {
      const emoji = categoryEmojis[category] || "⚡";
      msg += "____________________________\n"; // separator
      msg += `• ${emoji} *${category.toUpperCase()}* •\n`;
      msg += cmds.map(c => `   └ ${c}`).join("\n");
      msg += "\n"; // space after commands
    }

    msg += "____________________________\n"; // final separator before footer

    // Footer (Updated owner info)
    const uptime = process.uptime();
    const { days, hours, minutes, seconds } = formatUptime(uptime);
    msg += `👑 Owner: BAYEJID\n`;
    msg += `📜 Author: BAYEJID 💥\n`;
    msg += `⏱ Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s\n`;
    msg += `🧠 Use: ${prefix}help [command] for details`;

    // Send everything together
    await api.sendMessage({
      body: msg,
      attachment: responseImage.data
    }, threadID, messageID);
  },
};

// Helper: Format uptime
function formatUptime(secondsTotal) {
  const seconds = Math.floor(secondsTotal % 60);
  const minutes = Math.floor((secondsTotal / 60) % 60);
  const hours = Math.floor((secondsTotal / 3600) % 24);
  const days = Math.floor(secondsTotal / 86400);
  return { days, hours, minutes, seconds };
}

// Helper: Convert role to text
function roleToString(role) {
  switch (role) {
    case 0: return "0 (All Users)";
    case 1: return "1 (Group Admins)";
    case 2: return "2 (Bot Admin Only)";
    default: return "Unknown Permission";
  }
}
