/* eslint-disable camelcase */
import MP4Box from "mp4box";

export function parseVideoCodecDesc(track): Uint8Array {
  for (const entry of track.mdia.minf.stbl.stsd.entries) {
    const box = entry.avcC ?? entry.hvcC ?? entry.vpcC;
    if (box != null) {
      const stream = new MP4Box.DataStream(
        undefined,
        0,
        MP4Box.DataStream.BIG_ENDIAN,
      );
      box.write(stream);
      return new Uint8Array(stream.buffer.slice(8)); // Remove the box header.
    }
  }
  throw Error("avcC, hvcC or VPX not found");
}
