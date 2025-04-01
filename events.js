import { setLabEventTriggered, setLabUnlocked } from './globals.js';
import { typeText, changeImage, playerDeath, handleRoomEntry } from './game.js';

function createButton(text, onClick) {
    const button = document.createElement("button");
    button.textContent = text;

    button.addEventListener("click", onClick);

    button.style.padding = "5px 10px";
    button.style.backgroundColor = "black";
    button.style.color = "rgb(0, 255, 0)";
    button.style.border = "1px solid rgb(0, 255, 0)";
    button.style.fontFamily = "monospace";
    button.style.cursor = "pointer";
    button.style.borderRadius = "4px";

    return button;
}

export function labEvent() {
    console.log("labEvent triggered");
    typeText("[N0VA] Did you hear that? Hide now!", 15);

    const consolePanel = document.getElementById("console");
    const choices = ["Hide inside the medical closet.", "Hide under the desk"];
    changeImage("images/room_Lab.jpg");

    if (!choices || choices.length === 0) {
        playerDeath();
        return;
    }

    let existingButtonContainer = document.getElementById("button-container");
    if (existingButtonContainer) {
        existingButtonContainer.remove();
    }

    const buttonContainer = document.createElement("div");
    buttonContainer.id = "button-container";
    buttonContainer.style.position = "absolute";
    buttonContainer.style.bottom = "5px";
    buttonContainer.style.left = "5px";
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "5px";
    buttonContainer.style.flexWrap = "wrap";
    buttonContainer.style.maxWidth = "100%";

    let hideTimer = setTimeout(() => {
        changeImage("images/LabRoomImage_Death.png");
        playerDeath();
    }, 5000);

    choices.forEach(choice => {
        const button = createButton(choice, () => {
            clearTimeout(hideTimer);

            if (choice === "Hide inside the medical closet.") {
                setLabEventTriggered(true); // Use setter to update labEventTriggered
                consolePanel.innerHTML = '';
                typeText("[AI Companion] add some text here when you hide in the closet ");
                handleRoomEntry("Lab");
            } else if (choice === "Hide under the desk") {
                changeImage("images/LabRoomImage_Death.png");
                playerDeath();
            }
        });

        buttonContainer.appendChild(button);
    });
    consolePanel.appendChild(buttonContainer);
    consolePanel.scrollTop = consolePanel.scrollHeight;
}

export function adminEvent() {
    // Get the console panel
    const consolePanel = document.getElementById("console");
    if (!consolePanel) {
        console.error("[Error]: Console panel not found.");
        return;
    }

    // Get or create the button container
    let buttonContainer = document.getElementById("button-container");
    if (!buttonContainer) {
        buttonContainer = document.createElement("div");
        buttonContainer.id = "button-container";
        buttonContainer.style.position = "absolute";
        buttonContainer.style.bottom = "5px";
        buttonContainer.style.left = "5px";
        buttonContainer.style.display = "flex";
        buttonContainer.style.gap = "5px";
        buttonContainer.style.flexWrap = "wrap";
        buttonContainer.style.maxWidth = "100%";

        consolePanel.appendChild(buttonContainer);
    }

    console.log("[Debug]: Button container found/created:", buttonContainer);

    // Create the "Unlock Lab" button
    createButton("Unlock Lab", function () {
        typeText("[System]: You have unlocked the Lab.");
        console.log("[Debug]: Lab unlocked!");
        labUnlocked = true;
        this.remove();
    }, buttonContainer);
}
