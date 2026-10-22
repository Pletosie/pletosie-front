const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
function load(file, dependencies) {
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const module = { exports: {} };
  new Function("require", "module", "exports", source)(
    (name) => dependencies[name],
    module,
    module.exports,
  );
  return module.exports;
}
test("plusieurs pauses longues sont exclues du compteur, du fichier et de l’aperçu", async () => {
  let now = 0,
    frame,
    slot = 0;
  const hooks = [];
  let result, error;
  const react = {
    useRef: (v) => {
      const i = slot++;
      return (hooks[i] ??= { current: v });
    },
    useState: (v) => {
      const i = slot++;
      hooks[i] ??= v;
      return [hooks[i], (v) => (hooks[i] = v)];
    },
    useEffect: () => {},
  };
  const jsx = (type, props) => ({ type, props });
  const original = {};
  const set = (name, value) => {
    original[name] = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, {
      value,
      configurable: true,
      writable: true,
    });
  };
  const stream = { getTracks: () => [{ stop() {} }] };
  class Recorder {
    static isTypeSupported() {
      return true;
    }
    state = "inactive";
    start() {
      this.state = "recording";
      this.startTime = now;
    }
    stop() {
      this.state = "inactive";
      const duration = (now - this.startTime) / 1000;
      queueMicrotask(() => {
        this.ondataavailable?.({
          data: new Blob([JSON.stringify({ duration })]),
        });
        this.onstop?.();
      });
    }
  }
  class Context {
    createAnalyser() {
      return { fftSize: 256, getByteTimeDomainData: (s) => s.fill(128) };
    }
    createMediaStreamSource() {
      return { connect() {} };
    }
    async resume() {}
    async close() {}
    async decodeAudioData(bytes) {
      return JSON.parse(new TextDecoder().decode(bytes));
    }
  }
  class Offline {
    constructor(channels, length, rate) {
      this.length = length;
      this.rate = rate;
      this.destination = {};
    }
    createBufferSource() {
      return { connect() {}, start() {} };
    }
    async startRendering() {
      return {
        duration: this.length / this.rate,
        getChannelData: () => new Float32Array(this.length),
      };
    }
  }
  class Reader {
    async readAsDataURL(blob) {
      this.result =
        "data:audio/wav;base64," +
        Buffer.from(await blob.arrayBuffer()).toString("base64");
      this.onload?.();
      this.onloadend?.();
    }
  }
  try {
    set("performance", { now: () => now });
    set("navigator", { mediaDevices: { getUserMedia: async () => stream } });
    set("window", { MediaRecorder: Recorder });
    set("MediaRecorder", Recorder);
    set("AudioContext", Context);
    set("OfflineAudioContext", Offline);
    set("FileReader", Reader);
    set("requestAnimationFrame", (cb) => {
      frame = cb;
      return 1;
    });
    set("cancelAnimationFrame", () => {
      frame = null;
    });
    const audio = load("src/lib/voice-audio.ts", {});
    const { VoiceRecorder } = load("src/components/voice.tsx", {
      react: react,
      "react/jsx-runtime": { jsx, jsxs: jsx },
      "./icon": { Icon: () => null },
      "../lib/voice-audio": audio,
    });
    const render = () => {
      slot = 0;
      return VoiceRecorder({
        onReady: (data, mime, duration) => (result = { data, mime, duration }),
        onError: (e) => (error = e),
      });
    };
    const find = (node, label) => {
      if (!node || typeof node !== "object") return;
      if (node.props?.["aria-label"] === label) return node;
      for (const child of [node.props?.children].flat(Infinity)) {
        const found = find(child, label);
        if (found) return found;
      }
    };
    const click = async (label) => {
      const node = find(render(), label);
      assert.ok(node, label);
      await node.props.onClick();
    };
    const advance = (ms) => {
      now += ms;
      frame?.(now);
    };
    await click("Enregistrer un vocal");
    await new Promise((r) => setImmediate(r));
    advance(3000);
    await click("Mettre l’enregistrement en pause");
    advance(27 * 60 * 1000);
    assert.equal(
      render().props.children.find((n) => n.type === "time").props.children,
      "0:03",
    );
    assert.equal(find(render(), "Enregistrement en pause").type, "canvas");
    await click("Reprendre l’enregistrement");
    advance(2000);
    await click("Mettre l’enregistrement en pause");
    advance(60000);
    await click("Reprendre l’enregistrement");
    advance(1000);
    await click("Terminer et écouter le vocal");
    for (let i = 0; i < 15 && !result && !error; i++)
      await new Promise((r) => setImmediate(r));
    assert.equal(error, undefined);
    assert.ok(result);
    assert.equal(result.mime, "audio/wav");
    assert.equal(result.duration, 6);
    const bytes = Buffer.from(result.data.split(",")[1], "base64");
    assert.equal(bytes.toString("ascii", 8, 12), "WAVE");
    assert.equal(bytes.readUInt32LE(40) / 32000, 6);
  } finally {
    for (const [name, descriptor] of Object.entries(original)) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
});
