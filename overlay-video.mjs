import {spawn} from 'node:child_process';
import {mkdir, writeFile, copyFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ffmpegPath = path.join(root, 'node_modules', '@remotion', 'compositor-win32-x64-msvc', 'ffmpeg.exe');
const port = 9336;
const fps = 12;
const width = 1280;
const height = 720;
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const frameDir = path.join(root, 'out', `overlay-frames-${stamp}`);
const output = path.join(root, 'out', `dango-with-custom-overlay-${stamp}.mp4`);
const userDataDir = path.join('C:\\tmp', `dango-overlay-profile-${stamp}`);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const srcVideo = path.join(root, 'out', 'dango-fullscreen-2026-05-12T14-36-21-001Z.mp4');
const srcImage = 'C:\\Users\\qwer1\\.gemini\\antigravity\\brain\\e6621297-353d-4492-8bc3-e241dc8230e3\\media__1778598581281.png';

if (!existsSync(srcVideo)) throw new Error(`Video not found: ${srcVideo}`);
if (!existsSync(srcImage)) throw new Error(`Image not found: ${srcImage}`);

await mkdir(frameDir, {recursive: true});

// Create a local html file
const htmlPath = path.join(root, 'public', `overlay-${stamp}.html`);
// We need the video and image in public to load locally via the dev server.
await copyFile(srcVideo, path.join(root, 'public', 'src-video.mp4'));
await copyFile(srcImage, path.join(root, 'public', 'src-image.png'));

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; padding: 0; background: black; overflow: hidden; width: 1280px; height: 720px; position: relative; }
  video { width: 1280px; height: 720px; object-fit: cover; }
  img { position: absolute; top: 16px; left: 16px; width: 240px; z-index: 10; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
</style>
</head>
<body>
  <video id="vid" src="src-video.mp4" muted preload="auto"></video>
  <img src="src-image.png" />
  <script>
    window.isReady = false;
    const vid = document.getElementById('vid');
    vid.addEventListener('canplaythrough', () => {
      window.isReady = true;
    }, {once: true});
  </script>
</body>
</html>
`;
await writeFile(htmlPath, htmlContent);

let server = null;
const canLoadGame = async () => {
  try {
    const response = await fetch(`http://localhost:4173/overlay-${stamp}.html`);
    return response.ok;
  } catch {
    return false;
  }
};

if (!(await canLoadGame())) {
  server = spawn(process.execPath, ['server.js'], {
    cwd: root,
    stdio: 'ignore',
  });
  for (let attempt = 0; attempt < 80; attempt++) {
    if (await canLoadGame()) break;
    await wait(250);
  }
}

const chrome = spawn(
  chromePath,
  [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--mute-audio',
    '--autoplay-policy=no-user-gesture-required',
    '--allow-file-access-from-files',
    `--window-size=${width},${height}`,
    `http://localhost:4173/overlay-${stamp}.html`,
  ],
  {stdio: 'ignore'}
);

const closeChrome = () => { try { chrome.kill(); } catch {} };
const closeServer = () => { if (server) { try { server.kill(); } catch {} } };

const getJson = async (url) => {
  for (let attempt = 0; attempt < 80; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch {
      await wait(250);
    }
  }
  throw new Error(`Could not connect to ${url}`);
};

try {
  const targets = await getJson(`http://localhost:${port}/json/list`);
  const pageTarget = targets.find((target) => target.type === 'page');
  const socket = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, {once: true});
    socket.addEventListener('error', reject, {once: true});
  });

  let nextId = 1;
  const pending = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const {resolve, reject} = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    }
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, {resolve, reject});
      socket.send(JSON.stringify({id, method, params}));
    });

  await send('Page.enable');
  await send('Runtime.enable');

  // Wait for ready
  for (let attempt = 0; attempt < 80; attempt++) {
    const ready = await send('Runtime.evaluate', {
      expression: 'window.isReady',
      returnByValue: true,
    });
    if (ready.result.value) break;
    await wait(150);
  }

  // Get duration
  let duration = 0;
  for (let attempt = 0; attempt < 80; attempt++) {
    const {result: {value: d}} = await send('Runtime.evaluate', {
      expression: 'document.getElementById("vid").duration',
      returnByValue: true,
    });
    if (d && !isNaN(d) && d > 0) {
      duration = d;
      break;
    }
    await wait(250);
  }

  if (!duration) throw new Error("Could not get video duration");
  console.log("Video duration:", duration);

  const totalFrames = Math.ceil(duration * fps);
  console.log("Total frames to process:", totalFrames);

  
  for (let frame = 0; frame < totalFrames; frame++) {
    const time = frame / fps;
    await send('Runtime.evaluate', {
      expression: `
        new Promise((resolve) => {
          const v = document.getElementById("vid");
          v.onseeked = () => resolve();
          v.currentTime = ${time};
        })
      `,
      awaitPromise: true,
    });
    
    // Tiny wait for paint
    await wait(10);
    
    const screenshot = await send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 90,
      fromSurface: true,
    });
    const filename = path.join(frameDir, `frame-${String(frame + 1).padStart(5, '0')}.jpg`);
    await writeFile(filename, Buffer.from(screenshot.data, 'base64'));
    
    if (frame % 50 === 0) console.log(`Processed frame ${frame}/${totalFrames}`);
  }

  socket.close();

  // Combine back
  await new Promise((resolve, reject) => {
    const ffmpeg = spawn(
      ffmpegPath,
      [
        '-y',
        '-framerate',
        String(fps),
        '-i',
        path.join(frameDir, 'frame-%05d.jpg'),
        '-vf',
        'format=yuv420p',
        '-movflags',
        '+faststart',
        output,
      ],
      {stdio: ['ignore', 'pipe', 'pipe']}
    );
    let stderr = '';
    ffmpeg.stderr.on('data', (chunk) => stderr += chunk.toString());
    ffmpeg.on('error', reject);
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr));
    });
  });

  console.log(`Success! Output at: ${output}`);

} finally {
  closeChrome();
  closeServer();
}
