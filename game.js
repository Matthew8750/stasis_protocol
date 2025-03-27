function initializeGame() {
    logToConsole("[System]: Game initialized...");
<<<<<<< HEAD
    logToConsole("Example starting story");
=======
    logToConsole("You wake up in a cryo-chamber, cold and disoriented. The chamber doors open, revealing the dim, damaged interior of the ship. Something's wrong - systems are failing and the ship is eerily quiet.");
    logToConsole("Stasis disengaged. System diagnostics: comprised.")
    logToConsole("A mechanical voice cuts through the silence.")
    logToConsole("[Cortana]: Welcome back, Operator. I'm your AI companion, The ship is in critical condition. We need to exit the cryo-chamber and assess the situation.");
>>>>>>> 71c74f8873932305cf9d1e95b60ad7ebcdd73a08
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
            exits: ["Hallway Two", "Hallway Three"]
        },
        "Hallway Two": {
            image: "images/room_Hallway.jpg",
            exits: ["Admin", "Cafeteria", "Lab"]
        },
        "Admin": {
            image: "images/room_Admin.jpg",
            exits: ["Hallway Two"]
        },
        "Cafeteria": {
            image: "images/room_Cafeteria.jpg",
            exits: ["Hallway Two"]
        },
        "Hallway Three": {
            image: "images/room_Hallway.jpg",
            exits: ["Lab", "Engine Left", "Engine Right", "Hallway Final"]
        },
        "Engine Left": {
            image: "images/room_Engine1.jpg",
            exits: ["Hallway Three"]
        },
        "Engine Right": {
            image: "images/room_Engine2.jpg",
            exits: ["Hallway Three"]
        },
        "Hallway Final": {
            image: "images/room_Hallway.jpg",
            exits: ["Hallway Three", "Armory", "Escape Pods"]
        },
        "Armory": {
            image: "images/room_Armory.jpg",
            exits: ["Hallway Final"]
        },
        "Escape Pods": {
            image: "images/room_EscapePod.jpg",
            exits: ["Hallway Final"]
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

    if (!exits || exits.length === 0) {
        consolePanel.innerHTML += "[Error]: No available exits.<br>";
        return;
    }

    // Remove any existing button container
    let existingButtonContainer = document.getElementById("button-container");
    if (existingButtonContainer) {
        existingButtonContainer.remove();
    }

    // Create a button container and position it at the bottom-left
    const buttonContainer = document.createElement("div");
    buttonContainer.id = "button-container";
    buttonContainer.style.position = "absolute";
    buttonContainer.style.bottom = "5px"; // Always against the bottom
    buttonContainer.style.left = "5px"; // Always against the left border
    buttonContainer.style.display = "flex"; // Set to row direction for left to right
    buttonContainer.style.gap = "5px"; // Spacing between buttons
    buttonContainer.style.flexWrap = "wrap"; // Allow buttons to wrap if necessary
    buttonContainer.style.maxWidth = "100%"; // Prevent overflow

    exits.forEach(exit => {
        const button = document.createElement("button");
        button.textContent = exit;
        button.onclick = () => handleRoomEntry(exit);

        // Styled for better appearance inside the console
        button.style.padding = "5px 10px";
        button.style.backgroundColor = "black";
        button.style.color = "rgb(0, 255, 0)";
        button.style.border = "1px solid rgb(0, 255, 0)";
        button.style.fontFamily = "monospace";
        button.style.cursor = "pointer";
        button.style.borderRadius = "4px";

        buttonContainer.appendChild(button);
    });

    // Append the button container at the bottom-left of the console
    consolePanel.appendChild(buttonContainer);
    consolePanel.scrollTop = consolePanel.scrollHeight; // Auto-scroll to keep the buttons visible
}




function logToConsole(message) {
    const consolePanel = document.getElementById("console");

    // Define the maximum number of lines to keep in the console
    const maxLines = 5;

    // Append the new message to the console
    consolePanel.innerHTML += "<br>" + message;

    // Split the content of the console into lines and check if the number of lines exceeds the maximum
    const lines = consolePanel.innerHTML.split("<br>");

    if (lines.length > maxLines) {
        // Remove the first line (oldest message) and keep the remaining lines
        consolePanel.innerHTML = lines.slice(lines.length - maxLines).join("<br>");
    }

    // Scroll to the bottom of the console to show the latest message
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
