const stringSimilarity = require('string-similarity');

const SPELL_CORRECTIONS = {
    'delhii': 'delhi',
    'mumbaii': 'mumbai', 
    'bangalor': 'bangalore',
    'bangaluru': 'bangalore',
    'chenai': 'chennai',
    'chennayi': 'chennai',
    'kolkatta': 'kolkata',
    'hydrabad': 'hyderabad',
    'hyderabd': 'hyderabad',
    
    'resturant': 'restaurant',
    'resturants': 'restaurants',
    'restraunt': 'restaurant',
    'restaraunt': 'restaurant',
    'cusine': 'cuisine',
    'cusines': 'cuisines',
    'reccomend': 'recommend',
    'recomend': 'recommend',
    'recomendation': 'recommendation',
    'delicous': 'delicious',
    'delishious': 'delicious',
    'temple': 'temple',
    'templs': 'temples',
    'tempels': 'temples',
    'tempal': 'temple',
    'musium': 'museum',
    'musiums': 'museums',
    'palce': 'place',
    'palces': 'places',
    'plce': 'place',
    'intresting': 'interesting',
    'beatiful': 'beautiful',
    'beutiful': 'beautiful',
    'famouse': 'famous',
    'monument': 'monument',
    'moument': 'monument',
    
    'trasportation': 'transportation',
    'transporation': 'transportation',
    'publc': 'public',
    'busses': 'buses',
    'buss': 'bus',
    'metros': 'metro',
    'travell': 'travel',
    'travelling': 'traveling',
    
    'accomodation': 'accommodation',
    'acommodation': 'accommodation',
    'hotell': 'hotel',
    'hotells': 'hotels',
    'guesthouse': 'guesthouse',
    'budjet': 'budget',
    'budgit': 'budget',
    
    'enterainment': 'entertainment',
    'entertaiment': 'entertainment',
    'festivall': 'festival',
    'festivel': 'festival',
    'concrt': 'concert',
    'concerts': 'concerts',
    'celebraton': 'celebration',
    
    'shoppping': 'shopping',
    'shoping': 'shopping',
    'markts': 'markets',
    'markt': 'market',
    'malll': 'mall',
    'storr': 'store',
    
    'recriation': 'recreation',
    'recreaton': 'recreation',
    'gardn': 'garden',
    'gardns': 'gardens',
    'parkk': 'park',
    'parks': 'parks',
    
    'wether': 'weather',
    'wheather': 'weather',
    'currancy': 'currency',
    'currencey': 'currency',
    'translat': 'translate',
    'translte': 'translate'
};

const INDIAN_CITIES = {
    'dilli': 'delhi',
    'bombay': 'mumbai',
    'calcutta': 'kolkata',
    'madras': 'chennai',
    'bangaluru': 'bangalore',
    'bengaluru': 'bangalore',
    'pune': 'pune',
    'ahmedabad': 'ahmedabad',
    'surat': 'surat',
    'jaipur': 'jaipur',
    'lucknow': 'lucknow',
    'kanpur': 'kanpur',
    'nagpur': 'nagpur',
    'indore': 'indore',
    'thane': 'thane',
    'bhopal': 'bhopal',
    'visakhapatnam': 'visakhapatnam',
    'pimpri': 'pimpri chinchwad',
    'patna': 'patna',
    'vadodara': 'vadodara',
    'ghaziabad': 'ghaziabad',
    'ludhiana': 'ludhiana',
    'agra': 'agra',
    'nashik': 'nashik',
    'faridabad': 'faridabad',
    'meerut': 'meerut',
    'rajkot': 'rajkot',
    'kalyan': 'kalyan dombivli',
    'vasai': 'vasai virar',
    'varanasi': 'varanasi',
    'srinagar': 'srinagar',
    'dhanbad': 'dhanbad',
    'jodhpur': 'jodhpur',
    'amritsar': 'amritsar',
    'raipur': 'raipur',
    'allahabad': 'prayagraj',
    'coimbatore': 'coimbatore',
    'jabalpur': 'jabalpur',
    'gwalior': 'gwalior',
    'vijayawada': 'vijayawada',
    'madurai': 'madurai',
    'gurgaon': 'gurugram',
    'mysore': 'mysuru'
};

function advancedSpellCorrection(text) {
    let correctedText = text.toLowerCase();
    
    Object.keys(SPELL_CORRECTIONS).forEach(wrong => {
        const regex = new RegExp(`\b${wrong}\b`, 'gi');
        correctedText = correctedText.replace(regex, SPELL_CORRECTIONS[wrong]);
    });
    
    Object.keys(INDIAN_CITIES).forEach(oldName => {
        const regex = new RegExp(`\b${oldName}\b`, 'gi');
        correctedText = correctedText.replace(regex, INDIAN_CITIES[oldName]);
    });
    
    return correctedText;
}

function enhanceGrammar(text) {
    return text
        .replace(/i/g, 'I')  
        .replace(/im/g, 'I am') 
        .replace(/u/g, 'you')  
        .replace(/ur/g, 'your') 
        .replace(/tell me abt/g, 'tell me about')  
        .replace(/info abt/g, 'information about')
        .replace(/plz/g, 'please')  
        .replace(/thnx/g, 'thanks')  
        .replace(/thx/g, 'thanks')  
        .replace(/\s+/g, ' ') 
        .replace(/\s+([,.!?])/g, '$1') 
        .trim()                  
        
        .replace(/^\w/, c => c.toUpperCase())
        
        .replace(/\?\s*\?+/g, '?')  
        .replace(/([a-zA-Z])\?/g, '$1 ?');  
}

function detectCity(text) {
    const lowerText = text.toLowerCase();
    
    const cityPatterns = [
        /in ([a-zA-Z\s]+)/g,
        /of ([a-zA-Z\s]+)/g,
        /at ([a-zA-Z\s]+)/g,
        /near ([a-zA-Z\s]+)/g
    ];
    
    const cities = Object.values(INDIAN_CITIES).concat(Object.keys(INDIAN_CITIES));
    
    for (const pattern of cityPatterns) {
        const matches = [...lowerText.matchAll(pattern)];
        for (const match of matches) {
            const possibleCity = match[1].trim();
            if (cities.includes(possibleCity)) {
                return possibleCity;
            }
        }
    }
    
    for (const city of cities) {
        if (lowerText.includes(city)) {
            return INDIAN_CITIES[city] || city;
        }
    }
    
    return null;
}

function generateCategoryMismatchMessage(userMessage, currentCategory, detectedCategories = []) {
    const categoryInfo = {
        historical: { name: "Historical Places", icon: "🏛️", examples: ["ancient temples", "historical monuments", "heritage sites", "museums"] },
        tourist: { name: "Tourist Attractions", icon: "🎯", examples: ["famous landmarks", "tourist spots", "sightseeing places", "viewpoints"] },
        food: { name: "Food & Dining", icon: "🍽️", examples: ["restaurants", "local cuisine", "street food", "dining options"] },
        transport: { name: "Transportation", icon: "🚌", examples: ["bus routes", "metro schedules", "taxi services", "public transport"] },
        hotels: { name: "Accommodation", icon: "🏨", examples: ["hotels", "guesthouses", "places to stay", "accommodation"] },
        events: { name: "Events & Entertainment", icon: "🎪", examples: ["festivals", "concerts", "shows", "nightlife"] },
        shopping: { name: "Shopping", icon: "🛍️", examples: ["markets", "malls", "shopping areas", "stores"] },
        parks: { name: "Parks & Recreation", icon: "🌳", examples: ["parks", "gardens", "outdoor activities", "recreation"] }
    };
    
    const current = categoryInfo[currentCategory];
    
    let message = `🚫 <b>Oops! Category Mismatch</b>

${current.icon} <b>Current Mode: ${current.name}</b>

❌ <b>Your question:</b> "${userMessage}"

📝 This question seems to be outside the scope of <b>${current.name}</b>.

${current.icon} <b>I can help you with:</b>
${current.examples.map(ex => `• ${ex}`).join('')}`;

    if (detectedCategories.length > 0) {
        const suggestions = detectedCategories.map(cat => 
            `${categoryInfo[cat].icon} ${categoryInfo[cat].name}`
        ).join(' or ');
        
        message += `

💡 <b>Suggestion:</b> Your question might be better suited for ${suggestions}!`;
    }
    
    message += `

🔄 <b>Options:</b>
• Rephrase your question to focus on ${current.name.toLowerCase()}
• Use the menu below to switch categories
• Use /menu to see all available options`;
    
    return message;
}

function logUserActivity(chatId, category, message, response) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] User ${chatId} | Category: ${category} | Query: "${message}" | Response Length: ${response?.length || 0} chars`);
    
    if (userSessions[chatId]) {
        if (!userSessions[chatId].messageHistory) {
            userSessions[chatId].messageHistory = [];
        }
        
        userSessions[chatId].messageHistory.push({
            timestamp,
            category,
            query: message,
            responseLength: response?.length || 0
        });
        
        if (userSessions[chatId].messageHistory.length > 10) {
            userSessions[chatId].messageHistory = userSessions[chatId].messageHistory.slice(-10);
        }
    }
}

function getPopularCategories(chatId) {
    const session = userSessions[chatId];
    if (!session?.messageHistory) return [];
    
    const categoryCount = {};
    session.messageHistory.forEach(entry => {
        if (entry.category) {
            categoryCount[entry.category] = (categoryCount[entry.category] || 0) + 1;
        }
    });
    
    return Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category);
}

function detectIntentFromMessage(message) {
    const lowerMsg = message.toLowerCase();
    const intentPatterns = {
        historical: [
            'history', 'historical', 'ancient', 'heritage', 'monument', 'temple', 
            'fort', 'palace', 'museum', 'archaeological', 'culture', 'traditional',
            'old', 'historic', 'legacy', 'past', 'civilization', 'dynasty'
        ],
        tourist: [
            'tourist', 'attraction', 'landmark', 'visit', 'sightseeing', 'viewpoint', 
            'photo', 'popular', 'famous', 'must see', 'bucket list', 'iconic',
            'travel', 'tour', 'explore', 'destination', 'spot'
        ],
        food: [
            'food', 'restaurant', 'cuisine', 'eat', 'dining', 'street food', 
            'local food', 'dish', 'meal', 'cafe', 'snack', 'breakfast', 'lunch', 
            'dinner', 'tasty', 'delicious', 'flavor', 'spicy', 'sweet'
        ],
        transport: [
            'transport', 'bus', 'metro', 'taxi', 'route', 'travel', 'commute', 
            'public transport', 'schedule', 'train', 'auto', 'rickshaw',
            'uber', 'ola', 'cab', 'railway', 'station'
        ],
        hotels: [
            'hotel', 'accommodation', 'stay', 'room', 'booking', 'guesthouse', 
            'hostel', 'lodge', 'resort', 'budget stay', 'luxury', 'cheap',
            'expensive', 'night', 'check in', 'check out'
        ],
        events: [
            'event', 'festival', 'concert', 'show', 'entertainment', 'nightlife', 
            'performance', 'celebration', 'party', 'club', 'bar', 'music',
            'dance', 'theater', 'cinema', 'movie'
        ],
        shopping: [
            'shopping', 'market', 'mall', 'store', 'buy', 'shop', 'souvenir', 
            'craft', 'clothes', 'jewelry', 'electronics', 'books',
            'handicraft', 'local products', 'brands'
        ],
        parks: [
            'park', 'garden', 'outdoor', 'nature', 'recreation', 'sports', 
            'exercise', 'green space', 'jogging', 'walking', 'cycling',
            'playground', 'zoo', 'lake', 'river'
        ]
    };
    
    const scores = {};
    
    Object.keys(intentPatterns).forEach(category => {
        scores[category] = 0;
        intentPatterns[category].forEach(keyword => {
            if (lowerMsg.includes(keyword)) {
                scores[category] += 1;
                if (lowerMsg.split(/\s+/).includes(keyword)) {
                    scores[category] += 0.5;
                }
            }
        });
    });
    
    return Object.entries(scores)
        .filter(([, score]) => score > 0)
        .sort(([,a], [,b]) => b - a)
        .map(([category]) => category);
}

function generateSmartSuggestion(message, currentCategory) {
    const detectedCategories = detectIntentFromMessage(message);
    
    if (detectedCategories.length === 0) {
        return "🤔 I'm not sure what category this falls under. Please try to be more specific or use /menu to choose a category.";
    }
    
    if (currentCategory && !detectedCategories.includes(currentCategory)) {
        const categoryIcons = {
            historical: "🏛️", tourist: "🎯", food: "🍽️", transport: "🚌",
            hotels: "🏨", events: "🎪", shopping: "🛍️", parks: "🌳"
        };
        
        const suggestions = detectedCategories.slice(0, 2).map(cat => 
            `${categoryIcons[cat]} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`
        ).join(' or ');
        
        return `💡 Your question seems to be about ${suggestions}. Would you like me to switch to that category, or rephrase your question for the current category?`;
    }
    
    return null;
}

function createQuickReplies(category) {
    const quickReplies = {
        historical: [
            "🏛️ Ancient temples", "🏰 Historical forts", "🏛️ Museums", "📿 Heritage sites"
        ],
        tourist: [
            "📸 Photo spots", "🎯 Top attractions", "🗺️ City landmarks", "👥 Popular places"
        ],
        food: [
            "🍛 Local cuisine", "🥘 Street food", "🍴 Restaurants", "☕ Cafes"
        ],
        transport: [
            "🚌 Bus routes", "🚇 Metro info", "🚗 Taxi services", "🗺️ Travel routes"
        ],
        hotels: [
            "💰 Budget hotels", "⭐ Luxury stays", "🏠 Guesthouses", "🎒 Hostels"
        ],
        events: [
            "🎉 Current events", "🎵 Concerts", "🎭 Shows", "🌃 Nightlife"
        ],
        shopping: [
            "🛒 Local markets", "🏬 Shopping malls", "🎁 Souvenirs", "👕 Clothes"
        ],
        parks: [
            "🌳 City parks", "🌺 Gardens", "🏃 Jogging spots", "⚽ Sports facilities"
        ]
    };
    
    return {
        reply_markup: {
            keyboard: [
                quickReplies[category]?.slice(0, 2) || [],
                quickReplies[category]?.slice(2, 4) || [],
                [{ text: "🔙 Back to Menu" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };
}

function validateUserInput(message, category) {
    if (message.length < 3) {
        return {
            valid: false,
            error: "❓ Your message is too short. Please ask a complete question!"
        };
    }
    
    if (message.length > 500) {
        return {
            valid: false,
            error: "📝 Your message is quite long. Please try to ask a more concise question (under 500 characters)."
        };
    }
    
    const alphaCount = (message.match(/[a-zA-Z]/g) || []).length;
    if (alphaCount < message.length * 0.5) {
        return {
            valid: false,
            error: "🔤 Please use more words in your question. I work best with clear text messages!"
        };
    }
    
    return { valid: true };
}

function formatAIResponse(response, category) {
    const categoryEmojis = {
        historical: "🏛️",
        tourist: "🎯", 
        food: "🍽️",
        transport: "🚌",
        hotels: "🏨",
        events: "🎪",
        shopping: "🛍️",
        parks: "🌳"
    };
    
    const emoji = categoryEmojis[category] || "🏙️";
    
    let formattedResponse = response
        .replace(/^(Here's|Here are|I recommend)/i, '')
        .trim();
    
    if (!formattedResponse.includes("Need more") && 
        !formattedResponse.includes("Any other") && 
        !formattedResponse.includes("feel free")) {
        formattedResponse += "💡 <i>Need more specific information? Just ask!</i>";
    }
    
    return formattedResponse;
}

function getBotStats() {
    const totalUsers = Object.keys(userSessions).length;
    const activeUsers = Object.values(userSessions).filter(session => 
        session.lastActivity && (new Date() - session.lastActivity) < 24 * 60 * 60 * 1000
    ).length;
    
    const categoryUsage = {};
    Object.values(userSessions).forEach(session => {
        if (session.messageHistory) {
            session.messageHistory.forEach(entry => {
                if (entry.category) {
                    categoryUsage[entry.category] = (categoryUsage[entry.category] || 0) + 1;
                }
            });
        }
    });
    
    return {
        totalUsers,
        activeUsers,
        categoryUsage,
        topCategory: Object.entries(categoryUsage).sort(([,a], [,b]) => b - a)[0]?.[0] || 'none'
    };
}

const { userSessions } = require('./Telegram');

module.exports = {
    advancedSpellCorrection,
    enhanceGrammar,
    detectCity,
    generateCategoryMismatchMessage,
    createQuickReplies,
    validateUserInput,
    formatAIResponse,
    detectIntentFromMessage,
    generateSmartSuggestion,
    logUserActivity,
    getPopularCategories,
    getBotStats,
    SPELL_CORRECTIONS,
    INDIAN_CITIES
};