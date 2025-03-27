function initializeGame() {
    logToConsole("[System]: Game initialized...");
    logToConsole("You wake up in a cryo-chamber, cold and disoriented. The chamber doors open, revealing the dim, damaged interior of the ship. Something's wrong - systems are failing and the ship is eerily quiet.");
    logToConsole("Stasis disengaged. System diagnostics: comprised.")
    logToConsole("A mechanical voice cuts through the silence.")
    logToConsole("[Cortana]: Welcome back, Operator. I'm your AI companion, The ship is in critical condition. We need to exit the cryo-chamber and assess the situation.");
    handleRoomEntry("Cryogenic Chamber");
}


function changeImage(newSrc) {
    document.getElementById("display-image").src = newSrc;
}

function handleRoomEntry(roomName) {
    const roomData = {
        "Cryogenic Chamber": {
            image: "images/room_Chamber.jpg",
            exits: ["Hallway One"]
        },
        "Hallway One": {
            image: "images/room_Hallway.jpg",
            exits: ["Cryogenic Chamber", "Med Bay", "Lab"]
        },
        "Med Bay": {
            image: "images/room_MedBay.jpg",
            exits: ["Hallway One"]
        },
        "Lab": {
            image: "images/room_Lab.jpg",
            exits: ["Hallway One"]
        }
    };

    if (!roomData[roomName]) {
        logToConsole(`[Error]: Room "${roomName}" not found.`);
        return;
    }

    const roomInfo = roomData[roomName];

    // Update room display
    document.getElementById("room-display").textContent = `Room: ${roomName}`;

    // Log room entry
    logToConsole(`[System]: Entered ${roomName}...`);

    // Change the room image
    changeImage(roomInfo.image);

    // Create exit buttons
    createExitButtons(roomInfo.exits);
}

function createExitButtons(exits) {
    const consolePanel = document.getElementById("console");

    // Preserve previous log messages
    let logMessages = consolePanel.innerHTML;
    consolePanel.innerHTML = "[System]: Choose an exit:<br>";

    if (!exits || exits.length === 0) {
        consolePanel.innerHTML += "[Error]: No available exits.<br>";
        return;
    }

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.flexWrap = "wrap"; // Ensures buttons wrap inside console
    buttonContainer.style.gap = "10px";
    buttonContainer.style.marginTop = "5px";

    exits.forEach(exit => {
        const button = document.createElement("button");
        button.textContent = exit;
        button.onclick = () => handleRoomEntry(exit);

        // Styling the buttons
        button.style.padding = "5px 10px";
        button.style.backgroundColor = "black";
        button.style.color = "rgb(0, 255, 0)";
        button.style.border = "1px solid rgb(0, 255, 0)";
        button.style.fontFamily = "monospace";
        button.style.cursor = "pointer";

        buttonContainer.appendChild(button);
    });

    consolePanel.appendChild(buttonContainer);
}

function logToConsole(message) {
    const consolePanel = document.getElementById("console");
    consolePanel.innerHTML += "<br>" + message;
    consolePanel.scrollTop = consolePanel.scrollHeight;
}

function updateAIImage(newSrc) {
    document.getElementById("ai-companion").src = newSrc;
}

function updateRoom(roomName) {
    document.getElementById("room-display").textContent = "Room: " + roomName;
}

// Expose functions to global scope
window.initializeGame = initializeGame;
window.changeImage = changeImage;
window.logToConsole = logToConsole;
window.updateAIImage = updateAIImage;
window.updateRoom = updateRoom;
window.handleRoomEntry = handleRoomEntry;
window.createExitButtons = createExitButtons;
