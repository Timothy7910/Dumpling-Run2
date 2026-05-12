import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9334;
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outputImage = path.join(root, 'out', `sim-results-${stamp}.png`);
const userDataDir = path.join('C:\\tmp', `dango-sim-profile-${stamp}`);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let server = null;

if (!existsSync(chromePath)) {
  throw new Error(`Chrome not found at ${chromePath}`);
}

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

const chrome = spawn(
  chromePath,
  [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--mute-audio',
    `--window-size=1280,900`,
    'http://localhost:4173',
  ],
  {stdio: 'ignore'}
);

const closeChrome = () => {
  try {
    chrome.kill();
  } catch {}
};

const closeServer = () => {
  if (!server) return;
  try {
    server.kill();
  } catch {}
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
  await send('DOM.enable');

  await send('Page.navigate', {url: 'http://localhost:4173'});
  for (let attempt = 0; attempt < 80; attempt++) {
    const ready = await send('Runtime.evaluate', {
      expression: 'document.readyState === "complete" && !!document.querySelector("#simulateButton")',
      returnByValue: true,
    });
    if (ready.result.value) break;
    await wait(150);
  }

  // Set simulation count to 50000 and click simulate
  await send('Runtime.evaluate', {
    expression: `
      document.querySelector('#simCount').value = '50000';
      document.querySelector('#simulateButton').click();
    `,
  });

  // Wait for simulation to complete (results rendered)
  for (let attempt = 0; attempt < 80; attempt++) {
    const done = await send('Runtime.evaluate', {
      expression: 'document.querySelector("#simResults").children.length > 0',
      returnByValue: true,
    });
    if (done.result.value) break;
    await wait(200);
  }

  await wait(500); // Give it a moment to finish rendering

  // Get the bounding box of the .sim-panel
  const {result: {objectId}} = await send('Runtime.evaluate', {
    expression: 'document.querySelector(".sim-panel")',
    returnByValue: false,
  });

  const {model} = await send('DOM.getBoxModel', {objectId});
  const rect = model.border;
  
  // Capture screenshot of that area
  const screenshot = await send('Page.captureScreenshot', {
    format: 'png',
    clip: {
      x: rect[0],
      y: rect[1],
      width: rect[4] - rect[0],
      height: rect[5] - rect[1],
      scale: 2 // High res
    }
  });

  await writeFile(outputImage, Buffer.from(screenshot.data, 'base64'));
  console.log(outputImage);
  socket.close();

} finally {
  closeChrome();
  closeServer();
}
