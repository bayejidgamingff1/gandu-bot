module.exports = {
  config: {
    name: "leave",
    aliases: ["l"],
    version: "3.0",
    author: "Vex_Kshitiz x Refactored",
    countDown: 5,
    role: 2, // Admin Only
    shortDescription: "Bot will leave a group chat",
    longDescription: "List all groups and leave specific group by replying with the number",
    category: "admin",
    guide: {
      en: "{p}{n}",
    },
  },

  onStart: async function ({ api, event }) {
    try {
      const groupList = await api.getThreadList(300, null, ['INBOX']);
      // শুধুমাত্র সক্রিয় গ্রুপ চ্যাট ফিল্টার করা হচ্ছে
      const filteredList = groupList.filter(group => group.isGroup && group.threadName);

      if (filteredList.length === 0) {
        return api.sendMessage('❌ কোনো গ্রুপ চ্যাট পাওয়া যায়নি।', event.threadID, event.messageID);
      }

      const start = 0;
      const currentList = filteredList.slice(start, start + 5);

      let message = `╭─[ 𝐆𝐑𝐎𝐔𝐏 𝐋𝐈𝐒𝐓 ]\n`;
      currentList.forEach((group, index) => {
        message += `│ ${start + index + 1}. ${group.threadName}\n│ 𝐓𝐈𝐃: ${group.threadID}\n├───────────\n`;
      });
      message += `├─ Reply "next", "previous" or [Number]\n╰───────────ꔪ`;

      const sentMessage = await api.sendMessage(message, event.threadID);

      // Reply Event Set Up with cached list for fast response
      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: this.config.name,
        messageID: sentMessage.messageID,
        author: event.senderID,
        start,
        filteredList // গ্রুপ লিস্ট সেভ করে রাখা হলো যাতে বারবার API কল না করতে হয়
      });
    } catch (error) {
      console.error("Error listing group chats:", error);
      api.sendMessage('❌ গ্রুপ চ্যাট লিস্ট আনতে সমস্যা হয়েছে।', event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply, args }) {
    const { author, start, filteredList, messageID } = Reply;

    // শুধুমাত্র কমান্ড প্রদানকারী ইউজারই রিপ্লাই চালাতে পারবে
    if (event.senderID !== author) return;

    const userInput = args.join(" ").trim().toLowerCase();

    // ১. Next Page Handle
    if (userInput === 'next') {
      const nextPageStart = start + 5;

      if (nextPageStart >= filteredList.length) {
        return api.sendMessage('⚠️ আপনি তালিকার শেষ পৃষ্ঠায় পৌঁছে গেছেন।', event.threadID, event.messageID);
      }

      const currentList = filteredList.slice(nextPageStart, nextPageStart + 5);

      let message = `╭─[ 𝐆𝐑𝐎𝐔𝐏 𝐋𝐈𝐒𝐓 ]\n`;
      currentList.forEach((group, index) => {
        message += `│ ${nextPageStart + index + 1}. ${group.threadName}\n│ 𝐓𝐈𝐃: ${group.threadID}\n├───────────\n`;
      });
      message += `├─ Reply "next", "previous" or [Number]\n╰───────────ꔪ`;

      // পুরানো অন-রিপ্লাই ডিলিট করা
      global.GoatBot.onReply.delete(messageID);

      const sentMessage = await api.sendMessage(message, event.threadID, event.messageID);
      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: this.config.name,
        messageID: sentMessage.messageID,
        author,
        start: nextPageStart,
        filteredList
      });

    // ২. Previous Page Handle
    } else if (userInput === 'previous' || userInput === 'prev') {
      if (start === 0) {
        return api.sendMessage('⚠️ আপনি একদম প্রথম পৃষ্ঠায় আছেন।', event.threadID, event.messageID);
      }

      const prevPageStart = Math.max(start - 5, 0);
      const currentList = filteredList.slice(prevPageStart, prevPageStart + 5);

      let message = `╭─[ 𝐆𝐑𝐎𝐔𝐏 𝐋𝐈𝐒𝐓 ]\n`;
      currentList.forEach((group, index) => {
        message += `│ ${prevPageStart + index + 1}. ${group.threadName}\n│ 𝐓𝐈𝐃: ${group.threadID}\n├───────────\n`;
      });
      message += `├─ Reply "next", "previous" or [Number]\n╰───────────ꔪ`;

      global.GoatBot.onReply.delete(messageID);

      const sentMessage = await api.sendMessage(message, event.threadID, event.messageID);
      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: this.config.name,
        messageID: sentMessage.messageID,
        author,
        start: prevPageStart,
        filteredList
      });

    // ৩. Leave Specific Group (Number Selection)
    } else if (!isNaN(userInput)) {
      const groupIndex = parseInt(userInput, 10);

      if (groupIndex <= 0 || groupIndex > filteredList.length) {
        return api.sendMessage('❌ ভুল নম্বর দিয়েছেন! সঠিক নম্বর নির্বাচন করুন।', event.threadID, event.messageID);
      }

      const selectedGroup = filteredList[groupIndex - 1];
      const groupID = selectedGroup.threadID;

      try {
        const botUserId = api.getCurrentUserID();
        
        // প্রথমে মেসেজ পাঠানো হবে
        await api.sendMessage(`👋 বট এখন ${selectedGroup.threadName} গ্রুপটি লিভ নিচ্ছে...`, event.threadID, event.messageID);
        
        // বট গ্রুপ থেকে বের হবে
        await api.removeUserFromGroup(botUserId, groupID);

        // কাজ শেষে অন-রিপ্লাই ডাটা ক্লিনআপ
        global.GoatBot.onReply.delete(messageID);

      } catch (error) {
        console.error("Error leaving group chat:", error);
        api.sendMessage(`❌ ${selectedGroup.threadName} গ্রুপ থেকে লিভ নিতে ব্যর্থ হয়েছে।`, event.threadID, event.messageID);
      }

    } else {
      api.sendMessage('⚠️ অকার্যকর ইনপুট! অনুগ্রহ করে সঠিক নম্বর অথবা "next" / "previous" লিখে রিপ্লাই করুন।', event.threadID, event.messageID);
    }
  }
};
