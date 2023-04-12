import { useState } from "react";
import Head from "next/head";
import { css, Global } from "@emotion/react";
import styled from "@emotion/styled";
import tinycolor from "tinycolor2";
import axios from "axios";

const ColorPickerWrapper = styled.div`
  position: relative;
  display: inline-block;
  margin: 0 16px;
`;

const ColorPickerInput = styled.input<{ bgColor: string }>`
  appearance: none;
  width: 24px;
  height: 24px;
  background-color: ${(props) => props.bgColor};
  cursor: pointer;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  gap: 16px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 40%;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  gap: 16px;
`;

const Input = styled.textarea`
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Button = styled.button`
  padding: 10px;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #0051bb;
  }
`;

const FramesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 16px;
  width: 100%;
  margin-top: 16px;
`;

const Frame = styled.div<{ bgColor: string }>`
  background-color: ${(props) => props.bgColor};
  height: 320px;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`;

const FrameTop = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const RoundImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
`;

const generateSimilarColors = (color: string) => {
  const baseColor = tinycolor(color);
  const colors = [baseColor.toHexString()];
  for (let i = 0; i < 3; i++) {
    colors.push(
      baseColor
        .clone()
        .spin(10 * (i + 1))
        .toHexString()
    );
  }
  return colors;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [businessDescription, setBusinessDescription] = useState("");

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [colors, setColors] = useState([
    "#0070f3",
    "#3c90df",
    "#6aa8cb",
    "#98c0b7",
  ]);
  const [frames, setFrames] = useState<
    {
      color: string;
      title: string;
      slogan: string;
      description: string;
      image: string;
    }[]
  >([]);
  const handleGenerate = async () => {
    const response = await axios
      .post("/api/logo", {
        prompt: businessDescription,
        color: colors[selectedColorIndex],
      })
      .then((res) => {
        console.log(res.data);
        return res;
      })
      .catch((err) => {
        console.log(err.response);
      });

    const {
      data: { result },
    } = await axios.post<{ result: string }>("/api/generate", {
      userIdea: businessDescription,
    });

    const id = response?.data?.id;
    if (!id) return alert("Failed to generate logo");
    let status = response?.data?.status;
    let prediction: Record<string, any> = {};
    while (status !== "succeeded" && status !== "failed") {
      await sleep(1000);
      prediction = await axios.get(`/api/logo/${id}`);
      status = prediction.data.status;
      console.log({ prediction });
    }
    console.log({ prediction });
    if (status === "failed") {
      alert("Failed to generate logo");
      return;
    }
    const [companyNames, slogans, smallDescriptions] = result
      .trim()
      .split("\n\n")
      .map((item) =>
        item
          .split("\n")
          .slice(1)
          .map((item) => item.slice(3))
      );

    const newFrames = colors.map((color, index) => ({
      color,
      title: companyNames[index],
      slogan: slogans[index],
      description: smallDescriptions[index],
      image: prediction?.data.output[index],
    }));
    setFrames(newFrames);
  };

  const handleColorChange = (e: any) => {
    const newColor = e.target.value;
    const updatedColors = generateSimilarColors(newColor);
    setColors(updatedColors);
  };

  return (
    <>
      <Head>
        <title>INOVA</title>
        <meta name="description" content="Generate business frames" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Global
        styles={css`
          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
              Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
              sans-serif;
            -webkit-font-smoothing: antialiased;
          }
        `}
      />
      <Container>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
        >
          <Input
            required
            rows={16}
            placeholder="Descreva seu negócio aqui...*"
            value={businessDescription}
            onChange={(e) => setBusinessDescription(e.target.value)}
          />
          <div>
            <label htmlFor="color">Selecione uma cor:</label>
            <ColorPickerWrapper>
              <ColorPickerInput
                id="color"
                type="color"
                onChange={handleColorChange}
                value={colors[selectedColorIndex]}
                bgColor={colors[selectedColorIndex]}
              />
            </ColorPickerWrapper>
          </div>
          <Button type="submit"> GERAR </Button>
        </Form>

        <FramesContainer>
          {frames?.map((frame, index) => (
            <Frame key={index} bgColor={frame.color}>
              <FrameTop>
                <RoundImage src={frame.image} alt="Placeholder" />
                <div>
                  <h2>{frame.title}</h2>
                  <h3>{frame.slogan}</h3>
                </div>
              </FrameTop>
              <p style={{ marginTop: "16px" }}>{frame.description}</p>
            </Frame>
          ))}
        </FramesContainer>
      </Container>
    </>
  );
}
