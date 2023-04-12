import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (!process.env.REPLICATE_API_TOKEN) {
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        detail: "REPLICATE_API_TOKEN not configured, please follow instructions in README.md",
      })
    );
    return;
  }
  if (!req.query.id || req.query.id === 'undefined') {
    res.statusCode = 400;
    res.end(JSON.stringify({ detail: "Please enter a valid ID" }));
    return;
  }

  const response = await axios.get(
    "https://api.replicate.com/v1/predictions/" + req.query.id,
    {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (response.status !== 200) {
    res.statusCode = response.status;
    res.end(JSON.stringify(response.data));
    return;
  }

  const prediction = response.data;
  res.statusCode = 200;
  res.end(JSON.stringify(prediction));
}
