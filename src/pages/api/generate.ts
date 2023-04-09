import { Configuration, OpenAIApi } from "openai";
import type { NextApiRequest, NextApiResponse } from "next";

const mock = `Company Names:
1. The Baker's Bench
2. Rise & Knead
3. Flour & Fire
4. Hearth & Home Bakery

Slogans:
1. "Fresh. Hot. Delicious."
2. "The taste of home."
3. "Knead the dough, bake the bread."
4. "Warm yeasty goodness."

Small Descriptions:
1. A cozy bakery that specializes in fresh, homemade breads and pastries.
2. A family-run shop offering delicious breads and pastries for every occasion.
3. Home of the freshest breads and pastries, made with love and care.
4. A traditional bakery with a passion for creating the perfect loaf.`;

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
    // res.status(200).json({ result: mock });
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(userIdea),
      temperature: 0.6,
      max_tokens: 200,
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
  return `Você está criando um aplicativo que gera nomes, slogans e pequenas descrições para novas empresas com base em uma ideia fornecida pelo usuário. Seu aplicativo precisa gerar 4 opções para cada categoria. Dada a seguinte ideia do usuário, forneça 4 opções para cada categoria:

Ideia do usuário: ${userIdea}

Nomes do negócio:
1.
2.
3.
4.

Slogans:
1.
2.
3.
4.

Pequena Descrição:
1.
2.
3.
4.

`;
}