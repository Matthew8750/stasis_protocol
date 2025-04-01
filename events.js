import { setLabEventTriggered, setLabUnlocked } from './globals.js';
import { typeText, changeImage, playerDeath, handleRoomEntry } from './game.js';
let spacebarPresses = 0; // Initialize spacebar presses
let hideTimer; // Timer for death event


function createButton(label, onClick) {
    const button = document.createElement("button");
    button.textContent = label;
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
    typeText("[N0VA]: Did you hear that? Hide now!", 15);

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

export function startRepairEscapePodsMinigame(onSuccess, onFailure) {
    // Create the mini-game container
    const minigameContainer = document.createElement("div");
    minigameContainer.id = "minigame-container";
    minigameContainer.style.position = "absolute";
    minigameContainer.style.top = "50%";
    minigameContainer.style.left = "50%";
    minigameContainer.style.transform = "translate(-50%, -50%)";
    minigameContainer.style.backgroundColor = "black";
    minigameContainer.style.color = "rgb(0, 255, 0)";
    minigameContainer.style.padding = "20px";
    minigameContainer.style.border = "2px solid rgb(0, 255, 0)";
    minigameContainer.style.fontFamily = "monospace";
    minigameContainer.style.textAlign = "center";
    minigameContainer.style.zIndex = "1000";

    // Add instructions
    const instructions = document.createElement("p");
    instructions.textContent = "Match the wires! Drag the wires on the left to their corresponding colors on the right.";
    minigameContainer.appendChild(instructions);

    // Create the wire matching area
    const wireContainer = document.createElement("div");
    wireContainer.style.display = "flex";
    wireContainer.style.justifyContent = "space-between";
    wireContainer.style.marginTop = "20px";

    // Left wires
    const leftWires = document.createElement("div");
    leftWires.style.display = "flex";
    leftWires.style.flexDirection = "column";
    leftWires.style.gap = "10px";

    const colors = ["red", "blue", "green", "yellow"];
    colors.forEach(color => {
        const wire = document.createElement("div");
        wire.textContent = color.toUpperCase();
        wire.style.backgroundColor = color;
        wire.style.color = "white";
        wire.style.padding = "10px";
        wire.style.cursor = "grab";
        wire.draggable = true;
        wire.dataset.color = color;

        // Add drag event
        wire.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("color", color);
        });

        leftWires.appendChild(wire);
    });

    // Right wires
    const rightWires = document.createElement("div");
    rightWires.style.display = "flex";
    rightWires.style.flexDirection = "column";
    rightWires.style.gap = "10px";

    colors.forEach(color => {
        const target = document.createElement("div");
        target.textContent = color.toUpperCase();
        target.style.backgroundColor = color;
        target.style.color = "white";
        target.style.padding = "10px";
        target.style.border = "2px dashed white";
        target.dataset.color = color;

        // Add drop event
        target.addEventListener("dragover", (e) => {
            e.preventDefault();
        });

        target.addEventListener("drop", (e) => {
            e.preventDefault();
            const draggedColor = e.dataTransfer.getData("color");
            if (draggedColor === target.dataset.color) {
                target.style.border = "2px solid lime";
                target.textContent = "MATCHED!";
                target.style.pointerEvents = "none"; // Prevent further interaction
                checkCompletion();
            } else {
                target.style.border = "2px solid red";
                setTimeout(() => {
                    target.style.border = "2px dashed white";
                }, 1000);
            }
        });

        rightWires.appendChild(target);
    });

    wireContainer.appendChild(leftWires);
    wireContainer.appendChild(rightWires);
    minigameContainer.appendChild(wireContainer);

    // Add the mini-game to the document
    document.body.appendChild(minigameContainer);

    // Check if all wires are matched
    function checkCompletion() {
        const unmatched = rightWires.querySelectorAll("div:not([style*='lime'])");
        if (unmatched.length === 0) {
            document.body.removeChild(minigameContainer);
            onSuccess();
        }
    }

    // Add a cancel button
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.style.marginTop = "20px";

    // Apply the same style as other buttons
    if (typeof styleButton === "function") {
        styleButton(cancelButton);
    }

    cancelButton.addEventListener("click", () => {
        document.body.removeChild(minigameContainer);
        onFailure();
    });
    minigameContainer.appendChild(cancelButton);
}

export function cafeteriaEvent() {
 
    typeText("[N0VA] What is that? Quick! Get out of the Cafeteria! Rapidly tap the spacebar now!", 15);
    changeImage("images/room_Cafeteria.jpg");
 
    // Remove any existing button container
    let existingButtonContainer = document.getElementById("button-container");
    if (existingButtonContainer) {
        existingButtonContainer.remove();
    }

    // Reset Spacebar presses
    spacebarPresses = 0;
 
    // Add Event Listener for Spacebar
    document.addEventListener("keydown", countSpacebarPresses);
 
        // Start a Timer that kills the Player if they don't tap the spacebar 5 times in 10 seconds
        hideTimer = setTimeout(() => {

 

            changeImage("images/Cafeteria_Death.png");
            playerDeath();
            document.removeEventListener("keydown", countSpacebarPresses);
    } , 10000); // 10 seconds
}
 
function countSpacebarPresses(event) {
 

    if (event.code === "Space") 
        {
 
        spacebarPresses++;
        console.log(`[Debug]: Spacebar pressed ${spacebarPresses} times`);
 
        if (spacebarPresses >= 30) {
            clearTimeout(hideTimer); // Cancel the death timer
            typeText("[N0VA] You escaped the Cafeteria! Now, where to next?");
            handleRoomEntry("Lab"); // Change to Lab
            document.removeEventListener("keydown", countSpacebarPresses);
        }
    }
} 

export function shootAlien() {

    const consolePanel = document.getElementById("console");

    // Remove any existing button container
    let existingButtonContainer = document.getElementById("button-container");
    if (existingButtonContainer) {
        existingButtonContainer.remove();
    }

    // Create a new button container
    const buttonContainer = document.createElement("div");
    buttonContainer.id = "button-container";
    buttonContainer.style.position = "relative";
    buttonContainer.style.width = "100%";
    buttonContainer.style.height = "100%";
    consolePanel.appendChild(buttonContainer);

    // Create the "Shoot" button
    const shootButton = document.createElement("button");
    shootButton.textContent = "Shoot!";
    shootButton.style.position = "absolute";
    shootButton.style.padding = "10px 20px";
    shootButton.style.backgroundColor = "red";
    shootButton.style.color = "white";
    shootButton.style.border = "none";
    shootButton.style.cursor = "pointer";
    shootButton.style.fontFamily = "monospace";
    shootButton.style.fontSize = "16px";
    shootButton.style.borderRadius = "5px";

    // Function to position the button in a random corner
    function positionButtonRandomly() {
        const corners = [
            { top: "10px", left: "10px" }, // Top-left
            { top: "10px", right: "10px" }, // Top-right
            { bottom: "10px", left: "10px" }, // Bottom-left
            { bottom: "10px", right: "10px" }, // Bottom-right
        ];
        const randomCorner = corners[Math.floor(Math.random() * corners.length)];
        Object.assign(shootButton.style, randomCorner);
    }

    // Position the button randomly
    positionButtonRandomly();

    // Add the button to the container
    buttonContainer.appendChild(shootButton);

    // Timer for death if the player doesn't shoot in time
    const deathTimer = setTimeout(() => {
        console.log("[N0VA]: You failed to shoot the alien in time!");
        changeImage("images/placeholder.png");
        playerDeath();
        buttonContainer.remove(); // Clean up the button
    }, 5000); // 5 seconds to shoot

    // Event listener for the "Shoot" button
    shootButton.addEventListener("click", () => {
        clearTimeout(deathTimer); // Cancel the death timer
        console.log("Shoot");
        buttonContainer.remove(); // Remove the button
    });
}
