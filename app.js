import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

const { BOT_TOKEN, CHANNEL_ID } = process.env;
const bot = new Telegraf(BOT_TOKEN);

const botState = {
  isActive: false,
  message: "",
};

bot.hears("/post", async (ctx) => {
  botState.isActive = false;
  botState.message = "";

  if (ctx.message.chat.type === "private") {
    ctx.reply("Enter the Ukrainian translate of the next post.");
  }
});

bot.on("message", async (ctx) => {
  const textMessage = ctx.message.text;

  try {
    if (
      ctx.message.chat.type !== "private" &&
      ctx.message.forward_from_chat.id.toString() === CHANNEL_ID &&
      botState.message !== ""
    ) {
      return ctx.reply(botState.message);
    }

    if (
      ctx.message.chat.type === "private" &&
      ctx.message.text !== "/start" &&
      ctx.message.text !== "/post" &&
      botState.isActive
    ) {
      return ctx.reply("Sorry, but request is invalid");
    }

    if (
      ctx.message.chat.type === "private" &&
      ctx.message.text !== "/start" &&
      ctx.message.text !== "/post"
    ) {
      botState.isActive = true;
      botState.message = textMessage;
      return ctx.reply(
        "Good, this text will be used for the Ukrainian translate of the next post",
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Write new translate", callback_data: "edit" }],
            ],
          },
        },
      );
    }
  } catch (e) {
    console.log(e);
  }
});

bot.on("callback_query", async (ctx) => {
  const callbackData = ctx.callbackQuery.data;

  if (callbackData === "edit") {
    ctx.reply("Please, enter the new Ukrainian translate of the next post");
    botState.isActive = false;
    botState.message = "";
  }
});

bot.launch();
