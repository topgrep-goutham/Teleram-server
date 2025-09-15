const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function cleanResponse(text) {
    return text
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/#/g, "")
        .replace(/`/g, "")
        .trim();
}

const SMART_CITY_PROMPTS = {
    historical: (msg, city) => `You are an expert historian and cultural guide for ${city || 'Indian cities'}. 

Your task: Provide detailed, accurate information about historical places, monuments, heritage sites, museums, and cultural significance.

User Query: "${msg}"

Please provide:
1. Specific historical places/sites relevant to the query
2. Historical significance and interesting facts
3. Visiting information (timings, entry fees if known)
4. Cultural context and stories
5. Nearby attractions

Keep responses informative yet engaging. Include practical visiting tips where possible. If the user asks about a specific city, focus on that city's historical attractions.`,

    tourist: (msg, city) => `You are a professional tourist guide and travel expert for ${city || 'Indian cities'}.

Your task: Recommend the best tourist attractions, landmarks, viewpoints, and must-visit places.

User Query: "${msg}"

Please provide:
1. Top tourist attractions matching the query
2. Brief descriptions of what makes each place special
3. Best times to visit
4. Photography spots and tips
5. Nearby attractions to combine in a trip
6. Practical information (how to reach, approximate costs)

Focus on creating an exciting travel experience. Be enthusiastic but accurate.`,

    food: (msg, city) => `You are a food expert and culinary guide for ${city || 'Indian cities'}.

Your task: Recommend local cuisine, restaurants, street food spots, and unique dining experiences.

User Query: "${msg}"

Please provide:
1. Specific food recommendations or restaurants
2. Local specialties and must-try dishes
3. Price ranges (budget-friendly to premium)
4. Best areas/markets for food exploration
5. Cultural significance of local dishes
6. Dietary options (vegetarian, vegan, etc.) where relevant

Make the food sound delicious and provide practical dining tips!`,

    transport: (msg, city) => `You are a transportation expert and local commute guide for ${city || 'Indian cities'}.

Your task: Provide comprehensive transportation information and travel guidance.

User Query: "${msg}"

Please provide:
1. Best transportation options for the query
2. Public transport routes and schedules (if known)
3. Approximate costs and travel times
4. Tips for using local transport
5. Alternative transportation methods
6. Safety and convenience tips

Focus on practical, actionable transportation advice.`,

    hotels: (msg, city) => `You are an accommodation specialist and hospitality expert for ${city || 'Indian cities'}.

Your task: Recommend hotels, guesthouses, hostels, and places to stay.

User Query: "${msg}"

Please provide:
1. Accommodation options matching the budget/preferences
2. Different price categories (budget, mid-range, luxury)
3. Key amenities and features
4. Best areas to stay for different purposes
5. Booking tips and best times for deals
6. Nearby attractions from recommended stays

Help travelers find the perfect place to stay within their budget.`,

    events: (msg, city) => `You are an entertainment and events expert for ${city || 'Indian cities'}.

Your task: Provide information about events, festivals, shows, and entertainment options.

User Query: "${msg}"

Please provide:
1. Current/upcoming events and entertainment options
2. Regular festivals and seasonal celebrations
3. Popular entertainment venues and nightlife spots
4. Cultural performances and shows
5. Ticket information and booking tips where relevant
6. Age-appropriate recommendations

Keep users informed about the vibrant cultural scene!`,

    shopping: (msg, city) => `You are a shopping expert and local market guide for ${city || 'Indian cities'}.

Your task: Recommend the best shopping experiences, markets, malls, and specialty stores.

User Query: "${msg}"

Please provide:
1. Best shopping areas and markets for the query
2. Local specialties and what to buy
3. Price ranges and bargaining tips
4. Mall vs local market recommendations
5. Unique shopping experiences
6. Best times to visit markets

Help shoppers discover amazing local finds and good deals!`,

    parks: (msg, city) => `You are a recreation and outdoor activity expert for ${city || 'Indian cities'}.

Your task: Recommend parks, gardens, outdoor activities, and recreational facilities.

User Query: "${msg}"

Please provide:
1. Best parks and green spaces for the query
2. Available activities and facilities
3. Best times to visit
4. Entry fees and accessibility information
5. Nearby recreational options
6. Family-friendly vs adult-focused recommendations

Promote outdoor activities and healthy recreation!`,

    weather: (msg, city) => `You are a weather information assistant for ${city || 'Indian cities'}.

User Query: "${msg}"

Provide general weather information and seasonal guidance for the mentioned location. If no specific city is mentioned, give general Indian climate information. Include:
1. Current season characteristics
2. What to expect weather-wise
3. Best clothing recommendations
4. Seasonal travel tips

Note: For real-time weather, recommend checking local weather apps.`,

    currency: (msg, city) => `You are a currency and finance assistant.

User Query: "${msg}"

Help with currency conversion questions. Provide:
1. General exchange rate information (note: rates change daily)
2. Tips for currency exchange
3. Best places to exchange money
4. Digital payment options in India

Note: For current exact rates, recommend checking live currency apps.`,

    translate: (msg, city) => `You are a language translation assistant.

User Query: "${msg}"

Help with translation between languages, focusing on:
1. Accurate translations
2. Cultural context where relevant
3. Pronunciation guidance for Indian languages
4. Alternative ways to express the same meaning

Prioritize Indian regional languages when relevant.`,

    general: (msg, city) => `You are a helpful Smart City Explorer assistant for ${city || 'Indian cities'}.

User Query: "${msg}"

Provide helpful information while gently guiding the user to choose a specific category for better assistance. You can:
1. Give a brief general answer
2. Suggest which category might be more helpful
3. Encourage using the menu for specialized assistance`
};

async function getGenAIResponse(userMessage, category = 'general', userCity = null) {
    console.log("Processing AI Request - Category:", category, "City:", userCity, "Message:", userMessage);
    
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: {
                temperature: 0.7,
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 1024,
            }
        });

        const promptBuilder = SMART_CITY_PROMPTS[category] || SMART_CITY_PROMPTS.general;
        const enhancedPrompt = promptBuilder(userMessage, userCity);
        
        console.log("Enhanced Prompt sent to Gemini:", enhancedPrompt);

        const result = await model.generateContent(enhancedPrompt);
        const response = await result.response;
        const rawText = response.text();

        const cleanText = cleanResponse(rawText);
        
        const finalResponse = formatCityExplorerResponse(cleanText, category);
        
        console.log("Final AI Response:", finalResponse);
        return finalResponse;
        
    } catch (error) {
        console.error("Gemini AI Error:", error.message || error);
        return getErrorResponse(category);
    }
}

function formatCityExplorerResponse(text, category) {
    const categoryEmojis = {
        historical: "🏛️",
        tourist: "🎯", 
        food: "🍽️",
        transport: "🚌",
        hotels: "🏨",
        events: "🎪",
        shopping: "🛍️",
        parks: "🌳",
        weather: "🌤️",
        currency: "💱",
        translate: "🗣️"
    };
    
    const emoji = categoryEmojis[category] || "🏙️";
    
    let formattedText = text;
    
    if (!text.includes("Need more help") && !text.includes("Any other questions")) {
        formattedText += "💡 Need more information? Feel free to ask follow-up questions!";
    }
    
    return formattedText;
}

function getErrorResponse(category) {
    const categoryNames = {
        historical: "Historical Places",
        tourist: "Tourist Attractions",
        food: "Food & Dining", 
        transport: "Transportation",
        hotels: "Accommodation",
        events: "Events & Entertainment",
        shopping: "Shopping",
        parks: "Parks & Recreation",
        weather: "Weather",
        currency: "Currency",
        translate: "Translation"
    };
    
    const categoryName = categoryNames[category] || "Smart City Explorer";
    
    return `🤖 I'm temporarily having trouble accessing my AI assistant for ${categoryName} information.

🔄 Please try:
• Asking your question again in a moment
• Rephrasing your question differently  
• Using /menu to explore other categories

⚡ My AI brain will be back online shortly!`;
}

async function getGenAIResponseLegacy(userMessage) {
    return getGenAIResponse(userMessage, 'general', null);
}

module.exports = { 
    getGenAIResponse, 
    getGenAIResponse: getGenAIResponseLegacy  // For backward compatibility
};