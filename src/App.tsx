import { useMemo, useState } from "react";
import Card from "./components/Card";
import VideoDecoderView from "./components/VideoDecoderView";
import VideoEncoderView from "./components/VideoEncoderView";
import AudioDecoderView from "./components/AudioDecoderView";
import AudioEncoderView from "./components/AudioEncoderView";
import ImageDecoderView from "./components/ImageDecoderView";
import ImageEncoderView from "./components/ImageEncoderView";

function App() {
  const [entry, setEntry] = useState<string>("");
  const title = useMemo(() => {
    switch (entry) {
      case "video-decode":
        return "视频解码";
      case "video-encode":
        return "视频编码";
      case "audio-decode":
        return "音频解码";
      case "audio-encode":
        return "音频编码";
      case "image-decode":
        return "图片解码";
      case "image-encode":
        return "图片编码";
      default:
        return "WebCodecs Demo";
    }
  }, [entry]);

  const onBack = () => {
    setEntry("");
  };

  return (
    <div className="w-screen h-screen bg-base-100 flex flex-col items-center">
      <h1 className="text-6xl font-bold font-mono py-24">{title}</h1>
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
      {entry === "video-decode" && <VideoDecoderView onBack={onBack} />}
      {entry === "video-encode" && <VideoEncoderView onBack={onBack} />}
      {entry === "audio-decode" && <AudioDecoderView onBack={onBack} />}
      {entry === "audio-encode" && <AudioEncoderView onBack={onBack} />}
      {entry === "image-decode" && <ImageDecoderView onBack={onBack} />}
      {entry === "image-encode" && <ImageEncoderView onBack={onBack} />}
    </div>
  );
}

export default App;
