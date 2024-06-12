"use client";
import { useRef, useState } from "react";

export default function Home() {
  const voiceRef = useRef();
  const textRef = useRef();

  const [ audio, setAudio ] = useState(null);
  const [ loading, setLoading ] = useState(false)

  // handle TTS button
  async function handleTTS (){
    const selectedVoice = voiceRef.current.value;
    const text = textRef.current.value;
    setLoading(true);
    
    try {
      if(!text || text.trim() === ""){
        alert("내용을 입력하세요")
        return;
      }
     
      const response = await fetch("/api/elevenlabs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          voice: selectedVoice,
        }),
      });

      if(!response.ok){
        throw new Error("Something went wrong")
      }
      
      const { file } = await response.json();
      // const data = await response.json()
     
      setAudio(file);

    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <main>
      <div className="bg-white py-4 px-4 rounded-md ">
        <h3 className="text-2xl font-bold text-blue-800 uppercase mb-6">
          텍스트를 보이스로 ..
        </h3>
        <div className="my-6 flex flex-col gap-4">
          <div className="flex gap-4 items-center">
            <label>보이스 선택 :</label>
            <select ref={voiceRef} className="bg-blue-100 py-2 text-md px-4 rounded-lg">
              <option value="HcuPrSpYBWuiWPJ9KuE8">John</option>
              <option value="ZJCNdZEjYwkOElxugmW2">MinSu</option>
            </select>
          </div>
          <textarea
            className="p-4 border border-blue-200 rounded-lg outline-none placeholder-gray-400 focus-within:drop-shadow-md"
            placeholder="텍스트를 음성으로 바꿔드립니다."
            cols={50}
            rows={10}
            ref={textRef}
          />

          <button
          disabled={loading}
            className="py-2 px-4 bg-blue-800 text-white rounded-lg hover:opacity-80"
            onClick={handleTTS}
          >
            {loading ? "생성 중..." : "Generate TTS"}
          </button>
          {audio && (
            <audio autoPlay controls src={`audio/${audio}`}/>
          )}
        </div>
      </div>
    </main>
  );
}
