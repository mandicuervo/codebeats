// =========================
// CONFIGURAÇÃO DO MOTOR
// =========================
// Valores que valem para qualquer cena. Ajustes visuais (cores, espalhamento
// das gotas) ficam na pasta de cada cena, em palette.js.

// Resolução do canvas em pixels. 720x1280 é a proporção 9:16 do TikTok.
// O vídeo gravado terá exatamente estes pixels, por isso não usamos o tamanho
// da tela aqui (o CSS só reduz a exibição, não altera estes valores).
const W = 720, H = 1280;

// Faixas de frequência (em Hz) que o motor mede a cada frame:
//   bass   -> bumbo e notas graves
//   mid    -> corpo da melodia (aqui, o piano)
//   treble -> brilho dos ataques: pratos, chimbal, harmônicos agudos
// Cada par é [limite inferior, limite superior] e é passado para getBand(...).
const BANDS = {
  bass:   [40, 250],
  mid:    [250, 2500],
  treble: [2500, 10000],
};

// Faixa (em Hz) usada só para descobrir a altura da nota tocada. A cena
// converte essa altura em posição horizontal. É separada de BANDS.mid porque
// BANDS.mid decide QUANDO acontece um pulso, e PITCH_RANGE decide ONDE ele cai.
// Valor menor no primeiro número ou no segundo desloca as gotas para a direita.
const PITCH_RANGE = [300, 1200];