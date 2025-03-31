// Global variables
export let typingTimeouts = [];
export let typingInProgress = false;
export let labEventTriggered = false;
export let noOfDeaths = 0;
export let time_played = 0;
export let rooms_explored = 0;
export let location_name = "Cryogenic Chamber";
export let startTime = Date.now();
export let wrenchPickedUp = false;
export let gunPickedUp = false;
export let keycardPickedUp = false;
export let labUnlocked = false;
export let gameStartTime = Date.now() / 1000;
export let lastSaveTime = 0;
export let backgroundMusic = new Audio("Audio/StasisProtocolBgMusic.mp3");
export let isMusicPlaying = true;


// Setter functions
export function setTypingTimeouts(newTimeouts) {
    typingTimeouts = newTimeouts;
}

export function setTypingInProgress(status) {
    typingInProgress = status;
}

export function setLabEventTriggered(status) {
    labEventTriggered = status;
}

export function setNoOfDeaths(count) {
    noOfDeaths = count;
}

export function setTimePlayed(time) {
    time_played = time;
}

export function setRoomsExplored(count) {
    rooms_explored = count;
}

export function setLocationName(name) {
    location_name = name;
}

export function setStartTime(newStartTime) {
    startTime = newStartTime;
}

export function setWrenchPickedUp(status) {
    wrenchPickedUp = status;
}

export function setGunPickedUp(status) {
    gunPickedUp = status;
}

export function setKeycardPickedUp(status) {
    keycardPickedUp = status;
}

export function setLabUnlocked(status) {
    labUnlocked = status;
}

export function setGameStartTime(newTime) {
    gameStartTime = newTime;
}

export function setLastSaveTime(newTime) {
    lastSaveTime = newTime;
}

export function setIsMusicPlaying(status) {
    isMusicPlaying = status;
}