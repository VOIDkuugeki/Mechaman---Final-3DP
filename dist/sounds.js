const playershotAudio = new Audio('SFX/player-beam.mp3');
playershotAudio.volume = 0.1;

const boosterAudio = new Audio('SFX/booster.mp3');
boosterAudio.Audio = 0.05;

const mobshotAudio = new Audio('SFX/mob-beam-2.mp3');
mobshotAudio.Audio = 0.05;

const victoryAudio = new Audio('SFX/victory.mp3');
const defeatAudio = new Audio('SFX/defeat.mp3');

const backgroundMusic = new Audio('Page_img/Gundam Build Fighters - OST - CD1 - 18. Battle Bar.mp3');
backgroundMusic.Audio = 0.05;
// backgroundMusic.muted = true;
// backgroundMusic.loop = true;


export { playershotAudio, mobshotAudio, boosterAudio, defeatAudio, victoryAudio, backgroundMusic };
