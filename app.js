const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();
const express = require('express');
const app = express();
const port = 3005;

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
const openai = new OpenAIApi(configuration);

app.use(express.json()); 

app.post('/', async function(req, res){
    if (!configuration.apiKey) {
        res.status(500).json({
          error: {
            message: "OpenAI API key not configured, please follow instructions in README.md",
          }
        });
        return;
    }

    const prompt = req.body.prompt || '';
    
    if (prompt.trim().length === 0) {
        res.status(400).json({
            error: {
                message: "Please enter a valid prompt",
            }
        });
        return;
    }
    
    try {
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: generatePrompt(prompt),
            temperature: 0.6,
            max_tokens: 2048
        });
        res.status(200).json({ result: completion.data.choices[0].text });
    } catch(error) {
        if (error.response) {
            console.error(error.response.status, error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            console.error(`Error with OpenAI API request: ${error.message}`);
            res.status(500).json({
                error: {
                    message: 'An error occurred during your request.',
                }
            });
        }
    }
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});


function generatePrompt(prompt) {
    return prompt + 
    'structure this in the following "name of the recipe", "ingredients", "instructions", "nutritional value"'
    }