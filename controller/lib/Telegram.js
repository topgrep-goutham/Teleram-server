const { axiosInstance } = require("./axios");
const { getGenAIResponse } = require("./GenAi");
const { advancedSpellCorrection, enhanceGrammar, detectCity, generateCategoryMismatchMessage, validateUserInput, formatAIResponse, detectIntentFromMessage, generateSmartSuggestion, logUserActivity } = require("./utilities");

const userSessions = {};

const BOT_CONFIG = {
    name: "Smart City Explorer",
    description: "Your intelligent guide to explore cities like never before!",
    categories: {
        historical: "🏛️ Historical Places",
        tourist: "🎯 Tourist Attractions",
        food: "🍽️ Food & Dining",
        transport: "🚌 Transportation",
        hotels: "🏨 Accommodation",
        events: "🎪 Events & Entertainment",
        shopping: "🛍️ Shopping",
        parks: "🌳 Parks & Recreation"
    }
};

const KEYBOARDS = {
    main_menu: {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "🏛️ Historical Places", callback_data: "cat_historical" },
                    { text: "🎯 Tourist Attractions", callback_data: "cat_tourist" }
                ],
                [
                    { text: "🍽️ Food & Dining", callback_data: "cat_food" },
                    { text: "🚌 Transportation", callback_data: "cat_transport" }
                ],
                [
                    { text: "🏨 Accommodation", callback_data: "cat_hotels" },
                    { text: "🎪 Events & Entertainment", callback_data: "cat_events" }
                ],
                [
                    { text: "🛍️ Shopping", callback_data: "cat_shopping" },
                    { text: "🌳 Parks & Recreation", callback_data: "cat_parks" }
                ],
                [
                    { text: "🔧 Utilities", callback_data: "utilities" },
                    { text: "ℹ️ Help", callback_data: "help" }
                ]
            ]
        }
    },

    utilities_menu: {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "🌤️ Weather", callback_data: "util_weather" },
                    { text: "💱 Currency", callback_data: "util_currency" }
                ],
                [
                    { text: "🗣️ Translate", callback_data: "util_translate" },
                    { text: "🆘 Emergency", callback_data: "util_emergency" }
                ],
                [
                    { text: "📍 Set Location", callback_data: "util_location" },
                    { text: "⚙️ Settings", callback_data: "settings" }
                ],
                [
                    { text: "🔙 Back to Menu", callback_data: "main_menu" }
                ]
            ]
        }
    },

    back_to_menu: {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🔙 Back to Main Menu", callback_data: "main_menu" }]
            ]
        }
    }
};

const CATEGORY_INFO = {
    historical: {
        name: "Historical Places",
        description: "Discover ancient monuments, heritage sites, museums, and historical stories of your city.",
        prompt_template: (msg, city) => `You are a historian and cultural guide for ${city || 'the city'}. Provide detailed information about historical places, monuments, heritage sites, and cultural significance. Focus on: ${msg}`,
        scope_message: "🏛️ I'm here to help you explore historical places, monuments, heritage sites, and cultural stories. Please ask about historical attractions, ancient sites, museums, or cultural heritage!"
    },
    tourist: {
        name: "Tourist Attractions",
        description: "Find the best tourist spots, landmarks, viewpoints, and must-visit places.",
        prompt_template: (msg, city) => `You are a professional tourist guide for ${city || 'the city'}. Recommend the best tourist attractions, landmarks, viewpoints, and must-visit places. Provide practical visiting tips. Focus on: ${msg}`,
        scope_message: "🎯 I'm your tourist guide! Ask me about popular attractions, landmarks, viewpoints, photo spots, and must-visit places in your city!"
    },
    food: {
        name: "Food & Dining",
        description: "Explore local cuisine, restaurants, street food, and culinary experiences.",
        prompt_template: (msg, city) => `You are a food expert and culinary guide for ${city || 'the city'}. Recommend local cuisine, restaurants, street food spots, and unique dining experiences. Focus on: ${msg}`,
        scope_message: "🍽️ I'm your food guide! Ask me about local cuisine, restaurants, street food, dining experiences, or food markets!"
    },
    transport: {
        name: "Transportation",
        description: "Get information about public transport, routes, schedules, and getting around.",
        prompt_template: (msg, city) => `You are a transportation expert for ${city || 'the city'}. Provide information about public transport, routes, schedules, taxi services, and the best ways to get around. Focus on: ${msg}`,
        scope_message: "🚌 I'm your transportation guide! Ask me about buses, metro, taxis, routes, schedules, or how to get around the city!"
    },
    hotels: {
        name: "Accommodation",
        description: "Find hotels, guesthouses, and places to stay that suit your budget.",
        prompt_template: (msg, city) => `You are an accommodation specialist for ${city || 'the city'}. Recommend hotels, guesthouses, hostels, and places to stay for different budgets and preferences. Focus on: ${msg}`,
        scope_message: "🏨 I'm your accommodation expert! Ask me about hotels, guesthouses, hostels, budget stays, or luxury accommodations!"
    },
    events: {
        name: "Events & Entertainment",
        description: "Discover current events, festivals, shows, and entertainment options.",
        prompt_template: (msg, city) => `You are an entertainment and events expert for ${city || 'the city'}. Provide information about current events, festivals, concerts, shows, nightlife, and entertainment options. Focus on: ${msg}`,
        scope_message: "🎪 I'm your entertainment guide! Ask me about current events, festivals, concerts, shows, nightlife, or cultural performances!"
    },
    shopping: {
        name: "Shopping",
        description: "Find the best shopping areas, markets, malls, and specialty stores.",
        prompt_template: (msg, city) => `You are a shopping expert for ${city || 'the city'}. Recommend the best shopping areas, local markets, malls, specialty stores, and unique shopping experiences. Focus on: ${msg}`,
        scope_message: "🛍️ I'm your shopping guide! Ask me about markets, malls, specialty stores, local crafts, or the best places to shop!"
    },
    parks: {
        name: "Parks & Recreation",
        description: "Explore parks, gardens, outdoor activities, and recreational facilities.",
        prompt_template: (msg, city) => `You are a recreation and outdoor activity expert for ${city || 'the city'}. Recommend parks, gardens, outdoor activities, sports facilities, and recreational opportunities. Focus on: ${msg}`,
        scope_message: "🌳 I'm your recreation guide! Ask me about parks, gardens, outdoor activities, sports facilities, or nature spots!"
    }
};

function initUserSession(chatId) {
    if (!userSessions[chatId]) {
        userSessions[chatId] = {
            currentCategory: null,
            location: null,
            preferences: {},
            lastActivity: new Date(),
            messageHistory: []
        };
    }
    return userSessions[chatId];
}

function correctSpelling(text) {
    const commonCorrections = {
        'resturant': 'restaurant',
        'resturants': 'restaurants',
        'templs': 'temples',
        'tempels': 'temples',
        'musium': 'museum',
        'musiums': 'museums',
        'palce': 'place',
        'palces': 'places',
        'reccomend': 'recommend',
        'recomend': 'recommend',
        'intresting': 'interesting',
        'beatiful': 'beautiful',
        'beutiful': 'beautiful',
        'famouse': 'famous',
        'wether': 'weather',
        'accomodation': 'accommodation',
        'trasportation': 'transportation',
        'transporation': 'transportation'
    };

    let correctedText = text;
    Object.keys(commonCorrections).forEach(wrong => {
        const regex = new RegExp(`\b${wrong}\b`, 'gi');
        correctedText = correctedText.replace(regex, commonCorrections[wrong]);
    });

    return correctedText;
}

function improveGrammar(text) {
    return text
        .replace(/i/g, 'I')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^\w/, c => c.toUpperCase());
}

function validateCategoryContext(message, category) {
    if (!category) return true;

    const categoryKeywords = {
        historical: ['history', 'ancient', 'heritage', 'monument', 'temple', 'fort', 'museum', 'archaeological', 'culture', 'historical'],
        tourist: ['tourist', 'attraction', 'landmark', 'visit', 'sightseeing', 'viewpoint', 'photo', 'popular', 'famous'],
        food: ['food', 'restaurant', 'cuisine', 'eat', 'dining', 'street food', 'local food', 'dish', 'meal', 'cafe'],
        transport: ['transport', 'bus', 'metro', 'taxi', 'route', 'travel', 'commute', 'public transport', 'schedule'],
        hotels: ['hotel', 'accommodation', 'stay', 'room', 'booking', 'guesthouse', 'hostel', 'lodge'],
        events: ['event', 'festival', 'concert', 'show', 'entertainment', 'nightlife', 'performance', 'celebration'],
        shopping: ['shopping', 'market', 'mall', 'store', 'buy', 'shop', 'souvenir', 'craft'],
        parks: ['park', 'garden', 'outdoor', 'nature', 'recreation', 'sports', 'exercise', 'green space']
    };

    const keywords = categoryKeywords[category] || [];
    const lowerMessage = message.toLowerCase();

    return keywords.some(keyword => lowerMessage.includes(keyword));
}

async function sendMessage(chatId, text, options = {}) {
    try {
        const payload = {
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML',
            ...options
        };

        const res = await axiosInstance.post("sendMessage", payload);
        return res.data;
    } catch (err) {
        console.error("Send message error:", err.response?.data || err.message);
    }
}

async function editMessage(chatId, messageId, text, options = {}) {
    try {
        const payload = {
            chat_id: chatId,
            message_id: messageId,
            text: text,
            parse_mode: 'HTML',
            ...options
        };

        const res = await axiosInstance.post("editMessageText", payload);
        return res.data;
    } catch (err) {
        console.error("Edit message error:", err.response?.data || err.message);
    }
}

async function handleStartCommand(chatId) {
    const session = initUserSession(chatId);
    session.currentCategory = null;

    const welcomeMessage = `🌟 <b>Welcome to Smart City Explorer!</b> 🌟

 🏙️ <i>Your intelligent guide to explore cities like never before!</i>

✨ <b>What I can help you with:</b>
• Discover historical places and heritage sites
• Find top tourist attractions and landmarks  
• Explore local food and dining options
• Get transportation and route information
• Find accommodation that fits your budget
• Stay updated on events and entertainment
• Discover shopping areas and markets
• Find parks and recreational activities

📍 <b>Choose a category below to start exploring:</b>`;

    return sendMessage(chatId, welcomeMessage, KEYBOARDS.main_menu);
}

async function handleCategorySelection(chatId, category) {
    const session = initUserSession(chatId);
    session.currentCategory = category;

    const categoryInfo = CATEGORY_INFO[category];
    if (!categoryInfo) {
        return sendMessage(chatId, "❌ Invalid category selected.");
    }

    const message = `${BOT_CONFIG.categories[category]}

📝 <b>${categoryInfo.name}</b>
${categoryInfo.description}

💬 <b>Now you can ask me anything about ${categoryInfo.name.toLowerCase()} in your city!</b>

Examples:
• "Best historical places in Delhi"
• "Ancient temples near me"  
• "Museums to visit"

Just type your question and I'll help you explore! 🗺️`;

    return sendMessage(chatId, message, KEYBOARDS.back_to_menu);
}

async function handleUtilitiesMenu(chatId) {
    const message = `🔧 <b>Utility Features</b>

Choose from the available utilities:

 🌤️ <b>Weather</b> - Get current weather conditions
💱 <b>Currency</b> - Convert currencies  
  🗣️ <b>Translate</b> - Translate text between languages
🆘 <b>Emergency</b> - Important emergency contacts
📍 <b>Location</b> - Set your current location
 ⚙️ <b>Settings</b> - Customize your preferences`;

    return sendMessage(chatId, message, KEYBOARDS.utilities_menu);
}

async function handleHelpCommand(chatId) {
    const session = userSessions[chatId];
    const currentCategory = session?.currentCategory;

    let helpMessage = `  ℹ️ <b>Smart City Explorer Help</b>

 🏙️ <b>How to use this bot:</b>
1. Choose a category from the main menu
2. Ask questions related to that category
3. Get intelligent, personalized recommendations

📋 <b>Available Commands:</b>
/start - Show welcome message and menu
/menu - Return to main menu  
/help - Show this help message
/settings - Customize preferences
/location - Set your current location

`;

    if (currentCategory) {
        const categoryInfo = CATEGORY_INFO[currentCategory];
        helpMessage += `🎯 <b>Current Mode: ${categoryInfo.name}</b>
${categoryInfo.scope_message}

`;
    }

    helpMessage += `💡 <b>Tips:</b>
• Be specific about what you're looking for
• Mention your city or area for better results
• Use the menu buttons for easy navigation
• I can correct spelling and improve your questions!

Need more help? Just ask! 😊`;

    return sendMessage(chatId, helpMessage, KEYBOARDS.back_to_menu);
}

async function handleUserMessage(messageObj) {
    const chatId = messageObj.chat?.id;
    const messageText = messageObj?.text?.trim() || "";
    const session = initUserSession(chatId);

    if (!chatId || !messageText) {
        console.error("Invalid message object");
        return;
    }

    if (messageText.startsWith('/')) {
        return handleCommand(chatId, messageText);
    }

    if (session.currentCategory) {
        return handleCategoryMessage(chatId, messageText, session.currentCategory);
    }

    return sendMessage(chatId, `🤔 Please select a category first to get started!

Use /menu to see all available options.`, KEYBOARDS.main_menu);
}

async function handleCommand(chatId, command) {
    const session = initUserSession(chatId);

    switch (command.toLowerCase()) {
        case '/start':
            return handleStartCommand(chatId);

        case '/menu':
            session.currentCategory = null;
            return sendMessage(chatId, "🏙️ <b>Smart City Explorer - Main Menu</b> Choose what you'd like to explore:", KEYBOARDS.main_menu);

        case '/help':
            return handleHelpCommand(chatId);

        case '/settings':
            return sendMessage(chatId, "⚙️ <b>Settings</b>🔧 Settings feature coming soon! For now, you can use /menu to explore different categories.", KEYBOARDS.back_to_menu);

        case '/location':
            return sendMessage(chatId, "📍 <b>Set Location</b>🗺️ Location feature coming soon! For now, just mention your city name in your questions for better results.", KEYBOARDS.back_to_menu);

        default:
            return sendMessage(chatId, `❓ Unknown command: ${command} Use /help to see available commands or /menu to explore categories.`, KEYBOARDS.main_menu);
    }
}

async function handleCategoryMessage(chatId, messageText, category) {
    const session = userSessions[chatId];
    const categoryInfo = CATEGORY_INFO[category];

    const correctedText = correctSpelling(messageText);
    const improvedText = improveGrammar(correctedText);

    if (!validateCategoryContext(improvedText, category)) {
        const message = `🚫 <b>Category Mismatch</b>

${categoryInfo.scope_message}

❌ Your question: "${messageText}"
📝 This seems to be outside the scope of <b>${categoryInfo.name}</b>.

💡 Please ask questions related to ${categoryInfo.name.toLowerCase()}, or use /menu to switch to a different category.`;

        return sendMessage(chatId, message, KEYBOARDS.back_to_menu);
    }

    try {
        await axiosInstance.post("sendChatAction", {
            chat_id: chatId,
            action: "typing"
        });

        const enhancedPrompt = categoryInfo.prompt_template(improvedText, session.location);

        console.log("Enhanced Prompt:", enhancedPrompt);
        const aiResponse = await getGenAIResponse(enhancedPrompt);

        const finalResponse = `${BOT_CONFIG.categories[category]}

${aiResponse}

💡 <i>Need help with something else? Use the menu below!</i>`;

        return sendMessage(chatId, finalResponse, KEYBOARDS.back_to_menu);

    } catch (err) {
        console.error("AI Error:", err.message);
        const errorMessage = `🤖 <b>AI Service Temporarily Unavailable</b>

 😅 I'm having trouble connecting to my AI assistant right now. Please try again in a moment!

🔄 You can also try:
• Rephrasing your question
• Using /menu to explore other categories
• Checking /help for more options`;

        return sendMessage(chatId, errorMessage, KEYBOARDS.back_to_menu);
    }
}

async function handleCallbackQuery(callbackQuery) {
    const chatId = callbackQuery.message?.chat?.id;
    const messageId = callbackQuery.message?.message_id;
    const data = callbackQuery.data;

    if (!chatId) return;

    try {
        await axiosInstance.post("answerCallbackQuery", {
            callback_query_id: callbackQuery.id
        });
    } catch (err) {
        console.error("Callback query answer error:", err.message);
    }

    if (data === 'main_menu') {
        const session = userSessions[chatId];
        if (session) session.currentCategory = null;

        return editMessage(chatId, messageId, "🏙️ <b>Smart City Explorer - Main Menu</b> Choose what you'd like to explore:", KEYBOARDS.main_menu);
    }

    if (data.startsWith('cat_')) {
        const category = data.substring(4);
        return handleCategorySelection(chatId, category);
    }

    if (data === 'utilities') {
        return handleUtilitiesMenu(chatId);
    }

    if (data === 'help') {
        return handleHelpCommand(chatId);
    }

    if (data.startsWith('util_')) {
        const utility = data.substring(5);
        return handleUtilityAction(chatId, utility);
    }

    return sendMessage(chatId, "❓ Unknown action. Use /menu to return to the main menu.", KEYBOARDS.main_menu);
}

async function handleUtilityAction(chatId, utility) {
    const session = initUserSession(chatId);

    switch (utility) {
        case 'weather':
            session.currentCategory = 'weather';
            return sendMessage(chatId, "🌤️ <b>Weather Information</b>📍 Please tell me which city you want weather information for. Example: 'Weather in Delhi' or 'Current weather in Mumbai'", KEYBOARDS.back_to_menu);

        case 'currency':
            session.currentCategory = 'currency';
            return sendMessage(chatId, "💱 <b>Currency Converter</b> 💰 Ask me to convert currencies! Example: 'Convert 100 USD to INR' or 'What is 50 EUR in Indian Rupees?'", KEYBOARDS.back_to_menu);

        case 'translate':
            session.currentCategory = 'translate';
            return sendMessage(chatId, "🗣️ <b>Language Translator</b>🌐 I can help translate text between languages! Example: 'Translate hello to Hindi' or 'How do you say thank you in Spanish?'", KEYBOARDS.back_to_menu);

        case 'emergency':
            return sendMessage(chatId, `🆘 <b>Emergency Contacts</b>
🚨 <b>India Emergency Numbers:</b>
• Police: 100
• Fire: 101  
• Ambulance: 108
• Emergency Helpline: 112
• Women's Helpline: 1091
• Child Helpline: 1098

🏥 <b>Medical Emergency:</b> 102
🚔 <b>Traffic Police:</b> 103
🌊 <b>Disaster Management:</b> 108

 ⚠️ <i>For immediate emergencies, call 112 (single emergency number for all services)</i>`, KEYBOARDS.back_to_menu);

        case 'location':
            return sendMessage(chatId, "📍 <b>Set Location</b> 🗺️ Location services coming soon! For now, just mention your city name when asking questions for better results.", KEYBOARDS.back_to_menu);

        default:
            return sendMessage(chatId, "🔧 Utility feature coming soon!", KEYBOARDS.utilities_menu);
    }
}

async function handleMessage(messageObj) {
    try {
        if (messageObj.text) {
            return await handleUserMessage(messageObj);
        }

        if (messageObj.callback_query) {
            return await handleCallbackQuery(messageObj.callback_query);
        }

        return sendMessage(messageObj.chat?.id, "👋 Hi! I work with text messages. Please type your question or use /menu to explore!", KEYBOARDS.main_menu);

    } catch (err) {
        console.error("Message handler error:", err.message);
        return sendMessage(messageObj.chat?.id, "⚠️ Something went wrong. Please try again or use /menu.", KEYBOARDS.main_menu);
    }
}

module.exports = {
    handleMessage,
    userSessions,
    CATEGORY_INFO,
    BOT_CONFIG
};