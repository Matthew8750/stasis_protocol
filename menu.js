// =========================
// FILE: menu.js
// =========================

console.log("Stasis Protocol is working");

// Move game logic to a central JS file

const story = {
    start: {
        text: "You awaken in a dark room. There's a door to the left and a flickering terminal to the right.",
        choices: [
            { text: "Open the door", next: "door" },
            { text: "Approach the terminal", next: "terminal" }
        ]
    },
    door: {
        text: "The door is locked. You need a keycard.",
        choices: [
            { text: "Go back", next: "start" }
        ]
    },
    terminal: {
        text: "The terminal hums to life. A prompt awaits your command...",
        choices: [
            { text: "Hack the terminal", next: "hack" },
            { text: "Leave it alone", next: "start" }
        ]
    },
    hack: {
        text: "You successfully hack the terminal and unlock the door!",
        choices: [
            { text: "Go through the door", next: "freedom" }
        ]
    },
    freedom: {
        text: "You escape! Congratulations, you win!",
        choices: [
            { text: "Play again", next: "start" }
        ]
    }
};

let currentScene = 'start';

function displayScene(sceneId) {
    const scene = story[sceneId];
    const gameText = document.getElementById('game-text');
    const choicesDiv = document.getElementById('choices');

    gameText.innerText = scene.text;
    choicesDiv.innerHTML = '';

    scene.choices.forEach(choice => {
        const button = document.createElement('button');
        button.innerText = choice.text;
        button.onclick = () => {
            displayScene(choice.next);
        };
        choicesDiv.appendChild(button);
    });
}

window.onload = () => {
    if (document.getElementById('game-text')) {
        displayScene(currentScene);
    }
};
