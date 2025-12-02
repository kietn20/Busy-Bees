const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateFlashcardsFromAI = async (noteContent, numFlashcards) => {
  const prompt = `From the following note content, extract no more than ${numFlashcards} important terms or concepts that are explicitly mentioned in the notes. For each term, provide a concise definition or explanation. If you cannot find enough terms, just return as many as you can. Stop when you run out of terms. Return your response as a JSON array in the format: [{ "term": "...", "definition": "..." }]. Do not include any extra text, explanations, or formatting—just the raw JSON array.

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