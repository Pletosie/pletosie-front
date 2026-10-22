// Store a compact PCM file whose duration comes from samples, never container timestamps.
export function pcmWav(samples: Float32Array, sampleRate = 16000): ArrayBuffer {
  const result = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(result);
  const text = (at: number, value: string) => {
    for (let i = 0; i < value.length; i++)
      view.setUint8(at + i, value.charCodeAt(i));
  };
  text(0, "RIFF");
  view.setUint32(4, result.byteLength - 8, true);
  text(8, "WAVE");
  text(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 32768 : s * 32767, true);
  }
  return result;
}
export async function prepareVoice(
  parts: Blob[],
): Promise<{ blob: Blob; duration: number }> {
  const context = new AudioContext();
  try {
    const buffers = [];
    for (const part of parts)
      buffers.push(await context.decodeAudioData(await part.arrayBuffer()));
    const total = buffers.reduce((sum, b) => sum + b.duration, 0);
    if (!Number.isFinite(total) || total < 0.2 || total > 180)
      throw new Error(
        "Le vocal doit durer entre une seconde et trois minutes.",
      );
    const output = new OfflineAudioContext(1, Math.ceil(total * 16000), 16000);
    let position = 0;
    for (const buffer of buffers) {
      const source = output.createBufferSource();
      source.buffer = buffer;
      source.connect(output.destination);
      source.start(position);
      position += buffer.duration;
    }
    const rendered = await output.startRendering();
    return {
      blob: new Blob([pcmWav(rendered.getChannelData(0))], {
        type: "audio/wav",
      }),
      duration: rendered.duration,
    };
  } finally {
    await context.close();
  }
}
