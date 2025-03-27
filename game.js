function initializeGame() {
    logToConsole("[System]: Game initialized...");
    logToConsole("You wake up in a cryo-chamber, cold and disoriented. The chamber doors open, revealing the dim, damaged interior of the ship. Something's wrong - systems are failing and the ship is eerily quiet.");
    logToConsole("Stasis disengaged. System diagnostics: comprised.")
    logToConsole("A mechanical voice cuts through the silence.")
    logToConsole("[Ai-Companion]: Welcome back, Operator. I'm your AI companion, The ship is in critical condition. We need to exit the cryo-chamber and assess the situation.");
    handleRoomEntry("Cryogenic Chamber");
    connectToDatabase();
    fetchAndDisplayInventory();
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

async function connectToDatabase() {

    console.log('Connecting to the database...');

    let hostname = 'localhost';
    let username = 'jrice27';
    let password = 'rZk8FVrXNllcPl8Y';
    let database = 'CSC1034_CW_13';

    // Get the input value from the user
    let input = document.getElementById('player-name').value; // Replace 'player-name' with the actual input field ID

    // Sanitize the input to prevent SQL injection
    let sanitizedInput = input.replace(/'/g, "\\'");

    // Create the query string
    let query = `INSERT INTO player (player_name) VALUES ('${sanitizedInput}')`;

    // Prepare form data to send to the backend
    let formData = new FormData();
    formData.append('hostname', hostname);
    formData.append('username', username);
    formData.append('password', password);
    formData.append('database', database);
    formData.append('query', query);

    try {
        let url = 'https://jrice27.webhosting1.eeecs.qub.ac.uk/dbConnector.php';
        let response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        let result = await response.json();

        // Get the results div and clear previous results
        let resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';

        if (result.error) {
            console.log(result.error.toString());
            resultsDiv.innerHTML = `<p style="color:red;">${result.error}</p>`;
        } else {
            resultsDiv.innerHTML = `<p>${result.success ? 'Query executed successfully' : 'No data returned'}</p>`;
            if (result.affected_rows !== undefined) {
                resultsDiv.innerHTML += `<p>Affected Rows: ${result.affected_rows}</p>`;
            }
        }
    } catch (error) {
        console.error('Error:', error);
        let resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = `<p style="color:red;">Unable to connect to the database. Please try again later.</p>`;
    }
}

async function fetchAndDisplayInventory() {
    console.log('Fetching inventory items from the database...');

    let hostname = 'localhost';
    let username = 'jrice27';
    let password = 'rZk8FVrXNllcPl8Y';
    let database = 'CSC1034_CW_13';

    // Query to fetch items from the database
    let query = `SELECT item_name, item_image FROM player_inventory`;

    // Prepare form data to send to the backend
    let formData = new FormData();
    formData.append('hostname', hostname);
    formData.append('username', username);
    formData.append('password', password);
    formData.append('database', database);
    formData.append('query', query);

    try {
        let url = 'https://jrice27.webhosting1.eeecs.qub.ac.uk/dbConnector.php';
        let response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        let result = await response.json();

        if (result.error) {
            console.error(result.error.toString());
            logToConsole(`[Error]: ${result.error}`);
            return;
        }

        // Clear the inventory slots
        const inventoryContainer = document.querySelector('.inventory');
        inventoryContainer.innerHTML = '';

        // Populate inventory slots with items
        result.data.forEach(item => {
            const slot = document.createElement('div');
            slot.classList.add('inventory-slot');

            // Create an image element for the item
            const img = document.createElement('img');
            img.src = item.item_image; // Use the image URL from the database
            img.alt = item.item_name; // Use the item name as alt text
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';

            // Append the image to the slot
            slot.appendChild(img);

            // Append the slot to the inventory container
            inventoryContainer.appendChild(slot);
        });

        logToConsole(`[System]: Inventory updated with ${result.data.length} items.`);
    } catch (error) {
        console.error('Error:', error);
        logToConsole('[Error]: Unable to fetch inventory items. Please try again later.');
    }
}

// Call this function after the game initializes
window.fetchAndDisplayInventory = fetchAndDisplayInventory;