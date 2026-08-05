const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "slap",
    version: "2.0",
    author: "NTKhang x Refactored",
    countDown: 5,
    role: 0,
    shortDescription: "Batslap image",
    longDescription: "Generate a batslap meme image with tagged user or reply recipient",
    category: "fun",
    guide: {
      en: "   {pn} @tag or reply to a message [custom text]"
    }
  },

  langs: {
    vi: {
      noTag: "Bạn phải tag người bạn muốn tát hoặc trả lời tin nhắn",
      selfSlap: "Bạn không thể tự tát chính mình!"
    },
    en: {
      noTag: "You must tag the person you want to slap or reply to their message",
      selfSlap: "You can't slap yourself!"
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    const uid1 = event.senderID;
    let uid2 = null;

    // ১. Mentions থেকে ID বের করা
    if (event.mentions && Object.keys(event.mentions).length > 0) {
      uid2 = Object.keys(event.mentions)[0];
    } 
    // ২. Reply থেকে ID বের করা
    else if (event.type === "message_reply" && event.messageReply) {
      uid2 = event.messageReply.senderID;
    }

    // ট্যাগ বা রিপ্লাই না থাকলে
    if (!uid2) return message.reply(getLang("noTag"));

    // নিজের আইডিতে স্ল্যাপ দিতে চাইলে
    if (uid1 === uid2) return message.reply(getLang("selfSlap"));

    // Owner protection (Hardcoded check keep-up with custom message)
    const OWNER_ID = "100068909067279";
    if (uid2 === OWNER_ID) {
      return message.reply("slap yourself hala bkcd!? this is my owner 🦆💨");
    }

    // tmp ফোল্ডার না থাকলে তৈরি করা
    const tmpDir = path.join(__dirname, "tmp");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const pathSave = path.join(tmpDir, `${uid1}_${uid2}_batslap.png`);

    try {
      // অবতার ইউআরএল আনা
      const avatarURL1 = await usersData.getAvatarUrl(uid1);
      const avatarURL2 = await usersData.getAvatarUrl(uid2);

      // ইমেজ জেনারেট করা
      const img = await new DIG.Batslap().getImage(avatarURL1, avatarURL2);
      fs.writeFileSync(pathSave, Buffer.from(img));

      // টেক্সট থেকে মেনশন ট্যাগগুলো সঠিকভাবে মুছে ফেলা (Tag Problem Fix)
      let customText = args.join(" ");
      if (event.mentions && Object.keys(event.mentions).length > 0) {
        for (const mentionTag of Object.values(event.mentions)) {
          customText = customText.replace(mentionTag, "");
        }
      }
      customText = customText.trim();

      const responseMessage = customText || "chup nah hoy arekhta dimu 🙂✌️";

      // ছবি পাঠানো এবং ফাইল ডিলিট করা
      await message.reply(
        {
          body: responseMessage,
          attachment: fs.createReadStream(pathSave)
        },
        () => {
          if (fs.existsSync(pathSave)) {
            fs.unlinkSync(pathSave);
          }
        }
      );

    } catch (error) {
      console.error("Slap command error:", error);
      message.reply("❌ ছবি তৈরি করার সময় একটি সমস্যা হয়েছে!");
      
      // Error হলেও টেম্পোরারি ফাইল ক্লিনআপ করা
      if (fs.existsSync(pathSave)) {
        fs.unlinkSync(pathSave);
      }
    }
  }
};
