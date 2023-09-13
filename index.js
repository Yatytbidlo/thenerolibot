const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");
const token = "6370214320:AAGEnetUU58toOfH3OMBzeZ2L3zGVirI-P8";
const fs = require("fs");
const csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const bot = new TelegramBot(token, { polling: true });
const app = express();
const csvClientsFile = "clients.csv";
const jsonClientsFile = "clients.json";

app.use(express.json());
app.use(cors());

const webAppUrl = "https://glistening-scone-bba84c.netlify.app/";
const webFormUrl = "https://silly-pudding-3dd27b.netlify.app/";
const webFormUrlSecond = "https://fabulous-meringue-b4f85e.netlify.app/"

// Кнопки /////////////////////////////////////////////////////////////////////////////////

const buttonsStart = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        { text: "Меню", callback_data: "menu" },
        { text: "О нас", callback_data: "info" },
      ],
    ],
  }),
};

const buttonsMenu = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "Наши стили", callback_data: "perfume" }],
      [{text: "Подобрать парфюм", callback_data: "filter"}],
      [{ text: "Официальный сертификат", callback_data: "certificate" }],
      [{ text: "Отзывы наших клиентов", callback_data: "replies" }],
      [{text: "Чат поддержки", url: "https://t.me/DirektologAleksei",
        callback_data: "help"}],
      [
        {
          text: "Instagram",
          url: "https://www.instagram.com/thedata.kz/",
          callback_data: "insta"
        },
      ],
      [{ text: "TikTok",
        url: "https://www.tiktok.com/@thedatakz",
      callback_data: "tt"
    }],
    ],
  }),
};

const buttonsReply = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "Следующий отзыв", callback_data: "next_reply" }],
      [{ text: "Назад в меню", callback_data: "back_menu" }],
    ],
  }),
};

const buttonsReplyEnd = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "Следующий отзыв", callback_data: "end_reply" }],
      [{ text: "Назад в меню", callback_data: "back_menu" }],
    ],
  }),
};

const buttonsReplyEnding = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "Наш парфюм", callback_data: "perfume" }],
      [{ text: "Назад в меню", callback_data: "back_menu" }],
    ],
  }),
};

const buttonHelp = {
  reply_markup: {
    inline_keyboard: [
      [{text: "Переходите по ссылке", url: "https://t.me/DirektologAleksei",
      callback_data: "help"}]
    ]
  }
}

const buttonForm = {
  reply_markup: {
    keyboard: [[{ text: "Оставить данные", web_app: { url: webFormUrl } }]],
  },
};

const buttonSecondForm = {
  reply_markup: {
    keyboard: [[{text: 'Оставить данные', web_app: {url: webFormUrlSecond}}]]
  }
}

const buttonsPerfume = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "Классический стиль️", callback_data: "classic_style" }],
      [{ text: "Спортивный стиль", callback_data: "sport_style" }],
      [{ text: "Современный стиль", callback_data: "modern_style" }],
      [{ text: "Назад в меню", callback_data: "back_menu" }],
    ],
  }),
};

const buttonsFilter = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
        [{text: "Ощущения", callback_data: "feeling"}, {text: "Стойкость аромата", callback_data: "persistence"}],
        [{text: "Шлейф духов", callback_data: "trail"}, {text: "Аккорды парфюма", callback_data: "accords"}],
      [{ text: "Назад в меню", callback_data: "back_menu" }],
    ],
  }),
}

const buttonsAccords = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
        [{text: "Фруктовые(цитрусы, ягоды, композиции)", callback_data: "fruit"}],
        [{text: "Древесные(кедр, ветивер, пачули)", callback_data: "woody"}],
        [{text: "Мускусные(белый мускус, амброксан, цветочные ноты)", callback_data: "musky"}],
        [{text: "Амбровые(бензоин, лабданум, ваниль)", callback_data: "amber"}],
        [{text: "Свеже-прянные(бергамот, кардамон, свежие травы)", callback_data: "fresh"}],
        [{text: "Фужерные(лаванда, герань, дубовый мох)", callback_data: "fougere"}],
        [{text: "Землистый(трюфель, дождевые и минеральные ноты)", callback_data: "earthy"}],
      [{ text: "Назад в меню выбора", callback_data: "back_filter" }],
    ]
  })
}

const buttonsAccordsWithPay = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{text: "Перейти к оплате", callback_data: "pay"}],
      [{text: "Фруктовые(цитрусы, ягоды, композиции)", callback_data: "fruit"}],
      [{text: "Древесные(кедр, ветивер, пачули)", callback_data: "woody"}],
      [{text: "Мускусные(белый мускус, амброксан, цветочные ноты)", callback_data: "musky"}],
      [{text: "Амбровые(бензоин, лабданум, ваниль)", callback_data: "amber"}],
      [{text: "Свеже-прянные(бергамот, кардамон, свежие травы)", callback_data: "fresh"}],
      [{text: "Фужерные(лаванда, герань, дубовый мох)", callback_data: "fougere"}],
      [{text: "Землистый(трюфель, дождевые и минеральные ноты)", callback_data: "earthy"}],
      [{ text: "Назад в меню выбора", callback_data: "back_filter" }],
    ]
  })
}

const buttonsTrail = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
        [{text: "Интимный", callback_data: "intim"}],
      [{text: "Средний", callback_data: "medium_trail"}],
      [{text: "Заметный", callback_data: "perceptible"}],
      [{ text: "Назад в меню выбора", callback_data: "back_filter" }],
    ],
  }),
}

const buttonsTrailWithoutIntim = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{text: "Средний", callback_data: "medium_trail"}],
      [{text: "Заметный", callback_data: "perceptible"}],
      [{ text: "Назад в меню выбора", callback_data: "back_filter" }],
    ],
  }),
}


const buttonsTrailWithoutMedium = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{text: "Перейти к оплате", callback_data: "pay"}],
      [{text: "Интимный", callback_data: "intim"}],
      [{text: "Заметный", callback_data: "perceptible"}],
      [{ text: "Назад в меню выбора", callback_data: "back_filter" }],
    ],
  }),
}

const buttonsTrailWithoutPerceptible = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{text: "Перейти к оплате", callback_data: "pay"}],
      [{text: "Интимный", callback_data: "intim"}],
      [{text: "Средний", callback_data: "medium_trail"}],
      [{ text: "Назад в меню выбора", callback_data: "back_filter" }],
    ],
  }),
}

const buttonsPersistence = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
        [{text:"Средний", callback_data: "medium"}],
      [{text:"Стойкий", callback_data: "strong"}],
      [{text:"Вечный", callback_data: "infinite"}],
      [{ text: "Назад в меню выбора", callback_data: "back_filter" }],
    ]
  })
}

const buttonsPersistenceWithoutInfinite = {
  reply_markup: JSON.stringify({
    inline_keyboard : [
      [{text:"Средний", callback_data: "medium"}],
      [{text:"Стойкий", callback_data: "strong"}],
      [{ text: "Назад в меню выбора", callback_data: "back_filter" }],
    ]
  })
}

const buttonsPersistenceWithoutMeduim = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{text: "Перейти к оплате", callback_data: "pay"}],
      [{text:"Стойкий", callback_data: "strong"}],
      [{text:"Вечный", callback_data: "infinite"}],
      [{ text: "Назад в меню выбора", callback_data: "back_filter" }],
    ]
  })
}
const buttonsPersistenceWithoutStrong = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{text: "Перейти к оплате", callback_data: "pay"}],
      [{text:"Средний", callback_data: "medium"}],
      [{text:"Вечный", callback_data: "infinite"}],
      [{ text: "Назад в меню выбора", callback_data: "back_filter" }],
    ]
  })
}

const buttonsFeeling = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
        [{text: "Хочу пахнуть богато!", callback_data: "neroli_grape"}],
        [{text: "Хочу ощущений будто в лесу после дождя!", callback_data: "lalique"}],
        [{text: "Хочу будто бы я в березовом лесу!", callback_data: "neroli"}],
      [{ text: "Назад в меню выбора", callback_data: "back_filter" }],

    ]
  })
}

const buttonsFeelingWithoutGrape = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{text: "Перейти к оплате", callback_data: "pay"}],
      [{text: "Хочу ощущений будто в лесу после дождя!", callback_data: "lalique"}],
      [{text: "Хочу будто бы я в березовом лесу!", callback_data: "neroli"}],
      [{ text: "Назад в меню выбора", callback_data: "back_filter" }],
    ]
  })
}
const buttonsFeelingWithoutNeroli = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{text: "Перейти к оплате", callback_data: "pay"}],
      [{text: "Хочу пахнуть богато!", callback_data: "neroli_grape"}],
      [{text: "Хочу ощущений будто в лесу после дождя!", callback_data: "lalique"}],
      [{ text: "Назад в меню выбора", callback_data: "back_filter" }],
    ]
  })
}
const buttonsFeelingWithoutLalique = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{text: "Перейти к оплате", callback_data: "pay"}],
      [{text: "Хочу пахнуть богато!", callback_data: "neroli_grape"}],
      [{text: "Хочу будто бы я в березовом лесу!", callback_data: "neroli"}],
      [{ text: "Назад в меню выбора", callback_data: "back_filter" }],
    ]
  })
}

const buttonPay = {
  reply_markup: JSON.stringify( {
    inline_keyboard: [
      [{text: "Условия доставки", callback_data: "delivery"}],
      [
        {
          text: "Оплатить через KaspiPay",
          url: "https://pay.kaspi.kz/pay/pcyzkuxw",
        },
      ],
    ]
  }),
}

const buttonsAfterPerfume = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "Перейти в интернет магазин", web_app: { url: webAppUrl } }],
      [{text: "Условия доставки", callback_data: "delivery"}],
      [{ text: "Назад в меню стилей", callback_data: "back" }]
    ],
  }),
}

const start = () => {

  bot.setMyCommands([
    {command: "/menu", description: "Основное меню"},
    {command: "/info", description: "Условия доставки"},
    {command: "/help", description: "Чат поддержки"}
  ])

  let dataClient;
  let dataClients = [];
  let clients = [];

  // Обработчик на text ///////////////////////////////////////////////////////////////////////
  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text === "/menu") {
      await bot.sendMessage(chatId, "Перeходите к нашим ароматам, смотрите отзывы и сертификат, также следите за новостями через наши соц.сети",
          buttonsMenu)
    }

    if (text === "/info") {
      await bot.sendMessage(chatId, "Доставка бесплатная. Отправка товара начинается после заполнения всех полей в форме. Доставка приходит в день заказа не позже 5 часов вечера. Если заказ после 5 вечера, то переносится на следующий день. С понедельника по субботу!")
    }

    if (text === "/help") {
      await bot.sendMessage(chatId, "Если у вас возникли трудности в процессе оплаты или другие вопросы обращайтесь в чат поддержки!", buttonHelp)
    }

    if (text === "/start") {
      await bot.sendMessage(
          chatId,
          "Здравствуйте! Рады приветствовать вас в мире парфюмерии от компании Neroli!",
          buttonsStart
      );
    }

    if (msg?.web_app_data?.data) {
      try {
        dataClient = JSON.parse(msg?.web_app_data?.data);

        clients.push(dataClient);

        dataClients.push(chatId);

        const csvWriter = createCsvWriter({
          path: csvClientsFile,
          header: [
            {id: "name", title: "ИМЯ"},
            {id: "city", title: "ГОРОД"},
            {id: "phone", title: "ТЕЛЕФОН"},
            {id: "style", title: "СТИЛЬ"},
            {id: "neroli", title: "Neroli"},
            {id: "neroligrape", title: "Neroli Grape"},
            {id: "lalique", title: "Lalique"}
          ],
        });

        await csvWriter.writeRecords(clients).then(() => {
          console.log("Done...");
        });

        await bot.sendMessage(
            chatId,
            `Спасибо за обратную связь, ${dataClient?.name}`
        );
        setTimeout(() => {
          return bot.sendMessage(
              chatId,
              "После сверки данных, товар отправим доставкой по указанному вами адресу!",
              buttonsPerfume
          );
        }, 3000);
      } catch (e) {
        console.log(e);
      }
    }
  });
  // Обработчик на data   //////////////////////////////////////////////////////////////////////

  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    if (data === "menu") {
      return bot.sendMessage(
          chatId,
          "Перeходите к нашим ароматам, смотрите отзывы и сертификат, также следите за новостями через наши соц.сети",
          buttonsMenu
      );
    }

    if (data === "delivery") {
      return bot.sendMessage(chatId, "Доставка бесплатная. Отправка товара начинается после заполнения всех полей в форме. Доставка приходит в день заказа не позже 5 часов вечера. Если заказ после 5 вечера, то переносится на следующий день. С понедельника по субботу!")
    }

    if (data === "back_menu") {
      return bot.sendMessage(
          chatId,
          "Переходите к нашим ароматам, смотрите отзывы и сертификат, также следите за новостями через наши соц.сети",
          buttonsMenu
      );
    }
    // Отзывы ////////////////////////////////////////////////////////////
    if (data === "replies") {
      const firstReply = "images/replyfirst.jpeg";
      const options = {
        width: 790,
        height: 1600,
      };
      await bot.sendPhoto(chatId, firstReply, options);
      return bot.sendMessage(chatId, "Перейти к другому отзыву", buttonsReply);
    }

    if (data === "next_reply") {
      const secondReply = "images/replysecond.jpeg";
      const options = {
        width: 958,
        height: 1600,
      };
      await bot.sendPhoto(chatId, secondReply, options);
      return bot.sendMessage(
          chatId,
          "Перейти к другому отзыву",
          buttonsReplyEnd
      );
    }

    if (data === "end_reply") {
      const thirdReply = "images/replythird.jpeg";
      const options = {
        width: 862,
        height: 1600,
      };
      await bot.sendPhoto(chatId, thirdReply, options);
      return bot.sendMessage(
          chatId,
          "Обратно в меню или перейдите к стилям",
          buttonsReplyEnding
      );
    }

    // Сертификат ///////////////////////////////////////////////////

    if (data === "certificate") {
      const certificatePath = "images/certificate.jpg";
      const options = {
        width: 1275,
        height: 1650,
      };
      await bot.sendPhoto(chatId, certificatePath, options);
      return bot.sendMessage(
          chatId,
          "Обратно в меню или перeйдите к стилям",
          buttonsReplyEnding
      );
    }

    if (data === "back") {
      return bot.sendMessage(
          chatId,
          "Стили подстать вашему образу жизни, выбирайте то что лучше подходит вам!",
          buttonsPerfume
      );
    }

    if (data === "info") {
      return bot.sendMessage(
          chatId,
          "Добро пожаловать в нашего телеграм-бота, который поможет тебе открыть новые ароматические горизонты. Здесь ты сможешь узнать о наших последних коллекциях, получить рекомендации по подбору идеального аромата, а также узнать о специальных предложениях и акциях.\n" +
          "\n" +
          "Для нас парфюмерия - это искусство, и мы стремимся подарить тебе неповторимые впечатления с помощью наших уникальных композиций. Будь в курсе последних трендов, узнавай первым о новинках и наслаждайся каждой нотой, которую мы тщательно подбираем.\n" +
          "\n" +
          "Не стесняйся обратиться к нaм с любыми вопросами или запросами. Мы всегда здесь, чтобы помочь тебе найти тот самый аромат, который отражает твою индивидуальность и подчеркивает твою уникальность.\n" +
          "\n" +
          "Спасибо, что выбрал компанию Neroli. Давай вместе откроем мир чувственных ароматов!",
          buttonsMenu
      );
    }
    if (data.startsWith("https://www.")) {
      return bot.sendMessage(chatId, `Перейдите по ссылке: ${data}`);
    }

    if (data === "perfume") {
      const firstFotoPath = "images/firstfoto.jpg";
      const options = {
        width: 1920,
        height: 1080,
        caption: "ПАРФЮМ NEROLI УНИКАЛЬНОСТЬ В КАЖДОЙ НОТЕ ВАШЕГО АРОМАТА",
      };

      await bot.sendPhoto(chatId, firstFotoPath, options);
      return bot.sendMessage(
          chatId,
          "Стили подстать вашему образу жизни, выбирайте то что лучше подходит вам!",
          buttonsPerfume
      );
    }
    // Подбор парфюма //////////////////////////////////////////////

    if (data === "filter") {
      const filterPhoto = "images/filter.jpg"
      const options = {
        width: 400,
        height: 400,
        caption: "ПОДБЕРЁМ ДЛЯ ВАС ПАРФЮМ В СООТВЕТСТВИИ С ВАШИМИ ЖЕЛАНИЯМИ",
      }
      await bot.sendPhoto(chatId, filterPhoto, options)
      await bot.sendMessage(chatId, "Выбирайте ароматы из следуюших категории!", buttonsFilter)
    }

    if (data === "accords") {
      bot.sendMessage(chatId, "Выбирайте то как будет звучать ваш парфюм!", buttonsAccords)
    }

    if (data === "fruit") {
      const neroliPhoto = "images/neroli.jpg"
      const options = {
        width: 400,
        height: 400,
        caption: "Aventus Creed — это аромат для мужчин, он принадлежит к группе шипровые фруктовые. Верхние ноты: Ананас, Бергамот, Черная смородина и Яблоко; средние ноты: Береза, Пачули, Марокканский жасмин и Роза; базовые ноты: Мускус, Дубовый мох, Серая амбра и Ваниль. ЦЕНА: ...",
      }
      await bot.sendPhoto(chatId, neroliPhoto, options)

      const neroliGrapePhoto = "images/neroligrape.jpg"

      const options1 = {
        width: 400,
        height: 400,
        caption: "Tygar Bvlgari — это аромат для мужчин, он принадлежит к группе цитрусовые фужерные. Ноты аромата: Грейпфрукт, Аmbroxan, Древесные ноты. ЦЕНА: ...",
      }
      await bot.sendPhoto(chatId, neroliGrapePhoto, options1)
      await bot.sendMessage(chatId, "Переходите в раздел оплаты или выбирайте другие аккорды!", buttonsAccordsWithPay)
    }

    if (data === 'woody') {
      const neroliPhoto = "images/neroli.jpg"
      const options = {
        width: 400,
        height: 400,
        caption: "Aventus Creed — это аромат для мужчин, он принадлежит к группе шипровые фруктовые. Верхние ноты: Ананас, Бергамот, Черная смородина и Яблоко; средние ноты: Береза, Пачули, Марокканский жасмин и Роза; базовые ноты: Мускус, Дубовый мох, Серая амбра и Ваниль. ЦЕНА: ...",
      }
      await bot.sendPhoto(chatId, neroliPhoto, options)


      const neroliGrapePhoto = "images/neroligrape.jpg"

      const options1 = {
        width: 400,
        height: 400,
        caption: "Tygar Bvlgari — это аромат для мужчин, он принадлежит к группе цитрусовые фужерные. Ноты аромата: Грейпфрукт, Аmbroxan, Древесные ноты. ЦЕНА: ...",
      }
      await bot.sendPhoto(chatId, neroliGrapePhoto, options1)

      const laliquePhoto = "images/lalique.jpg"
      const options2 = {
        width: 400,
        height: 400,
        caption: "Encre Noire Lalique — это аромат для мужчин, он принадлежит к группе древесные фужерные. Верхняя нота: Кипарис; средняя нота: Ветивер; базовые ноты: Кашемировое дерево и Мускус. ЦЕНА: ...",
      }
      await bot.sendPhoto(chatId, laliquePhoto, options2)
      await bot.sendMessage(chatId, "Переходите в раздел оплаты или выбирайте другие аккорды!", buttonsAccordsWithPay)
    }

    if (data === 'musky') {
      const neroliPhoto = "images/neroli.jpg"
      const options = {
        width: 400,
        height: 400,
        caption: "Aventus Creed — это аромат для мужчин, он принадлежит к группе шипровые фруктовые. Верхние ноты: Ананас, Бергамот, Черная смородина и Яблоко; средние ноты: Береза, Пачули, Марокканский жасмин и Роза; базовые ноты: Мускус, Дубовый мох, Серая амбра и Ваниль. ЦЕНА: ...",
      }
      await bot.sendPhoto(chatId, neroliPhoto, options)

      const neroliGrapePhoto = "images/neroligrape.jpg"

      const options1 = {
        width: 400,
        height: 400,
        caption: "Tygar Bvlgari — это аромат для мужчин, он принадлежит к группе цитрусовые фужерные. Ноты аромата: Грейпфрукт, Аmbroxan, Древесные ноты. ЦЕНА: ...",
      }
      await bot.sendPhoto(chatId, neroliGrapePhoto, options1)


      const laliquePhoto = "images/lalique.jpg"
      const options2 = {
        width: 400,
        height: 400,
        caption: "Encre Noire Lalique — это аромат для мужчин, он принадлежит к группе древесные фужерные. Верхняя нота: Кипарис; средняя нота: Ветивер; базовые ноты: Кашемировое дерево и Мускус. ЦЕНА: ...",
      }
      await bot.sendPhoto(chatId, laliquePhoto, options2)
      await bot.sendMessage(chatId, "Переходите в раздел оплаты или выбирайте другие аккорды!", buttonsAccordsWithPay)
    }

    if (data === 'amber') {
      const neroliGrapePhoto = "images/neroligrape.jpg"

      const options1 = {
        width: 400,
        height: 400,
        caption: "Tygar Bvlgari — это аромат для мужчин, он принадлежит к группе цитрусовые фужерные. Ноты аромата: Грейпфрукт, Аmbroxan, Древесные ноты. ЦЕНА: ...",
      }
      await bot.sendPhoto(chatId, neroliGrapePhoto, options1)
      await bot.sendMessage(chatId, "Переходите в раздел оплаты или выбирайте другие аккорды!", buttonsAccordsWithPay)
    }

    if (data === 'fresh') {
      const neroliPhoto = "images/neroli.jpg"
      const options = {
        width: 400,
        height: 400,
        caption: "Aventus Creed — это аромат для мужчин, он принадлежит к группе шипровые фруктовые. Верхние ноты: Ананас, Бергамот, Черная смородина и Яблоко; средние ноты: Береза, Пачули, Марокканский жасмин и Роза; базовые ноты: Мускус, Дубовый мох, Серая амбра и Ваниль. ЦЕНА: ...",
      }
      await bot.sendPhoto(chatId, neroliPhoto, options)


      const neroliGrapePhoto = "images/neroligrape.jpg"

      const options1 = {
        width: 400,
        height: 400,
        caption: "Tygar Bvlgari — это аромат для мужчин, он принадлежит к группе цитрусовые фужерные. Ноты аромата: Грейпфрукт, Аmbroxan, Древесные ноты. ЦЕНА: ...",
      }
      await bot.sendPhoto(chatId, neroliGrapePhoto, options1)
      await bot.sendMessage(chatId, "Переходите в раздел оплаты или выбирайте другие аккорды!", buttonsAccordsWithPay)
    }

    if (data === 'fougere') {
      const laliquePhoto = "images/lalique.jpg"
      const options2 = {
        width: 400,
        height: 400,
        caption: "Encre Noire Lalique — это аромат для мужчин, он принадлежит к группе древесные фужерные. Верхняя нота: Кипарис; средняя нота: Ветивер; базовые ноты: Кашемировое дерево и Мускус. ЦЕНА: ...",
      }
      await bot.sendPhoto(chatId, laliquePhoto, options2)
      await bot.sendMessage(chatId, "Переходите в раздел оплаты или выбирайте другие аккорды!", buttonsAccordsWithPay)
    }

    if (data === 'earthy') {
      const laliquePhoto = "images/lalique.jpg"
      const options2 = {
        width: 400,
        height: 400,
        caption: "Encre Noire Lalique — это аромат для мужчин, он принадлежит к группе древесные фужерные. Верхняя нота: Кипарис; средняя нота: Ветивер; базовые ноты: Кашемировое дерево и Мускус. ЦЕНА: ...",
      }
      await bot.sendPhoto(chatId, laliquePhoto, options2)
      await bot.sendMessage(chatId, "Переходите в раздел оплаты или выбирайте другие аккорды!", buttonsAccordsWithPay)
    }

    if (data === "feeling") {
      await bot.sendMessage(chatId, "КАК ВЫ ХОТИТЕ БЛАГОУХАТЬ И ПАХНУТЬ?", buttonsFeeling)
    }

    if (data === "back_filter") {
      await bot.sendMessage(chatId, "Выбирайте ароматы из следуюших категории!", buttonsFilter)
    }

    if (data === "neroli_grape") {
      const neroliGrapePhoto = "images/neroligrape.jpg"
      const options = {
        width: 400,
        height: 400,
        caption: "Tygar Bvlgari — это аромат для мужчин, он принадлежит к группе цитрусовые фужерные. Ноты аромата: Грейпфрукт, Аmbroxan, Древесные ноты. ЦЕНА: ...",
      }
      await bot.sendPhoto(chatId, neroliGrapePhoto, options)
      await bot.sendMessage(chatId, "Переходите в раздел оплаты или выбирайте другие ощущения!", buttonsFeelingWithoutGrape)
    }
    if (data === "neroli") {
      const neroliPhoto = "images/neroli.jpg"
      const options = {
        width: 400,
        height: 400,
        caption: "Aventus Creed — это аромат для мужчин, он принадлежит к группе шипровые фруктовые. Верхние ноты: Ананас, Бергамот, Черная смородина и Яблоко; средние ноты: Береза, Пачули, Марокканский жасмин и Роза; базовые ноты: Мускус, Дубовый мох, Серая амбра и Ваниль. ЦЕНА: ...",
      }
      await bot.sendPhoto(chatId, neroliPhoto, options)
      await bot.sendMessage(chatId, "Переходите в раздел оплаты или выбирайте другие ощущения!", buttonsFeelingWithoutNeroli)
    }
    if (data === "lalique") {
      const laliquePhoto = "images/lalique.jpg"
      const options = {
        width: 400,
        height: 400,
        caption: "Encre Noire Lalique — это аромат для мужчин, он принадлежит к группе древесные фужерные. Верхняя нота: Кипарис; средняя нота: Ветивер; базовые ноты: Кашемировое дерево и Мускус. ЦЕНА: ...",
      }
      await bot.sendPhoto(chatId, laliquePhoto, options)
      await bot.sendMessage(chatId, "Переходите в раздел оплаты или выбирайте другие ощущения!", buttonsFeelingWithoutLalique)
    }

    if (data === "persistence") {
      await bot.sendMessage(chatId, "Выбирайте ароматы, которые больше всего подходят вам!", buttonsPersistence)
    }

    if (data === "infinite") {
      await bot.sendMessage(chatId, "К сожелению пока товара нет в наличии по указанной категории. Выберите другие варианты!", buttonsPersistenceWithoutInfinite)

    }

    if (data === "medium") {
        const neroliPhoto = "images/neroli.jpg"
        const options = {
          width: 400,
          height: 400,
          caption: "Aventus Creed — это аромат для мужчин, он принадлежит к группе шипровые фруктовые. Верхние ноты: Ананас, Бергамот, Черная смородина и Яблоко; средние ноты: Береза, Пачули, Марокканский жасмин и Роза; базовые ноты: Мускус, Дубовый мох, Серая амбра и Ваниль. ЦЕНА: ...",
        }
        await bot.sendPhoto(chatId, neroliPhoto, options)

      const laliquePhoto = "images/lalique.jpg"
        const options1 = {
          width: 400,
          height: 400,
          caption: "Encre Noire Lalique — это аромат для мужчин, он принадлежит к группе древесные фужерные. Верхняя нота: Кипарис; средняя нота: Ветивер; базовые ноты: Кашемировое дерево и Мускус. ЦЕНА: ...",
        }
        await bot.sendPhoto(chatId, laliquePhoto, options1)
        await bot.sendMessage(chatId, "Переходите в раздел оплаты или выбирайте другие варианты!", buttonsPersistenceWithoutMeduim)
    }
    if (data === "strong") {
      const neroliGrapePhoto = "images/neroligrape.jpg"
      const options = {
        width: 400,
        height: 400,
        caption: "Tygar Bvlgari — это аромат для мужчин, он принадлежит к группе цитрусовые фужерные. Ноты аромата: Грейпфрукт, Аmbroxan, Древесные ноты. ЦЕНА: ...",
      }
      await bot.sendPhoto(chatId, neroliGrapePhoto, options)
      await bot.sendMessage(chatId, "Переходите в раздел оплаты или выбирайте другие варианты!", buttonsPersistenceWithoutStrong)
    }

    if (data === "trail") {
      await bot.sendMessage(chatId, "Насколько близкий запах парфюма вы предпочитаете?", buttonsTrail)
    }

    if (data === "intim") {
      await bot.sendMessage(chatId, "К сожелению пока товара нет в наличии по указанной категории. Выберите другие варианты!", buttonsTrailWithoutIntim)
    }

    if (data === "medium_trail") {
      const neroliPhoto = "images/neroli.jpg"
      const options = {
        width: 400,
        height: 400,
        caption: "Aventus Creed — это аромат для мужчин, он принадлежит к группе шипровые фруктовые. Верхние ноты: Ананас, Бергамот, Черная смородина и Яблоко; средние ноты: Береза, Пачули, Марокканский жасмин и Роза; базовые ноты: Мускус, Дубовый мох, Серая амбра и Ваниль. ЦЕНА: ...",
      }
      await bot.sendPhoto(chatId, neroliPhoto, options)

      const laliquePhoto = "images/lalique.jpg"
      const options1 = {
        width: 400,
        height: 400,
        caption: "Encre Noire Lalique — это аромат для мужчин, он принадлежит к группе древесные фужерные. Верхняя нота: Кипарис; средняя нота: Ветивер; базовые ноты: Кашемировое дерево и Мускус. ЦЕНА: ...",
      }
      await bot.sendPhoto(chatId, laliquePhoto, options1)
      await bot.sendMessage(chatId, "Переходите в раздел оплаты или выбирайте другие варианты!", buttonsTrailWithoutMedium)
    }

    if (data === "perceptible") {
      const neroliGrapePhoto = "images/neroligrape.jpg"
      const options = {
        width: 400,
        height: 400,
        caption: "Tygar Bvlgari — это аромат для мужчин, он принадлежит к группе цитрусовые фужерные. Ноты аромата: Грейпфрукт, Аmbroxan, Древесные ноты. ЦЕНА: ...",
      }
      await bot.sendPhoto(chatId, neroliGrapePhoto, options)
      await bot.sendMessage(chatId, "Переходите в раздел оплаты или выбирайте другие варианты!", buttonsTrailWithoutPerceptible)
    }

    if (data === "pay") {
      await bot.sendMessage(chatId, "После оплаты необходимо оставить информацию о себе, сверив данные товар будет отправлен к вам доставкой!", buttonPay)
      await bot.sendMessage(chatId, "❗️Заполните форму нажав на кнопку снизу. Обязательно ознакомьтесь с условиями доставки❗️", buttonSecondForm)
    }

    // Стили парфюма ///////////////////////////////////////////////

    try {
      if (data === "classic_style") {
        const classicPhoto = "images/classic.jpg";
        const options = {
          width: 926,
          height: 1240,
          caption:
              "Классический стиль - это символ элегантности, деликатности и превосходства. Именно эти качества вы найдете в нашем аромете Neroli. Свежие ноты бергамота и яблока, мягкие акценты розмарина и пачули, подчеркнутые нежной ванилью и мускусом, делают этот аромат идеальным дополнением к классическому стилю",
        };
        await bot.sendPhoto(chatId, classicPhoto, options);
        await bot.sendMessage(
            chatId,
            "Переходите в интернет магазин или выберите другой стиль",
            buttonsAfterPerfume
        );
        await bot.sendMessage(chatId, '❗️После покупки, оставьте свои данные, также обязательно ознакомьтесь с условиями доставки!❗️', buttonForm)
      }
      if (data === "sport_style") {
        const sportPhoto = "images/sport.jpg";
        const options = {
          width: 926,
          height: 1240,
          caption:
              "Спортивный стиль в одежде часто характеризуется его простотой и функциональностью. Neroli, с его легким и независимым ароматом, дополняет эту простоту, придавая вам ощущения свежести и энергии, будь вы на тренировке, на прогулке или просто наслаждаетесь активным днём",
        };
        await bot.sendPhoto(chatId, sportPhoto, options);
        await bot.sendMessage(
            chatId,
            "Переходите в интернет магазин или выберите другой стиль",
            buttonsAfterPerfume
        );
        await bot.sendMessage(chatId, '❗️После покупки, оставьте свои данные, также обязательно ознакомьтесь с условиями доставки!❗️', buttonForm)
      }
      if (data === "modern_style") {
        const modernPhoto = "images/modern.jpg";
        const options = {
          width: 926,
          height: 1240,
          caption:
              "Современный стиль - это эксперименты, дерзость и новаторство. Именно эти качества вы найдете в нашем аромате Neroli. Его свежие и интригующие ноты идеально сочетаются с самыми новыми тендециями моды",
        };
        await bot.sendPhoto(chatId, modernPhoto, options);
        await bot.sendMessage(
            chatId,
            "Переходите в интернет магазин или выберите другой стиль",
            buttonsAfterPerfume
        );
        await bot.sendMessage(chatId, '❗️После покупки, оставьте свои данные, также обязательно ознакомьтесь с условиями доставки!❗️', buttonForm)
      }
    } catch (e) {
      console.log(e);
    }
  });

  bot.on("polling_error", (error) => {
    console.log(error.code);
  });


  app.post("/web-data", async (req, res) => {
    const {queryId, products, totalPrice} = req.body;
    try {
      await bot.answerWebAppQuery(queryId, {
        type: "article",
        id: queryId,
        title: "Успешная покупка",
        input_message_content: {
          message_text: `Вы выбрали: ${products
              .map((item) => item.title)
              .join(", ")}, сумма оплаты составила ${totalPrice}₸. После оплаты необходимо оставить информацию о себе, сверив данные товар будет отправлен к вам доставкой!`,
        },
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Оплатить через KaspiPay",
                url: "https://pay.kaspi.kz/pay/pcyzkuxw",
                callback_data: "pay",
              },
            ],
          ]
        },
      });

      res.status(200).json({});
    } catch (e) {
      await bot.answerWebAppQuery(queryId, {
        type: "article",
        id: queryId,
        title: "Не удалось произвести оплату",
        input_message_content: {message_text: "Не удалось произвести оплату"},
      });
      return res.status(500).json({});
    }
  });

  const PORT = 3000;

  app.listen(PORT, () => console.log("server started on PORT " + PORT));

  app.post("/app-data", async (req, res) => {
    const {queryId, products, totalPrice} = req.body;
    try {
      await bot.answerWebAppQuery(queryId, {
        type: "article",
        id: queryId,
        title: "Успешная покупка",
        input_message_content: {
          message_text: `Вы выбрали: ${products
              .map((item) => item.title)
              .join(", ")}, сумма оплаты составила ${totalPrice}₸. После оплаты необходимо оставить информацию о себе, сверив данные товар будет отправлен к вам доставкой!`,
        },
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Оплатить через KaspiPay",
                url: "https://pay.kaspi.kz/pay/pcyzkuxw",
              },
            ],
          ]
        },
      });

      res.status(200).json({});
    } catch (e) {
      await bot.answerWebAppQuery(queryId, {
        type: "article",
        id: queryId,
        title: "Не удалось произвести оплату",
        input_message_content: {message_text: "Не удалось произвести оплату"},
      });
      return res.status(500).json({});
    }
  });

}

start();