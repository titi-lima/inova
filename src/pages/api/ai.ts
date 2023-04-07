import { Configuration, OpenAIApi } from "openai";
import type { NextApiRequest, NextApiResponse } from "next";


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const userIdea = req.body.userIdea || '';
  if (userIdea.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid user idea",
      }
    });
    return;
  }

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(userIdea),
      temperature: 0.6,
    });
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch(error : any) {
    // Consider adjusting the error handling logic for your use case
    if ((error).response) {
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
}

function generatePrompt(userIdea: string) {
  return `You're building an app that generates names, slogans, and small descriptions for new companies based on a user-provided idea. Your app needs to generate 4 options for each category. Given the following idea from the user, provide 4 options for each category:

User idea: ${userIdea}

Company Names:
1.
2.
3.
4.

Slogans:
1.
2.
3.
4.

Small Descriptions:
1.
2.
3.
4.

`;
}