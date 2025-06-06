const { getP5CodeFromPrompt } = require('../services/geminiService');
exports.generateCode= async (req,res)=>{
    const {prompt}=req.body;
    try {
        const code=await getP5CodeFromPrompt(prompt);
        res.json({code});
    } catch (error) {
        console.error('Gemini API error:', error);
        res.status(500).json({ error: 'Failed to generate code from Gemini' });
    }
}