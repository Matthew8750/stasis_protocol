import { keycardPickedUp, setLabEventTriggered, setLabUnlocked, gameStartTime } from './globals.js'; // Import the game start time
import { typeText, changeImage, playerDeath, handleRoomEntry, styleButton } from './game.js';
import { unlockAchievement,checkAndUnlockStasisEngaged } from './saveManager.js';
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

// Update the showEndingScreen function to include notifications
function showEndingScreen(message) {
    // Calculate elapsed time
    const elapsedTime = Math.floor((Date.now() / 1000) - gameStartTime); // Time in seconds

    // Check if the game was completed in less than 2 minutes
    if (elapsedTime <= 120) {
        console.log("[Achievement]: Game completed in less than 2 minutes!");
        const playerID = sessionStorage.getItem("loggedInID");
        if (playerID) {
            unlockAchievement(playerID, 7); // Unlock achievement ID 5 for fast completion
        }
   }

    // Clear the console panel
    const consolePanel = document.getElementById("console");
    consolePanel.innerHTML = "";

    // Create the ending screen container
    const endingScreen = document.createElement("div");
    endingScreen.id = "ending-screen";
    endingScreen.style.position = "absolute";
    endingScreen.style.top = "0";
    endingScreen.style.left = "0";
    endingScreen.style.width = "100%";
    endingScreen.style.height = "100%";
    endingScreen.style.backgroundColor = "black";
    endingScreen.style.color = "white";
    endingScreen.style.display = "flex";
    endingScreen.style.flexDirection = "column";
    endingScreen.style.justifyContent = "center";
    endingScreen.style.alignItems = "center";
    endingScreen.style.fontFamily = "monospace";
    endingScreen.style.zIndex = "1000";

    // Add the victory message
    const victoryMessage = document.createElement("h1");
    victoryMessage.textContent = message;
    victoryMessage.style.marginBottom = "20px";
    endingScreen.appendChild(victoryMessage);

    // Add the "Return to Game Hub" button
    const returnButton = document.createElement("button");
    returnButton.textContent = "Return to Game Hub";
    returnButton.addEventListener("click", () => {
        window.location.href = "sp-gamehub.html"; // Redirect to the game hub
    });
    styleButton(returnButton);
    endingScreen.appendChild(returnButton);

    // Add the "Restart Game" button
    const restartButton = document.createElement("button");
    restartButton.textContent = "Restart Game";
    restartButton.addEventListener("click", () => {
        initializeGame(true); // Restart the game
        endingScreen.remove(); // Remove the ending screen
    });
    styleButton(restartButton);
    endingScreen.appendChild(restartButton);

    // Append the ending screen to the body
    document.body.appendChild(endingScreen);

    // Show achievement notification based on the achievement unlocked
    const playerID = sessionStorage.getItem("loggedInID");
    if (playerID) {
        if (wrenchPickedUp && keycardPickedUp) {
            showNotification("Hoarder", "images/achievement_Hoarder.png");
        } else if (keycardPickedUp) {
            showNotification("Vapourised!", "images/achievement_Vapourised!.png");
        }
        else if (escapePodsRepaired) {
            showNotification("Farewell Eclipse 9", "images/achievement_FarewellEclipse9.png");
        }
    }
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
    wireContainer.style.justifyContent = "space-between"; // Align left and right wires to opposite sides
    wireContainer.style.marginTop = "20px";
    wireContainer.style.position = "relative"; // For positioning wires
    wireContainer.style.width = "700px"; // Fixed width for alignment
    wireContainer.style.height = "200px"; // Fixed height for alignment

    // Left wires
    const leftWires = document.createElement("div");
    leftWires.style.display = "flex";
    leftWires.style.flexDirection = "column";
    leftWires.style.gap = "10px";
    leftWires.style.marginLeft = "70px"; // Increased margin to double the distance from the left border

    const colors = ["red", "blue", "green", "yellow"];
    const wireLines = []; // Store wire lines for later manipulation

    colors.forEach((color, index) => {
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
            e.dataTransfer.setData("index", index); // Track the wire's index
        });

        leftWires.appendChild(wire);
    });

    // Right wires (shuffled)
    const rightWires = document.createElement("div");
    rightWires.style.display = "flex";
    rightWires.style.flexDirection = "column";
    rightWires.style.gap = "10px";
    rightWires.style.marginLeft = "30px"; // Increased margin to push the right wires further to the right

    // Shuffle the colors array
    const shuffledColors = [...colors].sort(() => Math.random() - 0.5);

    shuffledColors.forEach((color, index) => {
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
            const draggedIndex = e.dataTransfer.getData("index");

            if (draggedColor === target.dataset.color) {
                target.style.border = "2px solid lime";
                target.textContent = "MATCHED!";
                target.style.pointerEvents = "none"; // Prevent further interaction

                // Draw a wire from the left to the right
                const leftWire = leftWires.children[draggedIndex];
                const wireLine = document.createElement("div");
                wireLine.style.position = "absolute";
                wireLine.style.backgroundColor = draggedColor;
                wireLine.style.height = "4px"; // Increased thickness of the line
                wireLine.style.width = `${Math.abs(target.offsetLeft - leftWire.offsetLeft - 10)}px`; // Adjusted to avoid overlap
                wireLine.style.top = `${leftWire.offsetTop + leftWire.offsetHeight / 2}px`;
                wireLine.style.left = `${leftWire.offsetLeft + leftWire.offsetWidth}px`;
                wireLine.style.transformOrigin = "left center";
                wireLine.style.transform = `rotate(${Math.atan2(
                    target.offsetTop - leftWire.offsetTop,
                    target.offsetLeft - leftWire.offsetLeft
                )}rad)`;
                wireLine.style.zIndex = "1"; // Set a lower z-index for the wire lines

                // Ensure the right wires have a higher z-index
                target.style.zIndex = "2";

                wireContainer.appendChild(wireLine);

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

    onSuccess = () => {
        const playerID = sessionStorage.getItem("loggedInID");
        console.log("Player ID:", playerID);
        unlockAchievement(playerID, 1); // Unlock the achievement
        checkAndUnlockStasisEngaged(playerID); // Check and unlock the achievement
        typeText("[N0VA]: The escape pods are repaired and ready for launch!");
        changeImage("images/EscapePods_Repaired.jpg");
        console.log("[System]: Escape pods repaired successfully!");
        showEndingScreen("Congratulations! You escaped the ship!");
        showNotification("Farewell Eclipse 9", "images/achievement_FarewellEclipse9.png");
        
    };

    // Add a cancel button
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.classList.add("console-button"); // Add a class for consistent styling

    cancelButton.addEventListener("click", () => {
        document.body.removeChild(minigameContainer);
        onFailure();
    });
    minigameContainer.appendChild(cancelButton);
}

export function cafeteriaEvent() {
    typeText("[N0VA] What is that? Quick! Get out of the Cafeteria! Rapidly tap the spacebar now!", 15);
    changeImage("images/room_Lab.jpg");

    // Remove any existing button container
    let existingButtonContainer = document.getElementById("button-container");
    if (existingButtonContainer) {
        existingButtonContainer.remove();
    }

    // Reset spacebar presses
    spacebarPresses = 0;

    // Add Event Listener for Spacebar
    document.addEventListener("keydown", countSpacebarPresses);

    // Get the image-panel element
    const imagePanel = document.querySelector(".image-panel");
    if (!imagePanel) {
        console.error("Image panel not found. Ensure the selector is correct.");
        return;
    }

    // Create a transparent overlay panel for the doors
    const doorPanel = document.createElement("div");
    doorPanel.id = "door-panel";
    doorPanel.style.position = "absolute";
    doorPanel.style.top = "0";
    doorPanel.style.left = "0";
    doorPanel.style.width = "100%";
    doorPanel.style.height = "100%";
    doorPanel.style.backgroundColor = "rgba(0, 0, 0, 0)"; // Transparent background
    doorPanel.style.pointerEvents = "none"; // Allow clicks to pass through
    doorPanel.style.zIndex = "10"; // Ensure it is above the image-panel

    // Create door images
    const doorLeft = document.createElement("img");
    const doorRight = document.createElement("img");

    doorLeft.src = "images/door_left.png";
    doorRight.src = "images/door_right.png";

    // Style the doors
    doorLeft.style.position = "absolute";
    doorRight.style.position = "absolute";

    doorLeft.style.width = "50%";
    doorRight.style.width = "50%";

    doorLeft.style.height = "100%";
    doorRight.style.height = "100%";

    doorLeft.style.left = "50%"; // Start touching in the center
    doorLeft.style.transform = "translateX(-100%)"; // Align to the left of the center
    doorRight.style.left = "50%"; // Start touching in the center

    // Append doors to the door-panel
    doorPanel.appendChild(doorLeft);
    doorPanel.appendChild(doorRight);

    // Append the door-panel to the image-panel
    imagePanel.appendChild(doorPanel);

    // Start a timer that kills the player if they don't tap the spacebar 30 times in 10 seconds
    hideTimer = setTimeout(() => {
        changeImage("images/LabRoomImage_Death.png");
        playerDeath();
        document.removeEventListener("keydown", countSpacebarPresses);
    }, 10000); // 10 seconds

    function countSpacebarPresses(event) {
        if (event.code === 'Space') {
            spacebarPresses++;
            console.log(`Spacebar Presses: ${spacebarPresses}`);

            // Move the doors apart with each spacebar press
            const moveDistance = spacebarPresses * 5; // Each press moves the doors 5px further apart
            doorLeft.style.transform = `translateX(calc(-100% - ${moveDistance}px))`;
            doorRight.style.transform = `translateX(${moveDistance}px)`;

            if (spacebarPresses >= 30) {
                clearTimeout(hideTimer); // Cancel the death timer
                doorPanel.remove(); // Remove the door panel
                handleRoomEntry("Lab"); // Change to the next room
                document.removeEventListener("keydown", countSpacebarPresses);
            }
        }
    }
}

export function shootAlien() {
    const consolePanel = document.getElementById("console");
    const imagePanel = document.querySelector(".image-panel"); // Target the image-panel

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
    buttonContainer.style.overflow = "hidden"; // Prevent scrollbars
    consolePanel.appendChild(buttonContainer);

    // Create the "Shoot" button
    const shootButton = document.createElement("button");
    shootButton.textContent = "Shoot!";
    shootButton.style.position = "absolute";
    shootButton.style.width = "75px"; // Smaller width
    shootButton.style.height = "40px"; // Smaller height

    // Use the styleButton method to style the button
    if (typeof styleButton === "function") {
        styleButton(shootButton);
    }

    // Function to position the button closer to the center
    let lastCornerIndex = -1; // Track the last corner index
    function positionButtonRandomly() {
        const buttonWidth = 75; // Match the button's smaller width
        const buttonHeight = 40; // Match the button's smaller height
        const containerWidth = buttonContainer.offsetWidth;
        const containerHeight = buttonContainer.offsetHeight;

        // Define positions closer to the center
        const positions = [
            { top: `${containerHeight * 0.25 - buttonHeight / 2}px`, left: `${containerWidth * 0.25 - buttonWidth / 2}px` }, // Top-left quadrant
            { top: `${containerHeight * 0.25 - buttonHeight / 2}px`, left: `${containerWidth * 0.75 - buttonWidth / 2}px` }, // Top-right quadrant
            { top: `${containerHeight * 0.75 - buttonHeight / 2}px`, left: `${containerWidth * 0.25 - buttonWidth / 2}px` }, // Bottom-left quadrant
            { top: `${containerHeight * 0.75 - buttonHeight / 2}px`, left: `${containerWidth * 0.75 - buttonWidth / 2}px` }, // Bottom-right quadrant
        ];

        let randomCornerIndex;
        do {
            randomCornerIndex = Math.floor(Math.random() * positions.length);
        } while (randomCornerIndex === lastCornerIndex); // Ensure a different position is chosen

        lastCornerIndex = randomCornerIndex; // Update the last corner index
        Object.assign(shootButton.style, positions[randomCornerIndex]);
    }

    // Track the number of successful presses
    let presses = 0;

    // Timer for death if the player doesn't shoot in time
    const deathTimer = setTimeout(() => {
        console.log("[N0VA]: You failed to shoot the alien in time!");
        changeImage("images/Alien_Death.png");
        playerDeath();
        buttonContainer.remove(); // Clean up the button
    }, 5000);

    // Add shake effect to the image-panel
    function shakeImagePanel() {
        if (imagePanel) {
            imagePanel.classList.add("shake");
            setTimeout(() => {
                imagePanel.classList.remove("shake");
            }, 300); // Duration of the shake animation
        }
    }

    // Event listener for the "Shoot" button
    shootButton.addEventListener("click", () => {
        presses++;
        console.log(`[Debug]: Alien shot ${presses} time(s)`);

        // Play the gunshot sound
        const gunshotSound = new Audio("sounds/GunShotAlienDeath.mp3"); // Ensure the path to the MP3 file is correct
        gunshotSound.play().catch((error) => {
            console.error("[Error]: Unable to play gunshot sound.", error);
        });

        // Trigger the shake effect on the image-panel
        shakeImagePanel();

        if (presses >= 3) {
            clearTimeout(deathTimer); // Cancel the death timer
            console.log("[N0VA]: You defeated the alien!");
            showEndingScreen("Congratulations! You defeated the alien and survived!");
            
            // Retrieve player ID from sessionStorage
            const playerID = sessionStorage.getItem("loggedInID");
            console.log("Player ID:", playerID);
            unlockAchievement(playerID, 2); // Unlock the achievement

                        checkAndUnlockStasisEngaged(playerID); // Check and unlock the achievement

            checkAndUnlockStasisEngaged(playerID); // Check and unlock the achievement

            buttonContainer.remove(); // Remove the button container
        } else {
            // Reposition the button for the next press
            positionButtonRandomly();
        }
    });

    // Position the button randomly and add it to the container
    positionButtonRandomly();
    buttonContainer.appendChild(shootButton);
}
