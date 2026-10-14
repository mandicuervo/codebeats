// MOTOR: gravação de vídeo
// Grava o canvas e o som juntos num arquivo. Funciona com qualquer cena, porque
// grava o que estiver desenhado no canvas.

const btnRec = document.getElementById('btnRec');
const startAtInput = document.getElementById('startAt');
const durSelect = document.getElementById('dur');
const dlLink = document.getElementById('dl');
const recStatus = document.getElementById('recStatus');

let recorder = null;
let recChunks = [];
let recVideoStream = null;
let recording = false;
let dlUrl = null;

// Escolhe o melhor formato que o navegador sabe gravar. MP4 vem primeiro porque
// é o que o TikTok aceita; WebM é o plano B.
function pickMime() {
  const types = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) || '';
}

function startRecording() {
  if (!audioBuffer) {
    recStatus.textContent = 'Carregue uma música primeiro.';
    return;
  }
  if (!window.MediaRecorder) {
    recStatus.textContent = 'Este navegador não grava vídeo. Use Chrome ou Edge.';
    return;
  }

  ensureAnalyser(); // garante que recDest exista
  if (source) stopMusic(); // evita duas músicas ao mesmo tempo

  // Fluxo de vídeo (canvas a até 30 quadros por segundo) + fluxo de áudio.
  recVideoStream = drawingContext.canvas.captureStream(30);
  const stream = new MediaStream([
    ...recVideoStream.getVideoTracks(),
    ...recDest.stream.getAudioTracks(),
  ]);

  const mime = pickMime();
  recorder = new MediaRecorder(stream, {
    mimeType: mime || undefined,
    videoBitsPerSecond: 8_000_000,
  });
  recChunks = [];
  recorder.ondataavailable = (e) => { if (e.data.size) recChunks.push(e.data); };
  recorder.onstop = saveRecording;

  // Trecho a gravar.
  const offset = Math.max(0, Math.min(Number(startAtInput.value) || 0, audioBuffer.duration - 1));
  const duration = durSelect.value === 'full' ? undefined : Number(durSelect.value);

  dlLink.hidden = true;
  recording = true;
  btnRec.textContent = 'Parar gravação';
  recStatus.textContent = 'Gravando... mantenha esta aba aberta e visível.';

  audioEvents.onStop = finishRecording; // quando a música parar, fecha o arquivo
  recorder.start(250);                  // entrega um pedaço a cada 250 ms
  startMusic(offset, duration);
}

// Chamada quando a música para (fim do trecho ou botão). Espera 200 ms para o
// último pedaço de som e imagem entrar no arquivo e então encerra o gravador.
function finishRecording() {
  audioEvents.onStop = null;
  if (!recording) return;
  recording = false;
  btnRec.textContent = 'Gravar vídeo';
  recStatus.textContent = 'Finalizando o arquivo...';
  setTimeout(() => {
    if (recorder && recorder.state !== 'inactive') recorder.stop();
  }, 200);
}

// Quando o gravador termina: junta os pedaços num arquivo e libera o link.
function saveRecording() {
  recVideoStream.getVideoTracks().forEach((t) => t.stop());

  const type = recorder.mimeType || 'video/webm';
  const ext = type.includes('mp4') ? 'mp4' : 'webm';
  const blob = new Blob(recChunks, { type });

  if (dlUrl) URL.revokeObjectURL(dlUrl);
  dlUrl = URL.createObjectURL(blob);

  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  dlLink.href = dlUrl;
  dlLink.download = `dreamy-${stamp}.${ext}`;
  dlLink.textContent = `Baixar vídeo (${ext.toUpperCase()}, ${(blob.size / 1048576).toFixed(1)} MB)`;
  dlLink.hidden = false;

  recStatus.textContent = ext === 'mp4'
    ? 'Pronto. MP4 é o formato aceito pelo TikTok.'
    : 'Pronto, mas em WebM. Converta para MP4 antes de postar (CapCut, HandBrake ou ffmpeg).';
}

btnRec.addEventListener('click', () => (recording ? stopMusic() : startRecording()));