import { useState } from "react";
import Head from "next/head";
import { css, Global } from "@emotion/react";
import styled from "@emotion/styled";
import axios from "axios";
import { ClimbingBoxLoader } from "react-spinners";

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
  background-color: #1a1a1a;
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalContent = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(20%);
  opacity: 0;
  transition: all 0.3s ease-out;
  &.active {
    transform: translateY(0);
    opacity: 1;
  }
`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [businessDescription, setBusinessDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
            maxLength={70}
          />
          <Button type="submit"> GERAR </Button>
        </Form>

        <FramesContainer>
          {isLoading ? (
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <ClimbingBoxLoader size={20} />
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
                      <Frame bgColor={"#fff9de"}>
                        <FrameTop>
                          <RoundImage
                            src={frames[activeFrameIndex].image}
                            alt="Placeholder"
                          />
                          <div>
                            <h1>{frames[activeFrameIndex].title}</h1>
                            <h2 style={{ marginTop: "8px" }}>
                              {frames[activeFrameIndex].slogan}
                            </h2>
                          </div>
                        </FrameTop>
                        <p style={{ marginTop: "16px" }}>
                          {frames[activeFrameIndex].description}
                        </p>
                      </Frame>
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <ClimbingBoxLoader size={20} />
                      </div>
                    )}
                  </ModalContent>
                </ModalOverlay>
              )}
              {!isLoading &&
                frames.map((frame, index) => (
                  <Frame
                    key={index}
                    bgColor={"#fff9de"}
                    style={{ cursor: "pointer" }}
                    onClick={() => openFrame(index)}
                  >
                    <h1 style={{ textAlign: "center" }}>{frame.title}</h1>
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
