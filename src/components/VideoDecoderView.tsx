/* eslint-disable camelcase */
import MP4Box from "mp4box";
import videoUrl from "../assets/bunny.mp4";
import useOnceEffect from "../hooks/useOnceEffect";

function VideoDecoderView(props: { onBack: () => void }) {
  const { onBack } = props;

  useOnceEffect(() => {
    let width = 0;
    let height = 0;
    let samples = [];
    let sampleCounts = 0;
    let frameRate = 0;

    const decodeVideo = async samples => {
      const videoDecoder = new VideoDecoder({
        error: (e: unknown) => {
          console.error(e);
        },
        output: (vf: VideoFrame) => {
          console.log(vf);
        },
      });
    };

    const mp4box = MP4Box.createFile();
    mp4box.onError = (e: unknown) => {
      console.error(e);
    };
    mp4box.onReady = info => {
      console.log("mp4box ready", info);
      const videoTrack = info.videoTracks[0];
      const { track_width, track_height, id, nb_samples } = videoTrack;
      sampleCounts = nb_samples;
      width = track_width;
      height = track_height;
      mp4box.setExtractionOptions(id);
      mp4box.start();
    };
    mp4box.onSamples = (id, user, samples) => {
      samples.push(...samples);
      if (samples.length === sampleCounts) {
        decodeVideo(samples);
      }
    };

    fetch(videoUrl)
      .then(res => res.arrayBuffer())
      .then(buffer => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        buffer.fileStart = 0;
        mp4box.appendBuffer(buffer);
        // mp4box.start();
      })
      .finally(() => {
        // mp4box.flush();
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
