// CENA dreamy: PALETA E AJUSTES VISUAIS

// Degradê do céu: cor do topo e da base, em [R, G, B].
const SKY_TOP = [160, 190, 255];
const SKY_BOTTOM = [255, 212, 236];

// Largura da faixa onde as gotas nascem, como fração da tela:
// 0 = todas no centro, 1 = a largura inteira.
const PITCH_SPREAD = 0.6;
const DROP_PITCH_WEIGHT = 0.35;

// Cores dos brilhos, como texto "R, G, B" para entrar direto em rgba(...).
const DROP_RGB = '228, 220, 255';
const DOOR_RGB = '255, 230, 190';

const HORIZON_Y = H * 0.62;      // altura do horizonte (62% da tela, de cima para baixo)
const SUN_RGB = '255, 190, 120'; // cor do brilho em volta do sol

const GLITCH_CHANCE = 0.6; 