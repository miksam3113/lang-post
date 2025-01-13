import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

const { BOT_TOKEN } = process.env;
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

  try {
    if (
      ctx.message.chat.type !== "private" &&
      ctx.message.forward_from_chat !== undefined &&
      botState.message !== ""
    ) {
      return ctx.replyWithMarkdownV2(botState.message);
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

      const regExp = /([*_~`>#+\-=|{}.!\\[\]()])/g;
      const entities = ctx.message.entities || [];
      let stateMessage = '';
      let indexMessage = 0;

      entities.forEach(entity => {
        if (entity.offset > indexMessage) {
          stateMessage += ctx.message.text.slice(indexMessage, entity.offset).replace(regExp, '\\$1');
        }

        const entityText = ctx.message.text.substr(entity.offset, entity.length).replace(regExp, '\\$1');

        switch (entity.type) {
          case 'bold':
            stateMessage += `*${entityText}*`;
            break;
          case 'italic':
            stateMessage += `_${entityText}_`;
            break;
          case 'underline':
            stateMessage += `__${entityText}__`;
            break;
          case 'strikethrough':
            stateMessage += `~${entityText}~`;
            break;
          case 'code':
            stateMessage += `\`${entityText}\``;
            break;
          case 'pre':
            stateMessage += `\`\`\`\n${entityText}\n\`\`\``;
            break;
          case 'text_link':
            stateMessage += `[${entityText}](${entity.url})`;
            break;
          case 'text_mention':
            stateMessage += `[${entityText}](tg://user?id=${entity.user.id})`;
            break;
          case 'email':
            stateMessage += entityText.replace(regExp, '\\$1');
            break;
          default:
            stateMessage += entityText.replace(regExp, '\\$1');;
            break;
        }

        indexMessage = entity.offset + entity.length;
      });

      if (indexMessage < ctx.message.text.length) {
        stateMessage += ctx.message.text.slice(indexMessage).replace(regExp, '\\$1');
      }

      botState.message = stateMessage;
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
