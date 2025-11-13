const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateFlashcardsFromAI = async (noteContent, numFlashcards) => {
  const prompt = `Look through the following note content. Extract exactly ${numFlashcards}. For each important keyword or concept, extract it as the "term" (maximum 100 characters) and find its definition from the note (maximum 300 characters). Return your response as a JSON array, with each item in the format: { "term": "...", "definition": "..." }. Do not include any extra text, explanations, or formatting—just the raw JSON array.

        Note content:
        """
        ${noteContent}
        """`;
   try {
        const response = await openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 2000,
        });

        console.log("AI response:", response);
        console.log("AI raw response:", response.choices[0].message.content);
        return parseFlashcards(response.choices[0].message.content);
    } catch (error) {
        console.error("Error generating flashcards from AI:", error);
        return [];
    }
};

function parseFlashcards(aiText) {
    try {
    // Try to parse the AI response as JSON
    const flashcards = JSON.parse(aiText);
    // Optionally, validate the structure
    if (Array.isArray(flashcards) && flashcards.every(card => card.term && card.definition)) {
      return flashcards;
    }
    // If not valid, return empty array
    return [];
  } catch (err) {
    // If parsing fails, return empty array
    return [];
  }
}

module.exports = {
    generateFlashcardsFromAI    
}