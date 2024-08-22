import { useState } from "react";
import Card from "./components/Card";
import VideoDecoderView from "./components/VideoDecoderView";
import VideoEncoderView from "./components/VideoEncoderView";
import AudioDecoderView from "./components/AudioDecoderView";
import AudioEncoderView from "./components/AudioEncoderView";
import ImageDecoderView from "./components/ImageDecoderView";
import ImageEncoderView from "./components/ImageEncoderView";

function App() {
  const [entry, setEntry] = useState<string>("");

  return (
    <div className="w-screen h-screen bg-base-100 flex flex-col items-center">
      <h1 className="text-6xl font-bold font-mono py-24">WebCodecs Demo</h1>
      {entry === "" && (
        <div className=" items-center justify-center gap-y-8 gap-x-12 grid grid-cols-2">
          {[
            { title: "视频解码", onClick: () => setEntry("video-decode") },
            { title: "视频编码", onClick: () => setEntry("video-encode") },
            { title: "音频解码", onClick: () => setEntry("audio-decode") },
            { title: "音频编码", onClick: () => setEntry("audio-encode") },
            { title: "图片解码", onClick: () => setEntry("image-decode") },
            { title: "图片编码", onClick: () => setEntry("image-encode") },
          ].map(item => {
            return (
              <Card
                key={item.title}
                title={item.title}
                onClick={item.onClick}
              />
            );
          })}
        </div>
      )}
      {entry === "video-decode" && <VideoDecoderView />}
      {entry === "video-encode" && <VideoEncoderView />}
      {entry === "audio-decode" && <AudioDecoderView />}
      {entry === "audio-encode" && <AudioEncoderView />}
      {entry === "image-decode" && <ImageDecoderView />}
      {entry === "image-encode" && <ImageEncoderView />}
    </div>
  );
}

export default App;
