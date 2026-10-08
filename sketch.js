// =========================
// 1) CONTROLE DE ÁUDIO
// =========================
// Essas variáveis guardam o contexto de áudio e o buffer da música carregada.
// O AudioContext é o ponto central da reprodução do som no navegador.
let audioCtx = null;
let audioBuffer = null;

// Elemento do input de arquivo para escolher a música.
const fileInput = document.getElementById('audioFile');

// Quando o usuário seleciona um arquivo de áudio, ele é convertido em bytes
// e decodificado para um AudioBuffer, que pode ser reproduzido pelo navegador.
fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  if (!file) return;

  // Cria o contexto de áudio somente na primeira vez para evitar múltiplas instâncias.
  audioCtx = audioCtx || new AudioContext();

  const bytes = await file.arrayBuffer();
  audioBuffer = await audioCtx.decodeAudioData(bytes);

  // Habilita o botão de reprodução apenas quando a música estiver pronta.
  btnPlay.disabled = false;
});

// Representa a fonte de reprodução atual da música.
// Quando ela existe, quer dizer que a música está tocando.
let source = null;

// Botão que alterna entre tocar e parar a música.
const btnPlay = document.getElementById('btnPlay');

// Para a reprodução atual, limpa o evento de finalização e interrompe a source.
function stopMusic() {
  if (!source) return;

  source.onended = null;
  source.stop();
  source = null;
  btnPlay.textContent = 'Tocar';
}

// Inicia a reprodução do buffer carregado.
// Também garante que o analisador de frequência esteja ativo para medir o som.
function startMusic() {
  audioCtx.resume();
  ensureAnalyser();

  source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(analyser);
  source.onended = stopMusic;
  source.start();

  btnPlay.textContent = 'Parar';
}

// Quando o usuário clica no botão, ele alterna entre tocar e parar.
btnPlay.addEventListener('click', () => (source ? stopMusic() : startMusic()));

// =========================
// 2) ANÁLISE DO BAIXO (BASS)
// =========================
// O objetivo aqui é medir a intensidade do grave da música e usar esse valor
// para controlar o tamanho do círculo na tela. Essa análise usa o FFT (Fast Fourier Transform),
// que separa o som em frequências diferentes.
let analyser = null;
let freqData = null;

// Cria o analisador de áudio somente uma vez e conecta ele à saída do sistema.
function ensureAnalyser() {
  if (analyser) return;

  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 1024;
  analyser.connect(audioCtx.destination);

  // Array com os valores das frequências disponíveis para leitura.
  freqData = new Uint8Array(analyser.frequencyBinCount);
}

// =========================
// 3) PARTE VISUAL DO CANVAS
// =========================
// A variável level funciona como um valor suavizado da intensidade do som,
// permitindo que o círculo cresça e diminua de forma mais natural e menos brusca.
let level = 0;

function setup() {
  createCanvas(360, 640);
}

function draw() {
  background(170, 190, 255);

  // Calcula a intensidade do grave e eleva esse valor para dar mais contraste.
  const bass = Math.pow(getBass(), 2.6);

  // Suaviza a transição para criar um efeito mais fluido.
  level = lerp(level, bass, 0.4);

  // O círculo cresce conforme a energia do baixo aumenta.
  circle(width / 2, height / 2, 80 + level * 300);
}

// Retorna um valor entre 0 e 1 representando a energia do grave da música.
// Esse valor é calculado a partir da faixa de frequências aproximada do baixo.
function getBass() {
  // Se não houver áudio ou analisador, evita erro e devolve 0.
  if (!analyser || !source) return 0;

  // Pega os dados do espectro do áudio em tempo real.
  analyser.getByteFrequencyData(freqData);

  // Converte o índice de bins em Hertz para saber qual frequência estamos lendo.
  const binHz = audioCtx.sampleRate / analyser.fftSize;

  // Define a faixa de frequências do grave: aproximadamente 40 Hz até 250 Hz.
  const from = Math.max(1, Math.floor(40 / binHz));
  const to = Math.ceil(250 / binHz);

  let sum = 0;
  for (let i = from; i <= to; i++) sum += freqData[i];

  // Divide pela quantidade de bandas e pela intensidade máxima para normalizar o resultado.
  return sum / ((to - from + 1) * 255);
}