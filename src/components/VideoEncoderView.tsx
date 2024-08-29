import { useRef } from "react";
import videoUrl from "../assets/bunny.mp4";
import useOnceEffect from "../hooks/useOnceEffect";
import { sleep } from "bittydash";
import MP4Box from "mp4box";

function VideoEncoderView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useOnceEffect(() => {
    const video = document.createElement("video");
    (async () => {
      await new Promise((resolve, reject) => {
        video.onloadeddata = () => {
          video.onloadeddata = null;
          video.onerror = null;
          resolve(null);
        };
        video.onerror = () => {
          video.onloadeddata = null;
          video.onerror = null;
          reject(new Error("Video error"));
        };
        video.src = videoUrl;
      });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const width = video.videoWidth;
      const height = video.videoHeight;
      const fps = 30;
      const GOP = 250;
      const recordDuration = 4;

      let encodeCount = 0;
      let outputCount = 0;
      const totalFrames = Math.floor(recordDuration * fps);

      canvasRef.current.width = width;
      canvasRef.current.height = height;
      const mp4box = MP4Box.createFile();
      const trackOptions = {
        timescale: 1_000_000,
        width,
        height,
        nb_samples: totalFrames,
        codec: "avc1.42001E",
        brands: ["isom", "iso2", "avc1", "mp42", "mp41"],
      };

      let trackId = null;
      // const trackId = mp4box.addTrack(trackOptions);

      const videoConfig = {
        width,
        height,
        codec: "avc1.42001E",
        bitrate: 1000000,
        framerate: fps,
        alpha: "discard",
        
        // https://github.com/gpac/mp4box.js/issues/243
        avc: { format: "avc" },
      };
      await VideoEncoder.isConfigSupported(videoConfig as VideoEncoderConfig);
      const encoder = new VideoEncoder({
        error: e => {
          console.error(e);
        },
        output: (chunk, config) => {
          if (trackId === null) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            trackOptions.avcDecoderConfigRecord =
              config?.decoderConfig.description;
            trackId = mp4box.addTrack(trackOptions);
          }
          const buf = new ArrayBuffer(chunk.byteLength);
          chunk.copyTo(buf);
          mp4box.addSample(trackId, buf, {
            dts: chunk.timestamp,
            cts: chunk.timestamp,
            duration: chunk.duration,
            is_sync: chunk.type === "key",
            data: buf,
          });
          outputCount++;
          if (outputCount === totalFrames) {
            mp4box.save("video-encoder.mp4");
          }
        },
      });
      encoder.configure(videoConfig as VideoEncoderConfig);

      let nextTime = 0;
      while (true) {
        if (encoder.encodeQueueSize > 10) {
          await sleep(10);
          continue;
        }

        const time = await new Promise<number>((resolve, reject) => {
          if (nextTime > recordDuration) {
            resolve(-1);
            return;
          }

          if (video.currentTime === nextTime) {
            resolve(nextTime);
            nextTime += 1 / fps;
            return;
          }

          video.onseeked = () => {
            video.onseeked = null;
            video.onerror = null;
            resolve(video.currentTime);
          };
          video.onerror = () => {
            video.onseeked = null;
            video.onerror = null;
            reject(new Error("Video error"));
          };
          video.currentTime = nextTime;
          nextTime += 1 / fps;
        });

        if (time === -1) {
          encoder.flush();
          break;
        }

        ctx.drawImage(video, 0, 0, width, height);
        const videoFrame = new VideoFrame(canvas, {
          timestamp: time * 1e6,
          duration: (1 / fps) * 1e6,
        });
        encodeCount++;
        encoder.encode(videoFrame, { keyFrame: encodeCount % GOP === 0 });
        videoFrame.close();
      }
    })();
  });

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <canvas ref={canvasRef} />
    </div>
  );
}

export default VideoEncoderView;
