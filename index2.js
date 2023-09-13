// const TelegramBot = require('node-telegram-bot-api');
// const express = require('express');
// const cors = require('cors');
// const fs = require('fs');
// const csv = require('csv-parser')
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;
// const bot = new TelegramBot(token, {polling: true});
// const app = express();
// const csvClientsFile = 'clients.csv'
// const jsonClientsFile = 'clients.json'
// let dataClient
// let dataClients = [];

app.use(express.json());
app.use(cors())

const webAppUrl ='https://glistening-scone-bba84c.netlify.app/'
const webFormUrl = 'https://silly-pudding-3dd27b.netlify.app/'


// Кнопки /////////////////////////////////////////////////////////////////////////////////

const buttonsStart = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: "Меню", callback_data:"menu"}, {text: "О нас", callback_data: "info"}]
        ]
    })
}

const buttonsMenu = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Наш парфюм🌟', callback_data:'perfume'}],
            [{text: 'Официальный сертификат🧐', callback_data:'certificate'}],
            [{text: 'Отзывы наших клиентов👀', callback_data: 'replies'}],
            [{text: "Instagram📷", callback_data: "https://www.instagram.com/thedata.kz/"}],
            [{text: "TikTok📱", callback_data: "https://www.tiktok.com/@thedatakz",}]
        ]
    })
}

const buttonsReply = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Следующий отзыв', callback_data: 'next_reply'}],
            [{text:'Назад в меню', callback_data: 'back_menu'}],
        ]
    })
}

const buttonsReplyEnd = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Следующий отзыв', callback_data: 'end_reply'}],
            [{text:'Назад в меню', callback_data: 'back_menu'}],
        ]
    })
}

const buttonsReplyEnding = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Наш парфюм🌟', callback_data:'perfume'}],
            [{text:'Назад в меню', callback_data: 'back_menu'}],
        ]
    })
}

const buttonForm = {
    reply_markup: {
        keyboard: [
            [{text: "Пройти регистрацию", web_app: {url:webFormUrl}}]
        ]
    }
}

const buttonsPerfume = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text:"🤵‍♂️Классический стиль🤵‍♀️", callback_data:"classic_style"}],
            [{text:"🏋️Спортивный стиль⚽️", callback_data:"sport_style"}],
            [{text:"💻Современный стиль📱", callback_data:"modern_style"}],
            [{text:'Назад в меню ↩️', callback_data: 'back_menu'}],
        ]
    })
}

const buttonsAfterPerfume = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: "Перейти в интернет магазин", web_app: {url:webAppUrl}}],
            [{text: "Назад в меню стилей", callback_data: "back"}]
        ]
    })
}


const start = () => {

    // Обработчик на text ///////////////////////////////////////////////////////////////////////
    bot.on("message",  async (msg) => {
        const text = msg.text;
        const chatId = msg.chat.id;

        if (text === "/start") {
            await bot.sendMessage(chatId, "Привет! Рад приветствовать тебя в мире парфюмерии от компании Neroli! 🌸✨", buttonsStart)
        }

        if (msg?.web_app_data?.data) {
            try {
                dataClient = JSON.parse(msg?.web_app_data?.data)

                dataClients.push(dataClient)

                const csvWriter = createCsvWriter({
                    path: csvClientsFile,
                    header: [
                        {id: 'name', title: 'ИМЯ'},
                        {id: 'city', title: 'ГОРОД'},
                        {id: 'phone', title: 'ТЕЛЕФОН'}
                    ]
                });

                await csvWriter.writeRecords(dataClients)
                    .then(() => {
                        console.log('Done...')
                    })

                fs.readFile(csvClientsFile, 'utf8', (err, data) => {
                    if (err) {
                        console.error("Ошибка чтения файла clients.csv:", err);
                        // Если файла нет, создаем пустой массив для хранения данных
                        dataClients = [];
                    } else {
                        try {
                            // Читаем данные из CSV и добавляем в массив dataClients
                            dataClients = data
                                .split('\n')
                                .map((line) => JSON.stringify(line))
                                .filter((client) => client.name && client.city && client.phone);
                            console.log('Данные из CSV загружены:', dataClients);

                            fs.writeFile(jsonClientsFile, JSON.stringify(dataClients), 'utf8', (err) => {
                                if (err) {
                                    console.error("Ошибка сохранения clients.json:", err);
                                } else {
                                    console.log("Днные успешно сохранены в clients.json.");
                                }
                            });
                        } catch (parseErr) {
                            console.error("Ошибка парсинга данных из CSV:", parseErr);
                            dataClients = [];
                        }
                    }
                })

                await bot.sendMessage(chatId, `Спасибо за обратную связь, ${dataClient?.name}😸`);
                await bot.sendSticker(chatId, 'images/sticker.webp');
                setTimeout( () => {
                    return bot.sendMessage(chatId, 'Переходите в веб-приложение или присмотрите для себя другие стили🤔', buttonsAfterPerfume)}, 3000)
            } catch (e) {
                console.log(e)
            }
        }
    })
// Обработчик на data   //////////////////////////////////////////////////////////////////////

    bot.on("callback_query", async (msg) => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        const existingClient = dataClients.find((client) => client.name === dataClient.name);


        if (data === "menu") {
            return bot.sendMessage(chatId, "Перeходите к нашим ароматам, смотрите отзывы и сертификат, также следите за новостями через наши соц.сети👇", buttonsMenu)
        }

        if (data === 'back_menu') {
            return bot.sendMessage(chatId, "Переходите к нашим ароматам, смотрите отзывы и сертификат, также следите за новостями через наши соц.сети👇", buttonsMenu)
        }
// Отзывы ////////////////////////////////////////////////////////////
        if (data === 'replies') {
            const firstReply = "images/replyfirst.jpeg"
            const options = {
                width: 790,
                height: 1600,
            }
            await bot.sendPhoto(chatId, firstReply, options)
            return bot.sendMessage(chatId, 'Перейти к другому отзыву', buttonsReply)
        }

        if (data === 'next_reply') {
            const secondReply = "images/replysecond.jpeg"
            const options = {
                width: 958,
                height: 1600,
            }
            await bot.sendPhoto(chatId, secondReply, options)
            return bot.sendMessage(chatId, 'Перейти к другому отзыву', buttonsReplyEnd)
        }

        if (data === 'end_reply') {
            const thirdReply = "images/replythird.jpeg"
            const options = {
                width: 862,
                height: 1600,
            }
            await bot.sendPhoto(chatId, thirdReply, options)
            return bot.sendMessage(chatId, 'Обратно в меню или перейдите к стилям😊', buttonsReplyEnding)
        }

// Сертификат ///////////////////////////////////////////////////

        if (data === 'certificate') {
            const certificatePath = "images/certificate.jpg"
            const options = {
                width: 1275,
                height: 1650,
            }
            await bot.sendPhoto(chatId, certificatePath, options)
            return bot.sendMessage(chatId, 'Обратно в меню или перейдите к стилям😊', buttonsReplyEnding)
        }

        if (data === "back") {
            return bot.sendMessage(chatId, "Стили подстать вашему образу жизни, выбирайте то что лучше подходит вам!👇",  buttonsPerfume)
        }

        if (data === "info") {
            return bot.sendMessage(chatId, "Добро пожаловать в нашего телеграм-бота, который поможет тебе открыть новые ароматические горизонты. Здесь ты сможешь узнать о наших последних коллекциях, получить рекомендации по подбору идеального аромата, а также узнать о специальных предложениях и акциях.\n" +
                "\n" +
                "Для нас парфюмерия - это искусство, и мы стремимся подарить тебе неповторимые впечатления с помощью наших уникальных композиций. Будь в курсе последних трендов, узнавай первым о новинках и наслаждайся каждой нотой, которую мы тщательно подбираем.\n" +
                "\n" +
                "Не стесняйся обратиться к нaм с любыми вопросами или запросами. Мы всегда здесь, чтобы помочь тебе найти тот самый аромат, который отражает твою индивидуальность и подчеркивает твою уникальность.\n" +
                "\n" +
                "Спасибо, что выбрал компанию Neroli. Давай вместе откроем мир чувственных ароматов! 💫🌿", buttonsMenu)
        }
        if (data.startsWith("https://www.")) {
            return bot.sendMessage(chatId, `Перейдите по ссылке: ${data}`);
        }


        if (data === "perfume") {
            const firstFotoPath = "images/firstfoto.jpg"
            const options = {
                width: 1920,
                height: 1080,
                caption: "🔥ПАРФЮМ “NEROLI”: УНИКАЛЬНОСТЬ В КАЖДОЙ НОТЕ ВАШЕГО АРОМАТА🔥"
            }

            await bot.sendPhoto(chatId, firstFotoPath, options)
            return bot.sendMessage(chatId, "Стили подстать вашему образу жизни, выбирайте то что лучше подходит вам!👇",  buttonsPerfume)
        }

        // Стили парфюма ///////////////////////////////////////////////

        try {
            if (data === "classic_style") {
                const classicPhoto = "images/classic.jpg"
                const options = {
                    width: 926,
                    height: 1240,
                    caption: "✨Классический стиль - это символ элегантности, деликатности и превосходства. Именно эти качества вы найдете в нашем аромете Neroli. Свежие ноты бергамота и яблока, мягкие акценты розмарина и пачули, подчеркнутые нежной ванилью и мускусом, делают этот аромат идеальным дополнением к классическому стилю✨"
                }
                await bot.sendPhoto(chatId, classicPhoto, options)

                if (!existingClient) {
                    // Если клиент не зарегистрирован, предложим ему пройти регистрацию
                    return bot.sendMessage(chatId, "Для доступа к товару необходимо пройти регистрацию🧐", buttonForm);
                } else {
                    // Если клиент зарегистрирован, покажем кнопку для перехода в интернет-магазин
                    return bot.sendMessage(chatId, "Переходите в интернет магазин или выберите другой стиль🤔", buttonsAfterPerfume);
                }
            }
            if (data === "sport_style") {
                const sportPhoto = "images/sport.jpg"
                const options = {
                    width: 926,
                    height: 1240,
                    caption: "💪Спортивный стиль в одежде часто характеризуется его простотой и функциональностью. Neroli, с его легким и независимым ароматом, дополняет эту простоту, придавая вам ощущения свежести и энергии, будь вы на тренировке, на прогулке или просто наслаждаетесь активным днём💪"
                }
                await bot.sendPhoto(chatId, sportPhoto, options)

                if (!existingClient) {
                    // Если клиент не зарегистрирован, предложим ему пройти регистрацию
                    return bot.sendMessage(chatId, "Для доступа к товару необходимо пройти регистрацию🧐", buttonForm);
                } else {
                    // Если клиент зарегистрирован, покажем кнопку для перехода в интернет-магазин
                    return bot.sendMessage(chatId, "Переходите в интернет магазин или выберите другой стиль🤔", buttonsAfterPerfume);
                }
            }
            if (data === "modern_style") {
                const modernPhoto = "images/modern.jpg"
                const options = {
                    width: 926,
                    height: 1240,
                    caption: "⚡️Современный стиль - это эксперименты, дерзость и новаторство. Именно эти качества вы найдете в нашем аромате Neroli. Его свежие и интригующие ноты идеально сочетаются с самыми новыми тендециями моды⚡️"
                }
                await bot.sendPhoto(chatId, modernPhoto, options)

                if (!existingClient) {
                    // Если клиент не зарегистрирован, предложим ему пройти регистрацию
                    return bot.sendMessage(chatId, "Для доступа к товару необходимо пройти регистрацию🧐", buttonForm);
                } else {
                    // Если клиент зарегистрирован, покажем кнопку для перехода в интернет-магазин
                    return bot.sendMessage(chatId, "Переходите в интернет магазин или выберите другой стиль🤔", buttonsAfterPerfume);
                }
            }
        } catch (e) {
            console.log(e)
            console.log(dataClients)
        }

    })

    bot.on('polling_error', (error) => {
        console.log(error.code);
    });

}


start()

app.post('/web-data', async (req, res) => {
    const {queryId, products, totalPrice} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка🥳',
            input_message_content: {message_text: `🥳 Поздравляю с покупкой ${products.map(item => item.title).join(', ')}, сумма оплаты составила ${totalPrice}₸.`}
        })
        return res.status(200).json({})
    } catch (e) {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Не удалось произвести оплату🤨',
            input_message_content: {message_text: 'Не удалось произвести оплату🤨'}
        })
        return res.status(500).json({})
    }
})

const PORT = 3000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))