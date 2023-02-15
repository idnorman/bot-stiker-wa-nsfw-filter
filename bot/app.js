const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
  restartOnAuthFailure: true,
  puppeteer: {
    args: ["--no-sandbox"],
  },
  authStrategy: new LocalAuth({ clientId: "client" }),
});

const config = require("./config.json");

// Client Authentication via QR Code
client.on("qr", (qr) => {
  console.log("Scan the QR Code below:");
  qrcode.generate(qr, { small: true });
});

// Client on successful login/already logged in
client.on("ready", () => {
  console.clear();
  console.log("Whatsapp Sticker BOT is active");
});

// Client on receiving message
client.on("message", async (msg) => {
  try {
    if (
      msg.body.toLowerCase() == "/stiker" ||
      msg.body.toLowerCase() == "/sticker"
    ) {
      if (msg.hasMedia) {
        client.sendMessage(msg.from, "Please wait...");
        const imageMimes = [
          "image/gif",
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/svg+xml",
          "image/webp",
        ];
        const media = await msg.downloadMedia();
        const contact = await msg.getContact();
        if (imageMimes.includes(media.mimetype.toLowerCase())) {
          client
            .sendMessage(msg.from, media, {
              sendMediaAsSticker: true,
              stickerName: `${contact.pushname}'s Sticker`,
              stickerAuthor: config.author,
            })
            .then(() => {
              client.sendMessage(msg.from, "Convert success. Thanks!");
            });
        } else {
          client.sendMessage(
            msg.from,
            "Uh oh! We can't convert other than images."
          );
        }
      } else {
        client.sendMessage(
          msg.from,
          "Image not found. Send image with caption /stiker or /sticker"
        );
      }
    }
  } catch (e) {
    console.log(e);
    client.sendMessage(msg.from, "Error: " + e);
  }
});

client.initialize();
