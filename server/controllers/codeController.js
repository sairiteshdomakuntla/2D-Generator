const { getP5CodeFromPrompt } = require('../services/geminiService');

exports.generateCode = async (req, res) => {
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        return res.status(400).json({ error: 'Valid prompt is required' });
    }
    
    try {
        const code = await getP5CodeFromPrompt(prompt);
        res.json({ code });
    } catch (error) {
        console.error('Gemini API error:', error);
        
        // Handle specific error types
        if (error.status === 404) {
            res.status(500).json({ 
                error: 'Model configuration error', 
                message: 'The AI model is not available or incorrectly configured.' 
            });
        } else if (error.status === 429) {
            res.status(429).json({ 
                error: 'Rate limit exceeded',
                message: 'Too many requests. Please try again later.'
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to generate code from Gemini',
                message: 'An error occurred while generating the sketch.'
            });
        }
    }
};