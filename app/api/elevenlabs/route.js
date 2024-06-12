import fs from "fs";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";

const streamPipeline = promisify(pipeline);

export async function POST(request) {
  const { message, voice } = await request.json();
  console.log("message, voice :", message, voice);
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        method: "POST",
        headers: {
          accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: message,
          voice_settings: {
            stability: 1.0,
            similarity_boost: 1.0,
            style: 0.0,
            use_speaker_boost: false,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Something went wrong");
    }
    /**
     * fetch 요청에서 응답 타입을 audio/mpeg으로 설정했기 때문에, 
     * 응답은 바이너리 데이터로 와야 합니다. 
     * 이 바이너리 데이터를 JSON으로 파싱하려고 하면 에러가 발생합니다. 
     * 대신, 바이너리 데이터를 스트림으로 직접 처리하는 것이 맞습니다. 
     * */  
    // const data = await response.json();
    // console.log("API Response Data:", data);

    // const arrayBuffer = await response.arrayBuffer();
    // const buffer = Buffer.from(arrayBuffer);
    const file = Math.random().toString(36).substring(7);
    const filePath = path.join("public", "audio", `${file}.mp3`);
    // 디렉터리 존재 여부 확인 및 생성
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const fileStream = fs.createWriteStream(filePath);

    await streamPipeline(response.body, fileStream);
    console.log(`File saved at ${filePath}`);
    // fs.writeFile(path.join("public", "audio", `${file}.mp3`), buffer, () => {
    //   console.log("File written successfully");
    // });

    return new Response(JSON.stringify({ file: `${file}.mp3` }));
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }));
  }
}
