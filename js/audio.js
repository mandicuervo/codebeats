// ÁUDIO: reprodução e análise
// Este arquivo cuida de tudo que envolve som: carregar a música, tocar e parar,
// e medir o espectro (quanta energia há em cada faixa de frequência).
// Ele não sabe nada de desenho: quem usa os números é a cena.

// ---------- Estado ----------

// AudioContext: ponto central da Web Audio API. Gerencia o relógio e o "grafo"
// de nós de áudio. Só é criado quando o usuário escolhe uma música, porque o
// navegador exige uma ação do usuário antes de liberar o áudio.
let audioCtx = null;

// Áudio já decodificado na memória, pronto para tocar.
let audioBuffer = null;

// Nó que toca o buffer. Se existe, a música está tocando. Cada "Tocar" cria um
// novo, porque esse tipo de nó só pode ser iniciado uma vez.
let source = null;

// Nó analisador: deixa o som passar e permite consultar as frequências.
let analyser = null;

// Energia de cada frequência no momento atual, de 0 a 255.
// Índice baixo = grave, índice alto = agudo.
let freqData = null;

// Ponto de saída do som para a gravação. Criado junto com o analisador.
let recDest = null;

// Ganchos para outros arquivos reagirem ao áudio. onStop roda sempre que a
// música para, seja pelo botão ou ao chegar ao fim.
const audioEvents = { onStop: null };

// ---------- Elementos da página ----------

const fileInput = document.getElementById('audioFile');
const btnPlay = document.getElementById('btnPlay');

// ---------- Carregar a música ----------

// Ao escolher um arquivo: lê os bytes, decodifica para um AudioBuffer e só
// então libera o botão de tocar.
fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  if (!file) return;

  audioCtx = audioCtx || new AudioContext();

  const bytes = await file.arrayBuffer();
  audioBuffer = await audioCtx.decodeAudioData(bytes);

  btnPlay.disabled = false;
});

// ---------- Tocar e parar ----------

// Para a música. Zera o onended antes de parar, senão o evento de "terminou"
// dispararia este mesmo código uma segunda vez.
function stopMusic() {
  if (source) {
    source.onended = null;
    source.stop();
    source.disconnect();
    source = null;
    btnPlay.textContent = 'Tocar';
    if (audioEvents.onStop) audioEvents.onStop();   // só avisa se havia música tocando
  }
}

// Toca o buffer. A cadeia de áudio fica: source -> analyser -> caixas de som.
// O analisador no meio é o que permite medir o som sem alterá-lo.
function startMusic(offset = 0, duration) {
  if (!audioBuffer) return;
  stopMusic();                 // 1. limpa a música anterior (deixa source = null)
  audioCtx.resume();           // 2. libera o áudio (política de autoplay)
  ensureAnalyser();            // 3. garante analisador e recDest

  source = audioCtx.createBufferSource();   // 4. CRIA a fonte
  source.buffer = audioBuffer;
  source.connect(analyser);                 // 5. liga no analisador
  source.onended = stopMusic;               // 6. fim natural também fecha tudo

  source.start(0, offset, duration);        // 7. só agora toca
  btnPlay.textContent = 'Parar';
}

btnPlay.addEventListener('click', () => (source ? stopMusic() : startMusic()));

// ---------- Analisador de espectro ----------

// Cria o analisador uma única vez e o liga às caixas de som.
// fftSize = 1024 significa janelas de 1024 amostras, o que dá 512 faixas de
// frequência (bins), cada uma com cerca de 47 Hz de largura a 48 kHz.
function ensureAnalyser() {
  if (analyser) return;

  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.4;   // menos suavização: ataques de nota ficam mais nítidos
  analyser.connect(audioCtx.destination);
  recDest = audioCtx.createMediaStreamDestination();
  analyser.connect(recDest);

  freqData = new Uint8Array(analyser.frequencyBinCount);
}

// Atualiza freqData com o espectro atual. Chamada pelo amostrador de áudio,
// antes de qualquer getBand ou pitch01. Sem música tocando, não faz nada.
function readSpectrum() {
  if (analyser && source) analyser.getByteFrequencyData(freqData);
}

// Converte uma faixa em Hz para posições (bins) do array freqData.
// Começa em 1 porque o bin 0 é a componente contínua (DC), sem frequência útil.
function binRange(lowHz, highHz) {
  const binHz = audioCtx.sampleRate / analyser.fftSize;
  return {
    binHz,
    from: Math.max(1, Math.floor(lowHz / binHz)),
    to: Math.min(freqData.length - 1, Math.ceil(highHz / binHz)),
  };
}

// Energia média de uma faixa de frequências, de 0 a 1.
// Exemplo: getBand(40, 250) mede o grave.
function getBand(lowHz, highHz) {
  if (!analyser || !source) return 0;

  const { from, to } = binRange(lowHz, highHz);
  let sum = 0;
  for (let i = from; i <= to; i++) sum += freqData[i];
  return sum / ((to - from + 1) * 255);
}

// Altura da nota dominante na faixa, de 0 (grave) a 1 (agudo).
// Acha o bin com mais energia e converte para escala logarítmica, que é como
// o ouvido percebe altura (cada oitava ocupa o mesmo espaço).
// Devolve 0.5 (meio) se não houver nenhuma nota clara.
function pitch01(lowHz, highHz) {
  const { binHz, from, to } = binRange(lowHz, highHz);

  let best = from;
  for (let i = from + 1; i <= to; i++) {
    if (freqData[i] > freqData[best]) best = i;
  }

  if (freqData[best] < 30) return 0.5;

  const k = Math.log((best * binHz) / lowHz) / Math.log(highHz / lowHz);
  return Math.min(1, Math.max(0, k));
}