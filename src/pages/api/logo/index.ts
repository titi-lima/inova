import axios from 'axios';
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!process.env.REPLICATE_API_TOKEN) {
    console.log("REPLICATE_API_TOKEN not configured, please follow instructions in README.md");
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        detail: "REPLICATE_API_TOKEN not configured, please follow instructions in README.md",
      })
    );
    return;
  }

  if (!req.body.prompt) {
    res.statusCode = 400;
    res.end(JSON.stringify({ detail: "Please enter a valid prompt" }));
    return;
  }

  const prompt = `mdjrny-v4 style a logo for a business with the following idea in Portuguese: ${req.body.prompt}. ${req.body.select}, simple, vector, The output should be solely a logo. --no text`;

  const response = await axios.post("https://api.replicate.com/v1/predictions", {
    version: "9936c2001faa2194a261c01381f90e65261879985476014a0a37a334593a05eb",

    input: {
      prompt,
      width: 512,
      height: 512,
      guidance_scale: 20,
      num_inference_steps: 200,
      num_outputs: 4,
    },
  }, {
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status !== 201) {
    console.log(response.data);
    res.statusCode = response.status;
    res.end(JSON.stringify(response.data));
    return;
  }

  const prediction = response.data
  res.statusCode = 200;
  res.end(JSON.stringify(prediction));
}
