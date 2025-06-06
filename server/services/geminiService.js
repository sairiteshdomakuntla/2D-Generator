require('dotenv').config();
const {GoogleGenerativeAI} = require('@google/generative-ai');

const genAI=new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

async function getP5CodeFromPrompt(prompt){
    const result = await model.generateContent(
    `You are a JavaScript creative coder who only replies with valid p5.js sketches. 
    Generate a p5.js sketch (no HTML wrapper) that shows: "${prompt}".`
    );
    const response = await result.response;
    return response.text();
}

module.exports = { getP5CodeFromPrompt };