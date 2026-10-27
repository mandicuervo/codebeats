// CONFIGURAÇÃO DO MOTOR
// Valores que valem para qualquer cena. Ajustes visuais (cores, espalhamento
// das gotas) ficam na pasta de cada cena, em palette.js.

// Área lógica de desenho, na proporção 9:16. Com pixelDensity(1.5) em sketch.js,
// o canvas gravado tem 1080x1920 pixels sem alterar as proporções da cena.
const W = 720, H = 1280;

// Faixas de frequência (em Hz) que o motor mede a cada frame:
//   bass   -> bumbo e notas graves
//   mid    -> corpo da melodia (aqui, o piano)
//   treble -> brilho dos ataques: pratos, chimbal, harmônicos agudos
// Cada par é [limite inferior, limite superior] e é passado para getBand(...).
const BANDS = {
  bass:   [20, 250],
  mid:    [250, 4000],
  treble: [4000, 20000],
};

// Faixa (em Hz) usada só para descobrir a altura da nota tocada. A cena
// converte essa altura em posição horizontal. É separada de BANDS.mid porque
// BANDS.mid decide QUANDO acontece um pulso, e PITCH_RANGE decide ONDE ele cai.
// Valor menor no primeiro número ou no segundo desloca as gotas para a direita.
const PITCH_RANGE = [300, 1200];