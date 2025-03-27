function initializeGame() {
    typeText(
        "[System]: Game initialized...\n" +
        "You wake up in a cryo-chamber, cold and disoriented. The chamber doors open, revealing the dim, damaged interior of the ship. Something's wrong - systems are failing and the ship is eerily quiet.\n" +
        "Stasis disengaged. System diagnostics: compromised.\n" +
        "A mechanical voice cuts through the silence.\n" +
        "[AI-Companion]: Welcome back, Operator. I'm your AI companion. The ship is in critical condition. We need to exit the cryo-chamber and assess the situation."
    );
    handleRoomEntry("Cryogenic Chamber");
}

//type to console, use for dialogue or story
function typeText(message) {
    const consolePanel = document.getElementById("console");

    // Create a text container to hold the dialogue separately from buttons
    let textContainer = document.getElementById("text-container");
    if (!textContainer) {
        textContainer = document.createElement("div");
        textContainer.id = "text-container";
        consolePanel.insertBefore(textContainer, consolePanel.firstChild); // Keeps it above buttons
    }
    
    textContainer.innerHTML = ""; // Clear only the text area, not buttons

    let index = 0;
    let cleanMessage = message.split("\n"); // Split message into lines

    function typeLine(lineIndex = 0) {
        if (lineIndex < cleanMessage.length) {
            let line = cleanMessage[lineIndex];
            let charIndex = 0;

            function typeCharacter() {
                if (charIndex < line.length) {
                    textContainer.innerHTML += line[charIndex];
                    charIndex++;
                    setTimeout(typeCharacter, 30); // Typing speed
                } else {
                    textContainer.innerHTML += "<br>"; // Proper line break
                    setTimeout(() => typeLine(lineIndex + 1), 300); // Delay between lines
                }
            }

            typeCharacter();
        } else {
            consolePanel.scrollTop = consolePanel.scrollHeight; // Auto-scroll
        }
    }

    typeLine();
}


function changeImage(newSrc) {
    document.getElementById("display-image").src = newSrc;
}

function handleRoomEntry(roomName) {
    const roomData = {
        "Cryogenic Chamber": {
            image: "images/room_Chamber.jpg",
            choices: ["Hallway One"]
        },
        "Hallway One": {
            image: "images/room_Hallway.jpg",
            choices: ["Med Bay", "Lab"]
        },
        "Med Bay": {
            image: "images/room_MedBay.jpg",
            choices: ["Hallway One"]
        },
        "Lab": {
            image: "images/room_Lab.jpg",
            choices: ["Hallway Two", "Hallway Three"]
        },
        "Hallway Two": {
            image: "images/room_Hallway.jpg",
            choices: ["Admin", "Cafeteria", "Lab"]
        },
        "Admin": {
            image: "images/room_Admin.jpg",
            choices: ["Hallway Two"]
        },
        "Cafeteria": {
            image: "images/room_Cafeteria.jpg",
            choices: ["Hallway Two"]
        },
        "Hallway Three": {
            image: "images/room_Hallway.jpg",
            choices: ["Lab", "Engine Left", "Engine Right", "Hallway Final"]
        },
        "Engine Left": {
            image: "images/room_Engine1.jpg",
            choices: ["Hallway Three"]
        },
        "Engine Right": {
            image: "images/room_Engine2.jpg",
            choices: ["Hallway Three"]
        },
        "Hallway Final": {
            image: "images/room_Hallway.jpg",
            choices: ["Hallway Three", "Armory", "Escape Pods"]
        },
        "Armory": {
            image: "images/room_Armory.jpg",
            choices: ["Hallway Final"]
        },
        "Escape Pods": {
            image: "images/room_EscapePod.jpg",
            choices: ["Hallway Final"]
        }
    };

    if (!roomData[roomName]) {
        console.log(`[Error]: Room "${roomName}" not found.`);
        return;
    }

    const roomInfo = roomData[roomName];

    // Log room entry (Debugging)
    console.log(`[Debug]: Entered ${roomName}...`);

    // Update room display
    document.getElementById("room-display").textContent = `Room: ${roomName}`;

    // Change the room image
    changeImage(roomInfo.image);

    // Create buttons for available choices
    createChoiceButtons(roomInfo.choices);
}

function createChoiceButtons(choices) {
    const consolePanel = document.getElementById("console");

    if (!choices || choices.length === 0) {
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

    // Debugging: Log choices to ensure they are being passed correctly
    console.log("Choices available:", choices);

    choices.forEach(choice => {
        const button = document.createElement("button");
        button.textContent = choice;

        // Debugging: Log button creation to verify that buttons are being made
        console.log("Creating button for:", choice);

        // Simple click handler to test if button clicks are recognized
        button.addEventListener('click', () => {
            console.log(`[Debug]: Button clicked for room: ${choice}`); // Log when button is clicked
            handleRoomEntry(choice); // Trigger room entry with the chosen room
        });

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

    // Debugging: Log the button container's HTML to check if buttons are added
    console.log("Button container HTML:", buttonContainer.innerHTML);

    // Append the button container at the bottom-left of the console
    consolePanel.appendChild(buttonContainer);
    consolePanel.scrollTop = consolePanel.scrollHeight; // Auto-scroll to keep the buttons visible
}


function updateAIImage(newSrc) {
    document.getElementById("ai-companion").src = newSrc;
}

function updateRoom(roomName) {
    document.getElementById("room-display").textContent = "Room: " + roomName;
}

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
            console.log(`[Error]: ${result.error}`);
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

        console.log(`[System]: Inventory updated with ${result.data.length} items.`);
    } catch (error) {
        console.error('Error:', error);
        console.log('[Error]: Unable to fetch inventory items. Please try again later.');
    }
}

// Expose functions to global scope
window.fetchAndDisplayInventory = fetchAndDisplayInventory;
window.initializeGame = initializeGame;
window.changeImage = changeImage;
window.typeText = typeText;
window.updateAIImage = updateAIImage;
window.updateRoom = updateRoom;
window.handleRoomEntry = handleRoomEntry;
window.createChoiceButtons = createChoiceButtons;