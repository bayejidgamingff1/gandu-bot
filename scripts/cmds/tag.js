module.exports = {
  config: {
    name: "tag",
    version: "1.0",
    author: "BAYEJID X AI",
    countDown: 3,
    role: 0,
    shortDescription: "Tag members by name",
    longDescription: "Tag all members whose name matches the keyword",
    category: "group",
    guide: "{pn} <name>"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID } = event;

    if (!args.length)
      return api.sendMessage(
        "❌ | Usage:\n\ntag rakib\ntag md\ntag md rakib",
        threadID
      );

    const keyword = args.join(" ").toLowerCase();

    try {
      const threadInfo = await api.getThreadInfo(threadID);

      let mentions = [];
      let body = "📢 Matching Members:\n\n";
      let index = 0;

      for (const user of threadInfo.userInfo) {
        if (
          user.name &&
          user.name.toLowerCase().includes(keyword)
        ) {
          body += `@${user.name}\n`;

          mentions.push({
            tag: `@${user.name}`,
            id: user.id
          });

          index++;
        }
      }

      if (!mentions.length)
        return api.sendMessage(
          `❌ | "${args.join(" ")}" নামে কাউকে পাওয়া যায়নি।`,
          threadID
        );

      body += `\n✅ Total Tagged: ${mentions.length}`;

      return api.sendMessage(
        {
          body,
          mentions
        },
        threadID
      );
    } catch (err) {
      console.error(err);
      return api.sendMessage(
        "❌ | সদস্যদের তথ্য আনতে সমস্যা হয়েছে।",
        threadID
      );
    }
  }
};
