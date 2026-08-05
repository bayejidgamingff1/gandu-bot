global.chudi2Interval = null;

module.exports = {
  config: {
    name: "chudi",
    aliases: ["r", "chod"],
    version: "1.2",
    author: "bayejid",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Danger gali chudi",
    },
    longDescription: {
      en: "chudi line by line with dangerous gali style!",
    },
    category: "Fun",
    guide: {
      en: "{pn} or {pn} @mention or {pn} [Name]",
    },
  },

  onStart: async function ({ message, api, event, args }) {
    const mentions = Object.keys(event.mentions);
    
    let targetName;
    let tagText;
    let mentionsArray = [];

    // ১. যদি মেনশন থাকে
    if (mentions.length > 0) {
      const targetID = mentions[0];
      targetName = event.mentions[targetID];
      tagText = `@${targetName}`;
      mentionsArray = [{ id: targetID, tag: tagText }];
    } 
    // ২. যদি মেনশন না থাকে কিন্তু নাম লিখে দেয় (যেমন: chudi bayejid)
    else if (args.length > 0) {
      targetName = args.join(" ");
      tagText = targetName;
    } 
    // ৩. যদি কিছুই না দেয় (শুধু কমান্ড দিলে)
    else {
      targetName = "তোরে";
      tagText = targetName;
    }

    const chudi = [
      `চুদা Start🥵🍌🖕🏿 ${tagText}`,
      `‎${tagText} তর কচি বোন রে চুদি 😍🩹`,
      `‎${tagText} ভোদাই জানে চোদার মজা তোর মাকে জিজ্ঞেস কর কেমন দিছিলাম চোদা 🥰। নিশি রাতে তোর মাকে চুদে পেয়েছিলাম অনেক আনন্দ।🤩✊🏻🗑️`,
      `‎${tagText} তর কচি ভুদায় ভুদায় কামর দিমু 💔! তুর মারে আটলান্টিক মহাসাগরের মাঝামাঝি গলা টিপে ধরে চুদতে চুদতে ভুদার মাসিক চেন্জ করমো 🙈🚛`,
      `‎মাদারচোদ ${tagText} তর আম্মু পম পম খাংকির পো 🐰🐐`,
      `‎খাংকি মাগির পোলা ${tagText} কথা ক কম কম তর আম্মু রে চুদে বানামু আইটেম বোম😬`,
      `‎depression থেকেও ${tagText} তর মাইরে চু*** দি 🥵🍌🔪`,
      `‎${tagText} তর আম্মু রে আচার এর লোভ দেখিয়ে আমি চুদি মাগির পোলা🤬 🚬`,
      `‎বান্দির পোলা ${tagText} তর কচি বোনের ভুদা ফাক কর থুতু দিয়ে ভুদায় দন ডুকামু 👡`,
      `‎বান্দি মাগির পোলা ${tagText} তর আম্মু রে চুদি তর দুলা ভাই এর কান্দে ফেলে 🤝💩`,
      `‎হাই মাদারচোদ ${tagText} তর ব্যাশা জাতের আম্মু টা রে আদর করে করে চুদি🪧`,
      `~ ${tagText} চুদা কি আরো খাবি মাগির পোল 🤖 ভাগলে তুর মারে তুর বাপ কাকায় সবাই এক লগে চুদে 🌸💋❤️🙀❤️❤️🎶`,
      `‎পতিতা মাগির পোলা ${tagText} __ তোর মারে শেখ হাসিনা এর জামাই নরেন্দ্র মোদি কে দিয়ে পুটকি মারি😝🤨🤨📿`,
      `‎উফফফ ${tagText} খাদ্দামা মাগির পোলা তর আম্মুর কালা ভুদায় আমার মাল আউট তর কচি বোন রে উপ্তা করে এবার চুদবো 💉। খানকি মাগির পোলা তুর মারে চাইনা রেস্তোরাঁ নিয়ে জাইয়া রেসিপি লোভ দেখিয়ে চুদি তুই কি রাগ করবি 😅🤣💋🥵💋😹💋🛢️`,
      `‎অনলাইনে গালি বাজ হয়ে গেছত ${tagText} মাগির পোলা এমন চুদা দিমু লাইফ টাইম মনে রাখভি ʀᴜᴘᴏᴋ তর বাপ মাগির ছেলে 😘।🍗`,
      `‎মাদারচোদ ${tagText}😍.. __ এত কথা বাদ চল ২ জন মিলে তর মারে ধষন করি কালা মাগীর পুত ︵❛❛༎ 🦋🖇️🌈🍒-!!📸`,
      `‎ব্যাশ্যা মাগির পোলা ${tagText} 💔! __তর মার কচি ভুদায় ৭০ মণ বাগুন চাষ করমু নডির পুত পাগল ছাগল 💦👄💚🌻💯🫧`,
      `‎${tagText} তর মারে চুদি আপনার মারে ভুতের গল্প সুনিয়ে আসতে আসতে শির শির ভাবে চুদতে জায় 👍🥀😂🥀💋📚`,
      `‎বাস্ট্রাড এর বাচ্ছা ${tagText} বস্তির পোলা __ তোর মাকে গ্রীন লাইন গাড়ির ছাদের উপর ফালিয়ে ভোদার উপর পাড়া দিয়া চুদবো-))!!💦👄🐰💚🌻💯 🛣️`,
      `‎খাংকির পোলা ${tagText} তর কচি বোন রে চুদি 😍.`
    ];

    let index = 0;
    const threadID = event.threadID;

    function sendchudi() {
      if (index < chudi.length) {
        api.sendMessage(
          {
            body: chudi[index],
            mentions: mentionsArray,
          },
          threadID,
          (err, info) => {
            global.lastchudi2Msg = info?.messageID;
          },
        );
        index++;
      } else {
        clearInterval(global.chudi2Interval);
        global.chudi2Interval = null;
      }
    }

    global.chudi2Interval = setInterval(sendchudi, 1800);

    message.reply(
      `🔥 ${targetName} কে চোদা শুরু করলাম 🥵!\nType "STOP" to cancel শুধুমাত্র "BOSS" BAYEJID বন্ধ করতে পারবে 😎 .`,
    );
  },

  onChat: async function ({ event, message }) {
    if (
      ["stop", "off"].includes(event.body?.toLowerCase()) &&
      global.chudi2Interval
    ) {
      clearInterval(global.chudi2Interval);
      global.chudi2Interval = null;
      return message.reply(" যা খানকির পোলা এইবারের মতো BOSS এর কথা মতো ছেরে দিলাম 😎 !");
    }
  },
};
