/* eslint-disable camelcase */
import MP4Box from "mp4box";
import videoUrl from "../assets/bunny.mp4";
import useOnceEffect from "../hooks/useOnceEffect";
import { sleep } from "bittydash";
import { useRef } from "react";
import { parseVideoCodecDesc } from "../util";

function VideoDecoderView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useOnceEffect(() => {
    const mp4box = MP4Box.createFile();

    let videoInfo = null;
    const videoSamples = [];
    const videoFrames = [];

    const decodeVideo = async videoSamples => {
      const videoDecoder = new VideoDecoder({
        error: (e: unknown) => {
          console.error(e);
        },
        output: (vf: VideoFrame) => {
          videoFrames.push(vf);
        },
      });

      const { track_width, track_height, codec, timescale, duration, id } =
        videoInfo.videoTracks[0];
      const desc = parseVideoCodecDesc(mp4box.getTrackById(id)).buffer;
      const step = duration / timescale / videoSamples.length;

      setInterval(() => {
        const vf = videoFrames.shift();
        if (!vf) return;
        // console.log(vf.timestamp);
        canvasRef.current!.width = vf.displayWidth;
        canvasRef.current!.height = vf.displayHeight;
        canvasRef.current?.getContext("2d")?.drawImage(vf, 0, 0);
        vf.close();
      }, step * 1e3);

      videoDecoder.configure({
        codedWidth: track_width,
        codedHeight: track_height,
        description: desc,
        codec,
      });

      while (videoSamples.length > 0) {
        if (videoDecoder.decodeQueueSize > 20 || videoFrames.length > 30) {
          await sleep(50);
          continue;
        }
        const sample = videoSamples.shift();
        const chunk = new EncodedVideoChunk({
          type: sample.is_sync ? "key" : "delta",
          timestamp: (sample.dts / timescale) * 1e6,
          duration: (sample.duration / timescale) * 1e6,
          data: sample.data,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          transfer: [sample.data.buffer],
        });
        videoDecoder.decode(chunk);
      }
    };

    mp4box.onError = (e: unknown) => {
      console.error(e);
    };
    mp4box.onReady = info => {
      console.log("mp4box ready", info);
      videoInfo = info;
      const videoTrack = info.videoTracks[0];
      mp4box.setExtractionOptions(videoTrack.id);
      mp4box.start();
    };
    mp4box.onSamples = (id, user, samples) => {
      videoSamples.push(...samples);
      if (videoSamples.length === videoInfo.videoTracks[0].nb_samples) {
        decodeVideo(videoSamples);
      }
    };

    fetch(videoUrl)
      .then(res => res.arrayBuffer())
      .then(buffer => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        buffer.fileStart = 0;
        mp4box.appendBuffer(buffer);
      })
      .finally(() => {
        mp4box.flush();
      });

    return () => {
      mp4box.flush();
    };
  });

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <canvas ref={canvasRef} />
    </div>
  );
}

export default VideoDecoderView;
