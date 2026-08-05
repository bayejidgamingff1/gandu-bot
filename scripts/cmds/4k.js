const axios = require("axios");
const apiUrl = "https://www.noobs-apis.run.place";

module.exports = {
  config: {
    name: "4k",
    aliases: ["upscale", "hd", "ups"],
    version: "1.8.0",
    author: "Nazrul x Refactored",
    role: 0,
    description: "Upscale image by URL or by replying to an image",
    category: "image",
    countDown: 9,
    guide: {
      en: "{pn} [image url] or reply to an image"
    }
  },

  onStart: async ({ message, event, args }) => {
    const startTime = Date.now();
    let imgUrl = null;

    // ১. মেসেজ রিপ্লাই ফিল্টার করে ছবির URL বের করা
    if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
      const photoAttachment = event.messageReply.attachments.find(att => att.type === "photo");
      if (photoAttachment) {
        imgUrl = photoAttachment.url;
      }
    } 
    // ২. মেসেজ আর্গুমেন্ট (URL) থেকে চেক করা
    else if (args[0]) {
      imgUrl = args[0].trim();
    }

    // ৩. ছবি বা URL না থাকলে ওয়ার্নিং
    if (!imgUrl) {
      return message.reply("⚠️ Please reply to an image or provide a valid image URL!");
    }

    // URL ফরম্যাট চেক (সিম্পল ভ্যালিডেশন)
    if (!imgUrl.startsWith("http://") && !imgUrl.startsWith("https://")) {
      return message.reply("❌ Invalid image URL provided!");
    }

    // প্রসেসিং শুরুর রিঅ্যাকশন
    message.reaction("⏳", event.messageID);

    try {
      // API কল এবং Stream Response আনা
      const res = await axios({
        method: "GET",
        url: `${apiUrl}/nazrul/upscale?imgUrl=${encodeURIComponent(imgUrl)}`,
        responseType: "stream",
        timeout: 60000 // ১ মিনিটের টাইমআউট সেট করা হলো
      });

      // সাকসেস রিঅ্যাকশন
      message.reaction("✅", event.messageID);

      const processTime = ((Date.now() - startTime) / 1000).toFixed(2);

      // রেজাল্ট মেসেজ এবং ছবি সেন্ড
      return message.reply({
        body: `✨ Premium 4K Upscale Complete!\n📸 Your image is now HD+.\n⏱️ Process Time: ${processTime}s`,
        attachment: res.data
      });

    } catch (error) {
      // ফেল রিঅ্যাকশন
      message.reaction("❌", event.messageID);

      console.error("4K Upscale Error:", error.message);
      
      let errorMsg = "Failed to upscale image. The API server might be offline or busy.";
      if (error.response && error.response.status === 404) {
        errorMsg = "Invalid image URL or the image could not be fetched.";
      }

      return message.reply(`❌ Upscale Failed!\n${errorMsg}`);
    }
  }
};
