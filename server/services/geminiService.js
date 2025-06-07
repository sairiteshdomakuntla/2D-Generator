require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Create the API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the model - using gemini-2.0-flash
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash'
});

// Update the prompt to handle file loading issues
async function getP5CodeFromPrompt(prompt) {
    try {
        // Add more explicit parameters to help with generation
        const genParams = {
            temperature: 0.7, // Control creativity
            maxOutputTokens: 2048, // Ensure we get a complete sketch
        };

        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{
                    text: `You are a JavaScript creative coder who only replies with valid p5.js sketches. 
                    Generate a  sketch (no HTML wrapper) that shows: "${prompt}".
                    
                    Important requirements:
                    1. Only provide the raw JavaScript code with no markdown formatting, code block indicators, or explanations.
                    2. Do not use loadStrings(), loadJSON(), loadImage() or any other loading function that requires external files.
                    3. Do not use deviceOrientation or accelerometer features.
                    4. Generate all data procedurally within the sketch.
                    5. Include both setup() and draw() functions.
                    6. Make sure the sketch is self-contained with no external dependencies.`
                }]
            }],
            generationConfig: genParams
        });

        const response = await result.response;
        let code = response.text();
        
        // Clean the code by removing any markdown code blocks if present
        code = cleanGeneratedCode(code);
        
        return code;
    } catch (error) {
        console.error('Error details:', error);
        throw error;
    }
}

// New function to modify existing code based on user instructions
async function getModifiedCode(existingCode, modificationPrompt) {
    try {
        const genParams = {
            temperature: 0.5, // Lower temperature for more precise modifications
            maxOutputTokens: 2048,
        };

        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{
                    text: `I have a p5.js sketch that I want to modify. Here's the current code:

${existingCode}

I want to make the following change: "${modificationPrompt}"

Please provide the full modified code with the requested changes. Important requirements:
1. Only provide the raw JavaScript code with no markdown formatting, code block indicators, or explanations.
2. Do not use loadStrings(), loadJSON(), loadImage() or any other loading function that requires external files.
3. Do not use deviceOrientation or accelerometer features.
4. Maintain the same basic structure but implement the requested changes.
5. Include both setup() and draw() functions.
6. Make sure the sketch remains self-contained with no external dependencies.`
                }]
            }],
            generationConfig: genParams
        });

        const response = await result.response;
        let code = response.text();
        
        // Clean the code
        code = cleanGeneratedCode(code);
        
        return code;
    } catch (error) {
        console.error('Error in code modification:', error);
        throw error;
    }
}

// Helper function to clean the generated code
function cleanGeneratedCode(code) {
    // Remove markdown code block syntax if present
    code = code.replace(/```javascript|```js|```/g, '').trim();
    
    // Remove any leading/trailing whitespace
    code = code.trim();
    
    // Ensure the code has the basic p5.js setup and draw functions
    if (!code.includes('function setup()') && !code.includes('function draw()')) {
        throw new Error('Generated code does not contain valid p5.js structure');
    }
    
    return code;
}

module.exports = { getP5CodeFromPrompt, getModifiedCode };