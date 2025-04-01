// ==========================
// 1. Global Variables and Constants
// ==========================

import {
    typingTimeouts,
    typingInProgress,
    labEventTriggered,
    noOfDeaths,
    time_played,
    rooms_explored,
    location_name,
    startTime,
    wrenchPickedUp,
    gunPickedUp,
    keycardPickedUp,
    labUnlocked,
    gameStartTime,
    lastSaveTime,
    backgroundMusic,
    isMusicPlaying,
    setTypingTimeouts,
    setTypingInProgress,
    setLabEventTriggered,
    setNoOfDeaths,
    setTimePlayed,
    setRoomsExplored,
    setLocationName,
    setStartTime,
    setWrenchPickedUp,
    setGunPickedUp,
    setKeycardPickedUp,
    setLabUnlocked,
    setGameStartTime,
    setLastSaveTime,
    cafeteriaEventTriggered,
    setCafeteriaEventTriggered
} from './globals.js';

import { saveToDatabase, loadSave, clearInventory, fetchAndDisplayInventory, unlockAchievement } from './saveManager.js';
import { labEvent, startRepairEscapePodsMinigame, cafeteriaEvent } from './events.js';

// ==========================
// 2. Utility Functions
// ==========================

// ==========================
// 3. Game Initialization
// ==========================
export async function initializeGame(restartGame = false) {
    console.log("[System]: Initializing game...");

    document.addEventListener("click", function () {
        backgroundMusic.play().catch((error) => {
            console.error("[Error]: Unable to play audio.", error);
        });
    });

    const loggedInID = sessionStorage.getItem("loggedInID");

    if (!restartGame && loggedInID) {
        let saveExists = await loadSave(loggedInID);
        if (saveExists) {
            console.log("[System]: Save loaded successfully.");
            return; // Prevents starting a new game
        }
    }

    console.log("[System]: Starting a new game...");

    // Reset game state using setters
    setLabEventTriggered(false);
    setKeycardPickedUp(false);
    setGunPickedUp(false);
    setWrenchPickedUp(false);
    setLabUnlocked(false);
    clearInventory();

    handleRoomEntry("Cryogenic Chamber");
    console.log("[System]: chamber entered.");
}

export function typeText(message, speed = 30) {
    console.log("[Debug]: Typing message:", message);
    const consolePanel = document.getElementById("console");

    function stopTyping() {
        setTypingInProgress(false);
        typingTimeouts.forEach(clearTimeout);
        setTypingTimeouts([]);
    }

    stopTyping();

    let textContainer = document.getElementById("text-container");
    if (!textContainer) {
        textContainer = document.createElement("div");
        textContainer.id = "text-container";
        consolePanel.insertBefore(textContainer, consolePanel.firstChild);
    }

    textContainer.innerHTML = "";
    setTypingInProgress(true);

    let cleanMessage = message.split("\n");

    function typeLine(lineIndex = 0) {
        if (lineIndex < cleanMessage.length) {
            let line = cleanMessage[lineIndex];
            let charIndex = 0;

            function typeCharacter() {
                if (!typingInProgress) return;

                if (charIndex < line.length) {
                    textContainer.innerHTML += line[charIndex];
                    charIndex++;
                    typingTimeouts.push(setTimeout(typeCharacter, speed));
                } else {
                    textContainer.innerHTML += "<br>";
                    typingTimeouts.push(setTimeout(() => typeLine(lineIndex + 1), 300));
                }
            }

            typeCharacter();
        } else {
            setTypingInProgress(false);
            consolePanel.scrollTop = consolePanel.scrollHeight;
        }
    }

    typeLine(); // Corrected function call
}

export function changeImage(newSrc) {
    document.getElementById("display-image").src = newSrc;
}

function styleButton(button) {
    button.style.padding = "5px 10px";
    button.style.backgroundColor = "black";
    button.style.color = "rgb(0, 255, 0)";
    button.style.border = "1px solid rgb(0, 255, 0)";
    button.style.fontFamily = "monospace";
    button.style.cursor = "pointer";
    button.style.borderRadius = "4px";
}

function updateAIImage(newSrc) {
    document.getElementById("ai-companion").src = newSrc;
}

function updateRoom(roomName) {
    document.getElementById("room-display").textContent = "Room: " + roomName;
}

function toggleEscapeMenu() {
    const menu = document.getElementById('escapeMenu');
    if (!menu) {
        console.error("[Error]: Escape menu element not found.");
        return;
    }
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}

function toggleSettingsPanel() {
    const settingsPanel = document.getElementById("settingsPanel");
    if (settingsPanel.style.display === "none" || settingsPanel.style.display === "") {
        settingsPanel.style.display = "block";
    } else {
        settingsPanel.style.display = "none";
    }
}

function toggleFontSize() {
    const body = document.body;
    const buttons = document.querySelectorAll("button");
    const roomPanel = document.querySelector(".room-panel");
    const consolePanel = document.querySelector(".console-panel");
    const currentFontSize = window.getComputedStyle(body).fontSize;

    if (currentFontSize === "16px") {
        body.style.fontSize = "20px";
        buttons.forEach(button => {
            button.style.fontSize = "18px";
        });
        roomPanel.style.fontSize = "16px";
        consolePanel.style.fontSize = "16px";
        console.log("[System]: Font size increased.");
    } else {
        body.style.fontSize = "16px";
        buttons.forEach(button => {
            button.style.fontSize = "14px";
        });
        roomPanel.style.fontSize = "14px";
        consolePanel.style.fontSize = "14px";
        console.log("[System]: Font size reset to original.");
    }
}

function toggleBackgroundMusic() {
    const toggleButton = document.getElementById("toggle-music-button");

    if (backgroundMusic.muted) {
        backgroundMusic.muted = false;
        console.log("[System]: Background music unmuted.");
        toggleButton.style.backgroundImage = "url('images/music_unmute.png')";
        console.log("Background image set to: images/music_unmute.png");
    } else {
        backgroundMusic.muted = true;
        console.log("[System]: Background music muted.");
        toggleButton.style.backgroundImage = "url('images/music_mute.png')";
        console.log("Background image set to: images/music_mute.png");
    }
}

// ==========================
// 4. Room Management
// ==========================
export function handleRoomEntry(roomName) {
    const roomData = {
        "Cryogenic Chamber": {
            image: "images/room_Chamber.jpg",
            choices: ["Hallway One"],
            description: "[N0VA]: You awaken in the Cryogenic Chamber. The ship is eerily silent. Systems flicker weakly—something is wrong.",
            interactions: {
                "Inspect Stasis Pods": { 
                    description: "Warning: Pod integrity compromised. Vital signs… nonexistent. The occupant didn’t make it. Frost clings to the glass, obscuring their face—still, unmoving. Whatever happened, it happened long ago.",
                    newImage: "images/placeholder.jpg"
                }
            }
        },
        "Hallway One": {
            image: "images/room_Hallway.jpg",
            choices: ["Med Bay", "Lab", "Admin"],
            description: "[N0VA]: This hallway connects various sections of the ship. Faint emergency lights flicker, casting long shadows."
        },
        "Med Bay": {
            image: "images/room_MedBay.jpg",
            choices: ["Hallway One"],
            keycard: true,
            description: "[N0VA]: This is the Med Bay. A security keycard is present; retrieval is advised.",
            interactions: {
                "Open Drawers": { 
                    description: "Drawer accessed… empty. Either supplies were taken, or they were never restocked. No usable items detected—let’s keep moving",
                    newImage: "images/placeholder.jpg"
                },
                "Inspect Blood": { 
                    description: "Blood detected… fresh analysis unavailable. No body present. This suggests either recent injury or… something was here. Stay alert.",
                    newImage: "images/placeholder.jpg"
                }
            }
        },
        "Lab": {
            image: "images/room_Lab.jpg",
            choices: ["Hallway One", "Cafeteria", "Hallway Two"],
            description: "[N0VA]: The containment unit has been forcibly opened. Whatever was inside is no longer here.",
            interactions: {
                "Inspect Containment Chamber": { 
                    description: "Containment breach confirmed. The chamber was forcibly opened—internal locks overridden or destroyed. Whatever was inside… it’s no longer contained. We are not alone. Proceed with extreme caution.",
                    newImage: "images/placeholder.jpg"
                }
            }
        },
        "Admin": {
            image: "images/room_Admin.jpg",
            choices: ["Hallway One"],
            description: "[N0VA]: This is the Admin Control Room. Multiple terminals are active but unstable—data corruption detected.",
            terminal: true,
            interactions: {
                "Inspect Terminal": { 
                    description: "Attempting data retrieval… failed. System corruption is extensive. No useful information can be extracted. This terminal is beyond recovery.",
                    newImage: "images/placeholder.jpg"
                }
            }
        },
        "Cafeteria": {
            image: "images/room_Cafeteria.jpg",
            choices: ["Lab"],
            description: "[N0VA]: The Cafeteria is abandoned. Food trays and supplies are scattered—signs of a hasty departure."
        },
        "Hallway Two": {
            image: "images/room_Hallway.jpg",
            choices: ["Lab", "Engine Left", "Engine Right", "Hallway Final"],
            description: "[N0VA]: Darkened corridors stretch ahead, offering little comfort."
        },
        "Engine Left": {
            image: "images/room_Engine1.jpg",
            choices: ["Hallway Two"],
            wrench: true,
            description: "[N0VA]: The engine room is heavily damaged. A wrench is present—this tool is essential for repairing the escape pods.",
            interactions: {
                "Inspect the Engine": { 
                    description: "[N0VA]: The engine room is heavily damaged. A wrench is present—this tool is essential for repairing the escape pods.",
                    newImage: "images/placeholder.jpg"
                }
            }
        },
        "Engine Right": {
            image: "images/room_Engine2.jpg",
            choices: ["Hallway Two"],
            description: "[N0VA]: Engine Room sector—severe damage. Power systems failing.",
            interactions: {
                "Inspect the Engine": { 
                    description: "Engine diagnostics running… Malfunctions detected. Core systems are failing, and structural integrity is compromised. If we don’t restore stability soon, this ship could break apart.",
                    newImage: "images/placeholder.jpg"
                }
            }
        },
        "Hallway Final": {
            image: "images/room_Hallway.jpg",
            choices: ["Hallway Two", "Armory", "Escape Pods"],
            description: "[N0VA]: The air feels heavy—something isn’t right."
        },
        "Armory": {
            image: "images/room_Armory.jpg",
            choices: ["Hallway Final"],
            gun: true,
            description: "[N0VA]: A high-powered firearm has been left, your best chance at defending against the hostile threat onboard."
        },
        "Escape Pods": {
            image: "images/room_EscapePod.jpg",
            choices: ["Hallway Final"],
            description: "[N0VA]: The Escape Pod Bay. Some pods appear damaged. If you have the required tools, secure your exit.",
            interactions: {
                "Repair Escape Pods": { 
                    description: "[N0VA]: You use the wrench to repair the escape pods. The pods are now operational and ready for launch!",
                    newImage: "images/EscapePods_Repaired.jpg"
                }
            }
        }
    };
    console.log("[Debug]: Room data loaded.");
    console.log(labEventTriggered);

    if (!roomData[roomName]) {
        console.log(`[Error]: Room "${roomName}" not found.`);
        return;
    }

    if (roomName === "Lab" && !labUnlocked) {
        typeText("[N0VA]: The Lab is locked down. You should head to admin if you want to unlock it.");
        return;
    }

    if (roomName === "Lab" && !labEventTriggered) {
        setLabEventTriggered(true);
        labEvent(); // Call the imported labEvent function
        console.log("[Debug]: Lab event triggered.");
        return;
    }

    if (roomName === "Cafeteria" && !cafeteriaEventTriggered) {
        setCafeteriaEventTriggered(true);
        cafeteriaEvent();
        return;
    }
 

    playDoorOpenSound();

    function playDoorOpenSound() {
        let doorSound = new Audio('Audio/DoorOpen.mp3');
        doorSound.play();
    }

    if (roomName === "Armory" && !keycardPickedUp) {
        typeText("[System]: The Armory is locked. You need the keycard to enter.");
        console.log("[Debug]: Access to the Armory denied. Keycard not found in inventory.");
        return;
    }

    if (roomName === "Escape Pods" && !wrenchPickedUp) {
        typeText("[N0VA]: The escape pods are damaged. You need the wrench to repair them and escape.");
        console.log("[Debug]: Access to escape pods denied. Wrench not found in inventory.");
        return;
    }

    const roomInfo = roomData[roomName];

    console.log(`[Debug]: Entered ${roomName}...`);

    document.getElementById("room-display").textContent = `Room: ${roomName}`;

    changeImage(roomInfo.image);

    typeText(roomInfo.description);

    const keycardPanel = document.querySelector(".keycard-item-panel");
    const wrenchPanel = document.querySelector(".wrench-item-panel");
    const gunPanel = document.querySelector(".gun-item-panel");

    if (roomInfo.keycard && !keycardPickedUp) {
        keycardPanel.style.display = "block";
    } else {
        keycardPanel.style.display = "none";
    }

    if (roomInfo.wrench && !wrenchPickedUp) {
        wrenchPanel.style.display = "block";
    } else {
        wrenchPanel.style.display = "none";
    }

    if (roomInfo.gun && !gunPickedUp) {
        gunPanel.style.display = "block";
    } else {
        gunPanel.style.display = "none";
    }

    createButtons(roomInfo);
}

export function createButtons(roomInfo) {
    const consolePanel = document.getElementById("console");

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

    function createButton(label, onClick, shouldRemove = false) {
        const button = document.createElement("button");
        button.textContent = label;
        button.addEventListener("click", () => {
            onClick(); // Execute the button's action
            if (shouldRemove) {
                button.remove(); // Remove the button only if `shouldRemove` is true
            }
        });
        styleButton(button);
        buttonContainer.appendChild(button);
        return button;
    }

    // Add room navigation buttons
    roomInfo.choices.forEach(choice => {
        createButton(choice, () => handleRoomEntry(choice));
    });

    // Add interactable item buttons
    const interactableItems = {
        keycard: "Keycard",
        wrench: "Wrench",
        gun: "Gun"
    };

    Object.entries(interactableItems).forEach(([item, name]) => {
        if (roomInfo[item]) {
            let isPickedUp = false;

            if (item === 'keycard' && !keycardPickedUp) {
                isPickedUp = true;
            } else if (item === 'wrench' && !wrenchPickedUp) {
                isPickedUp = true;
            } else if (item === 'gun' && !gunPickedUp) {
                isPickedUp = true;
            }

            if (isPickedUp) {
                createButton(`Pickup ${name}`, () => {
                    console.log(`[Debug]: ${name} picked up!`);
                    document.querySelector(`.${item}-item-panel`).style.display = "none";

                    if (item === 'keycard') {
                        setKeycardPickedUp(true);
                        const playerID = sessionStorage.getItem("loggedInID");
                        if (wrenchPickedUp && keycardPickedUp) {
                            unlockAchievement(playerID, 4); // Achievement ID 4
                        }
                    } else if (item === 'wrench') {
                        setWrenchPickedUp(true);
                        const playerID = sessionStorage.getItem("loggedInID");
                        if (wrenchPickedUp && keycardPickedUp) {
                            unlockAchievement(playerID, 4); // Achievement ID 4
                        }
                    } else if (item === 'gun') {
                        setGunPickedUp(true);
                    }

                    manageInventory(`images/item_${name}.png`, name);
                }, true); // Pass `true` to ensure the button is removed after clicking
            }
        }
    });

    // Add interaction buttons
    if (roomInfo.interactions) {
        Object.entries(roomInfo.interactions).forEach(([key, interaction]) => {
            createButton(`${key.charAt(0).toUpperCase() + key.slice(1)}`, () => {
                if (key === "Repair Escape Pods") {
                    if (wrenchPickedUp) {
                        startRepairEscapePodsMinigame(
                            () => {
                                // Success callback
                                typeText(interaction.description);
                                changeImage(interaction.newImage);
                                console.log("[System]: Escape pods repaired successfully!");
                            },
                            () => {
                                // Failure callback
                                typeText("[System]: You failed to repair the escape pods. Try again!");
                                console.log("[System]: Mini-game canceled or failed.");
                            }
                        );
                    } else {
                        typeText("[System]: You need the wrench to repair the escape pods.");
                    }
                } else {
                    typeText(interaction.description);

                    const originalImage = roomInfo.image;

                    if (interaction.newImage) {
                        changeImage(interaction.newImage);

                        setTimeout(() => {
                            if (!isRoomChanging && originalImage === roomInfo.image) {
                                changeImage(originalImage);
                            }
                        }, 5000);
                    }
                }
            });
        });
    }

    // Add "Unlock Lab" button for Admin room
    if (roomInfo.terminal && !labUnlocked) {
        createButton("Unlock Lab", () => {
            setLabUnlocked(true);
            typeText("[N0VA]: You have unlocked the Lab.");
            console.log("[Debug]: Lab unlocked!");
        }, true); // Pass `true` to ensure the button is removed after clicking
    }

    consolePanel.appendChild(buttonContainer);
    consolePanel.scrollTop = consolePanel.scrollHeight;
}

// ==========================
// 5. Inventory Management
// ==========================
export function manageInventory(imageSrc, altText) {
    const inventorySlots = document.querySelectorAll(".inventory-slot");

    for (let slot of inventorySlots) {
        if (slot.children.length > 0 && slot.children[0].alt === altText) {
            console.log(`[System]: ${altText} is already in the inventory.`);
            return;
        }
    }

    const itemImage = document.createElement("img");
    itemImage.src = imageSrc;
    itemImage.alt = altText;
    itemImage.style.maxWidth = "100%";
    itemImage.style.maxHeight = "100%";

    for (let slot of inventorySlots) {
        if (slot.children.length === 0) {
            slot.appendChild(itemImage);
            console.log(`[System]: ${altText} added to inventory slot.`);
            return;
        }
    }

    console.log("[Error]: No empty inventory slots available.");
}

// ==========================
// 6. Event Listeners
// ==========================
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        console.log("[Debug]: Escape key pressed.");
        toggleEscapeMenu();
    }
});

document.getElementById("settings-button").addEventListener("click", toggleSettingsPanel);
document.getElementById("toggle-music-button").addEventListener("click", toggleBackgroundMusic);
document.getElementById("toggle-font-size-button").addEventListener("click", toggleFontSize);
document.addEventListener("DOMContentLoaded", () => {
    initializeGame();
});

document.getElementById('returnButton').addEventListener('click', toggleEscapeMenu);
document.getElementById('exitButton').addEventListener('click', exitGame);

// ==========================
// 7. Expose Functions to Global Scope
// ==========================
window.fetchAndDisplayInventory = fetchAndDisplayInventory;
window.initializeGame = initializeGame;
window.changeImage = changeImage;
window.typeText = typeText;
window.updateAIImage = updateAIImage;
window.updateRoom = updateRoom;
window.handleRoomEntry = handleRoomEntry;
window.createButtons = createButtons;

export function playerDeath() {
    typeText("You died...");

    let deathSound = new Audio("Audio/PlayerDeath.mp3");
    deathSound.play();

    clearInventory();

    let existingButtonContainer = document.getElementById("button-container");
    if (existingButtonContainer) {
        existingButtonContainer.remove();
    }

    setTimeout(() => {
        const consolePanel = document.getElementById("console");

        const buttonContainer = document.createElement("div");
        buttonContainer.id = "button-container";
        buttonContainer.style.position = "absolute";
        buttonContainer.style.bottom = "5px";
        buttonContainer.style.left = "5px";
        buttonContainer.style.display = "flex";
        buttonContainer.style.gap = "5px";
        buttonContainer.style.flexWrap = "wrap";
        buttonContainer.style.maxWidth = "100%";

        const button = document.createElement("button");
        button.textContent = "Restart";

        button.addEventListener("click", () => {
            setNoOfDeaths(noOfDeaths + 1);

            const playerID = sessionStorage.getItem("loggedInID");

            console.log("Player ID:", playerID);
            console.log("Number of Deaths:", noOfDeaths);

            if (playerID && noOfDeaths > 0) {
                unlockAchievement(playerID, 3);
            } else {
                console.error("Player ID is missing, or no deaths recorded.");
            }

            initializeGame(true);
        });

        styleButton(button);

        buttonContainer.appendChild(button);

        consolePanel.appendChild(buttonContainer);
    }, 2000);
}

function returnToGame() {
    toggleEscapeMenu();
    window.location.href = "sp_play.html";
}

function exitGame() {
    const currentRoom = document.getElementById("room-display").textContent;
    setLocationName(currentRoom); // Use the setter function to update location_name
    saveToDatabase(noOfDeaths, getTimePlayed(), rooms_explored, currentRoom, labEventTriggered);
}

function getTimePlayed() {
    let elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    return elapsedTime;
}

document.getElementById("toggle-font-size-button").addEventListener("click", toggleFontSize);

window.fetchAndDisplayInventory = fetchAndDisplayInventory;
window.initializeGame = initializeGame;
window.changeImage = changeImage;
window.typeText = typeText;
window.updateAIImage = updateAIImage;
window.updateRoom = updateRoom;
window.handleRoomEntry = handleRoomEntry;
window.createButtons = createButtons;

document.getElementById('returnButton').addEventListener('click', toggleEscapeMenu);
document.getElementById('exitButton').addEventListener('click', exitGame);
document.getElementById("toggle-music-button").addEventListener("click", toggleBackgroundMusic);

document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("toggle-music-button");
    toggleButton.style.backgroundImage = "url('images/music_unmute.png')";
});

document.getElementById("settings-button").addEventListener("click", () => {
    const settingsPanel = document.getElementById("settings-panel");
    settingsPanel.classList.toggle("visible");
});

document.getElementById("settings-button").addEventListener("click", toggleSettingsPanel);

document.getElementById("toggle-music-button").addEventListener("click", toggleBackgroundMusic);
document.getElementById("toggle-font-size-button").addEventListener("click", toggleFontSize);

document.getElementById("settings-button").addEventListener("click", () => {
    const settingsPanel = document.getElementById("settings-panel");
    if (settingsPanel.style.display === "none" || settingsPanel.style.display === "") {
        settingsPanel.style.display = "block";
    } else {
        settingsPanel.style.display = "none";
    }
});