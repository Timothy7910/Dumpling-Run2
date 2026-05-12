import {spawn} from 'node:child_process';
import {mkdir, writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ffmpegPath = path.join(root, 'node_modules', '@remotion', 'compositor-win32-x64-msvc', 'ffmpeg.exe');
const port = 9333;
const fps = 12;
const width = 1280;
const height = 720;
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const frameDir = path.join(root, 'out', `gameplay-frames-${stamp}`);
const output = path.join(root, 'out', `dango-fullscreen-${stamp}.mp4`);
const userDataDir = path.join('C:\\tmp', `dango-gameplay-profile-${stamp}`);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let server = null;

if (!existsSync(chromePath)) {
  throw new Error(`Chrome not found at ${chromePath}`);
}
if (!existsSync(ffmpegPath)) {
  throw new Error(`FFmpeg not found at ${ffmpegPath}`);
}

await mkdir(frameDir, {recursive: true});
await mkdir(userDataDir, {recursive: true});

const canLoadGame = async () => {
  try {
    const response = await fetch('http://localhost:4173/index.html');
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

if (!(await canLoadGame())) {
  throw new Error('Game server did not start at http://localhost:4173');
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
    `--window-size=${width},${height}`,
    'http://localhost:4173',
  ],
  {stdio: 'ignore'}
);

const closeChrome = () => {
  try {
    chrome.kill();
  } catch {
  }
};

const closeServer = () => {
  if (!server) return;
  try {
    server.kill();
  } catch {
  }
};

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
  if (!pageTarget?.webSocketDebuggerUrl) {
    throw new Error('Could not find a Chrome page target');
  }

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
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await send('Page.navigate', {url: 'http://localhost:4173'});
  for (let attempt = 0; attempt < 80; attempt++) {
    const ready = await send('Runtime.evaluate', {
      expression: 'document.readyState === "complete" && !!document.querySelector("#autoButton")',
      returnByValue: true,
    });
    if (ready.result.value) break;
    await wait(150);
  }

  await send('Runtime.evaluate', {
    expression: `
      // Hide other UI elements to make stage full screen
      if (document.querySelector('.topbar')) document.querySelector('.topbar').style.display = 'none';
      if (document.querySelector('.stage-head')) document.querySelector('.stage-head').style.display = 'none';
      if (document.querySelector('.side-panel')) document.querySelector('.side-panel').style.display = 'none';
      if (document.querySelector('.lower-grid')) document.querySelector('.lower-grid').style.display = 'none';
      
      const stage = document.querySelector('.stage');
      if (stage) {
        stage.style.position = 'fixed';
        stage.style.inset = '0';
        stage.style.width = '100vw';
        stage.style.height = '100vh';
        stage.style.zIndex = '9999';
        stage.style.borderRadius = '0';
        stage.style.margin = '0';
        stage.style.maxWidth = 'none';
      }

      document.body.style.zoom = "1";
      document.body.style.overflow = "hidden";
      document.body.style.margin = "0";
      window.scrollTo(0, 0);

      document.querySelector("#newGameButton").click();
    `,
  });
  await wait(400);
  await send('Runtime.evaluate', {
    expression: 'document.querySelector("#autoButton").click();',
  });

  let frame = 0;
  let endHoldFrames = 0;
  const maxFrames = fps * 240;
  const frameDuration = 1000 / fps;
  let nextFrameAt = Date.now();

  while (frame < maxFrames) {
    const screenshot = await send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 90,
      fromSurface: true,
      captureBeyondViewport: false,
    });
    const filename = path.join(frameDir, `frame-${String(frame + 1).padStart(5, '0')}.jpg`);
    await writeFile(filename, Buffer.from(screenshot.data, 'base64'));
    frame++;

    const ended = await send('Runtime.evaluate', {
      expression: 'Boolean(document.querySelector("#endModal") && !document.querySelector("#endModal").hidden)',
      returnByValue: true,
    });
    if (ended.result.value) endHoldFrames++;
    if (endHoldFrames >= fps * 4) break;

    nextFrameAt += frameDuration;
    await wait(Math.max(0, nextFrameAt - Date.now()));
  }

  socket.close();

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
    ffmpeg.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    ffmpeg.on('error', reject);
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr));
    });
  });

  console.log(output);
} finally {
  closeChrome();
  closeServer();
}
