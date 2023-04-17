import { useState } from "react";
import Head from "next/head";
import { css, Global } from "@emotion/react";
import styled from "@emotion/styled";
import axios from "axios";
import { ClimbingBoxLoader } from "react-spinners";
import {
  Select,
  Button,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  gap: 16px;
  padding-top: 16px;
  padding-bottom: 16px;
  background-color: #1a1a1a;
  @media (max-width: 1000px) {
    display: flex;
    flex-direction: column;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 40%;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  gap: 16px;
  background-color: #404040;
  @media (max-width: 1000px) {
    width: 80%;
  }
`;

const Input = styled.textarea`
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const FramesContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  width: 100%;
  margin-top: 16px;
  gap: 16px;

  @media (min-width: 800px) {
    flex-direction: row;
  }
`;

const Frame = styled.div<{ bgColor: string }>`
  background-color: ${(props) => props.bgColor};
  flex: 1;
  min-width: calc(50% - 16px);
  height: 320px;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
  :hover {
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    transform: scale(1.03);
  }

  @media (max-width: 600px) {
    min-width: 100%;
  }
`;

const FrameTop = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const RoundImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalContent = styled.div`
  background-color: #fff;
  border-radius: 10px;
  max-width: 800px;
  width: 100%;
  overflow-y: auto;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(20%);
  opacity: 0;
  transition: all 0.3s ease-out;
  border: 1.6px solid #ccc;
  &.active {
    transform: translateY(0);
    opacity: 1;
  }
`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [businessDescription, setBusinessDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [selectedOption, setSelectedOption] = useState("");

  const CenteredImage = styled.img`
    width: 80%;
    max-width: 200px;
    height: auto;
    margin: 0 auto;
    display: block;
    object-fit: cover;
    border-radius: 50%;
  `;

  const [frames, setFrames] = useState<
    {
      title: string;
      slogan: string;
      description: string;
      image: string;
    }[]
  >([]);
  const [activeFrameIndex, setActiveFrameIndex] = useState<number | null>(null);

  const openFrame = (index: number) => {
    setActiveFrameIndex(index);
  };

  const closeFrame = () => {
    setActiveFrameIndex(null);
  };
  const handleGenerate = async () => {
    setIsLoading(true);
    const response = await axios
      .post("/api/logo", {
        prompt: businessDescription,
        select: selectedOption,
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
      setIsLoading(false);
      return;
    }
    const [companyNames, slogans, smallDescriptions] = result
      .trim()
      .replace(/"/g, "")
      .split("\n\n")
      .map((item) =>
        item
          .split("\n")
          .slice(1)
          .map((item) => item.slice(3))
      );

    const newFrames = prediction?.data?.output?.map(
      (logo: string, index: number) => ({
        title: companyNames[index],
        slogan: slogans[index],
        description: smallDescriptions[index],
        image: logo,
      })
    );
    setIsLoading(false);
    setFrames(newFrames);
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
          style={{ marginLeft: "16px" }}
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
        >
          <h1 style={{ width: "100%", textAlign: "center", color: "white" }}>
            <RoundImage
              src="../../assets/logo.png"
              style={{
                width: "10%",
                maxWidth: "90px",
                height: "auto",
                margin: "0 auto",
                display: "block",
              }}
              alt="Placeholder"
            />{" "}
            INOVA
          </h1>

          <Input
            required
            rows={16}
            placeholder="Descreva seu negócio aqui...*"
            value={businessDescription}
            onChange={(e) => setBusinessDescription(e.target.value)}
            maxLength={70}
            style={{ color: "black" }}
          />

          <FormControl required fullWidth>
            <InputLabel id="helper-label">Estilo</InputLabel>
            <Select
              labelId="helper-label"
              required
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              label="Estilo"
              style={{ backgroundColor: "white" }}
            >
              <MenuItem value="">Selecione um estilo</MenuItem>
              <MenuItem value="Modern">Moderno</MenuItem>
              <MenuItem value="Classic">Clássico</MenuItem>
              <MenuItem value="Vintage">Vintage</MenuItem>
            </Select>
          </FormControl>

          <Button type="submit" variant="contained" startIcon={<SendIcon />}>
            {" "}
            GERAR{" "}
          </Button>
        </Form>

        <FramesContainer>
          {isLoading ? (
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "right",
              }}
            >
              <ClimbingBoxLoader color="white" size={20} />
            </div>
          ) : (
            <>
              {activeFrameIndex !== null && (
                <ModalOverlay onClick={closeFrame}>
                  <ModalContent
                    className="active"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {frames?.length ? (
                      <Frame
                        bgColor={"#404040"}
                        style={{ transform: "scale(1.00)", cursor: "default" }}
                      >
                        <FrameTop>
                          <RoundImage
                            src={frames[activeFrameIndex].image}
                            alt="Placeholder"
                          />
                          <div style={{ color: "#fff" }}>
                            <h1>{frames[activeFrameIndex].title}</h1>
                            <h2 style={{ marginTop: "8px" }}>
                              {frames[activeFrameIndex].slogan}
                            </h2>
                          </div>
                        </FrameTop>
                        <p style={{ marginTop: "16px", color: "#ffffffc8" }}>
                          {frames[activeFrameIndex].description}
                        </p>
                      </Frame>
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "right",
                        }}
                      >
                        <ClimbingBoxLoader color="white" size={20} />
                      </div>
                    )}
                  </ModalContent>
                </ModalOverlay>
              )}
              {!isLoading &&
                frames.map((frame, index) => (
                  <Frame
                    key={index}
                    bgColor={"#404040"}
                    style={{ cursor: "pointer" }}
                    onClick={() => openFrame(index)}
                  >
                    <h1
                      style={{
                        textAlign: "center",
                        color: "#fff",
                        WebkitTextStroke: "1px #000",
                      }}
                    >
                      {frame.title}
                    </h1>
                    <CenteredImage src={frame.image} alt="Placeholder" />
                  </Frame>
                ))}
            </>
          )}
        </FramesContainer>
      </Container>
    </>
  );
}
