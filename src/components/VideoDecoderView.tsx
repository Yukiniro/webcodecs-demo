/* eslint-disable camelcase */
import MP4Box from "mp4box";
import videoUrl from "../assets/bunny.mp4";
import useOnceEffect from "../hooks/useOnceEffect";
import { sleep } from "bittydash";

function VideoDecoderView(props: { onBack: () => void }) {
  const { onBack } = props;

  useOnceEffect(() => {
    let videoInfo = null;
    const videoSamples = [];

    const decodeVideo = async videoSamples => {
      const videoDecoder = new VideoDecoder({
        error: (e: unknown) => {
          console.error(e);
        },
        output: (vf: VideoFrame) => {
          console.log(vf);
        },
      });

      const { track_width, track_height, codec, timescale } =
        videoInfo.videoTracks[0];
      videoDecoder.configure({
        codedWidth: track_width,
        codedHeight: track_height,
        codec,
      });

      while (videoSamples.length > 0) {
        if (videoDecoder.decodeQueueSize > 20) {
          await sleep(50);
          continue;
        }
        const sample = videoSamples.shift();
        const { dts, cts, timescale, data, duration } = sample;
        videoDecoder.decode(sample);
      }
    };

    const mp4box = MP4Box.createFile();
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
  });

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <button className="btn btn-primary" onClick={onBack}>
        Back
      </button>
    </div>
  );
}

export default VideoDecoderView;
