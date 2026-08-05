const Jimp = require("jimp");
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
    config: {
        name: "kiss",
        aliases: ["kiss"],
        version: "1.1",
        author: "♡︎ BAYEJID ♡︎",
        countDown: 5,
        role: 0,
        shortDescription: "KISS",
        longDescription: "Send a kiss image with 2 people.",
        category: "fun",
        guide: "{pn} tag or reply"
    },

    onStart: async function ({ api, message, event, usersData }) {
        const uid = event.senderID;
        const mentions = Object.keys(event.mentions || {});
        let one, two;

        // ২ জন কে ট্যাগ করলে
        if (mentions.length >= 2) {
            one = mentions[0];
            two = mentions[1];
        } 
        // ১ জন কে ট্যাগ করলে
        else if (mentions.length === 1) {
            one = mentions[0];
            two = uid; // যে কমান্ড দিয়েছে সে নিজে ২য় জন
        } 
        // রিপ্লাই দিলে
        else if (event.messageReply) {
            one = event.messageReply.senderID;
            two = uid;
        } 
        // ট্যাগ বা রিপ্লাই না থাকলে
        else {
            return message.reply("😘 | Tag or reply to someone you want to kiss.");
        }

        try {
            const avatarURL1 = await usersData.getAvatarUrl(one);
            const avatarURL2 = await usersData.getAvatarUrl(two);

            if (!avatarURL1 || !avatarURL2) {
                return message.reply("Couldn't fetch user avatars.");
            }

            // ছবি ডাউনলোড করা
            const avatar1 = await Jimp.read((await axios({ url: avatarURL1, responseType: "arraybuffer" })).data);
            const avatar2 = await Jimp.read((await axios({ url: avatarURL2, responseType: "arraybuffer" })).data);
            
            // ব্যাকগ্রাউন্ড সেট করা
            const background = await Jimp.read("https://i.imgur.com/pLubFCh.jpeg");

            // ব্যাকগ্রাউন্ড রিসাইজ
            background.resize(495, 619);
            
            // অ্যাভাটার রাউন্ড করা এবং যোগ করা
            avatar1.resize(110, 110).circle();
            avatar2.resize(110, 110).circle();
            
            background.composite(avatar1, 100, 130);  // প্রথম ইউজার (যাকে ট্যাগ করা হয়েছে)
            background.composite(avatar2, 250, 100);  // দ্বিতীয় ইউজার (যে কমান্ড দিয়েছে)
            
            // ফাইল সেভ করার ফোল্ডার নিশ্চিত করা
            const tmpDir = path.join(__dirname, "tmp");
            if (!fs.existsSync(tmpDir)) {
                fs.mkdirSync(tmpDir, { recursive: true });
            }

            const imagePath = path.join(tmpDir, `${one}_${two}_kiss.png`);
            await background.writeAsync(imagePath);

            // ফাইল পাঠানো ও ডিলিট করা
            return message.reply({
                body: "Ummmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmaaaaaaaaaaaaaaaaaaahhhhhhhhh bbz 😘😽🥵",
                attachment: fs.createReadStream(imagePath)
            }, () => {
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            });
            
        } catch (error) {
            console.error(error);
            return message.reply("Something went wrong while generating the image.");
        }
    }
};
