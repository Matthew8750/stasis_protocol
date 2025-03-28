let typingTimeouts = []; // Store all active timeouts
let typingInProgress = false; // Track ongoing typing
let labEventTriggered = false;
let keycardPickedUp = false; // Global flag to track if the keycard has been picked up
let wrenchPickedUp = false; // Global flag to track if the wrench has been picked up
let gunPickedUp = false; // Global flag to track if the gun has been picked up

function initializeGame() {
    // Play background music
    let backgroundMusic = new Audio("Audio/StasisProtocolBgMusic.mp3");
    backgroundMusic.loop = true; // Loop the music
    backgroundMusic.play();
    

    typeText(
        "[System]: Game initialized...\n" +
        "You wake up in a cryo-chamber, cold and disoriented. The chamber doors open, revealing the dim, damaged interior of the ship. Something's wrong - systems are failing and the ship is eerily quiet.\n" +
        "Stasis disengaged. System diagnostics: compromised.\n" +
        "A mechanical voice cuts through the silence.\n" +
        "[AI-Companion]: Welcome back, Operator. I'm your AI companion. The ship is in critical condition. We need to exit the cryo-chamber and assess the situation."
    );

    // Reset global flags
    labEventTriggered = false;
    keycardPickedUp = false; // Reset the keycard flag

    // Clear the inventory
    clearInventory();

    // Start the game in the Cryogenic Chamber
    handleRoomEntry("Cryogenic Chamber");
}

function typeText(message, speed = 30) {  // Default speed set to 30
    const consolePanel = document.getElementById("console");

    // Stop any ongoing typing
    stopTyping();

    // Create a text container to hold the dialogue separately from buttons
    let textContainer = document.getElementById("text-container");
    if (!textContainer) {
        textContainer = document.createElement("div");
        textContainer.id = "text-container";
        consolePanel.insertBefore(textContainer, consolePanel.firstChild); // Keeps it above buttons
    }
    
    textContainer.innerHTML = ""; // Clear only the text area, not buttons
    typingInProgress = true; // Mark typing as active

    let cleanMessage = message.split("\n"); // Split message into lines

    function typeLine(lineIndex = 0) {
        if (lineIndex < cleanMessage.length) {
            let line = cleanMessage[lineIndex];
            let charIndex = 0;

            function typeCharacter() {
                if (!typingInProgress) return; // Stop if interrupted

                if (charIndex < line.length) {
                    textContainer.innerHTML += line[charIndex];
                    charIndex++;
                    typingTimeouts.push(setTimeout(typeCharacter, speed)); // Use default or passed speed
                } else {
                    textContainer.innerHTML += "<br>"; // Proper line break
                    typingTimeouts.push(setTimeout(() => typeLine(lineIndex + 1), 300)); // Delay between lines
                }
            }

            typeCharacter();
        } else {
            typingInProgress = false; // Mark typing as finished
            consolePanel.scrollTop = consolePanel.scrollHeight; // Auto-scroll
        }
    }

    typeLine();
}

// Function to stop any ongoing typing
function stopTyping() {
    typingInProgress = false; // Mark typing as stopped
    typingTimeouts.forEach(clearTimeout); // Clear all active timeouts
    typingTimeouts = []; // Reset timeouts array
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
            choices: ["Hallway One"],
            keycard: true // Add a flag to indicate the keycard should be displayed
        },
        "Lab": {
            image: "images/room_Lab.jpg",
            choices: ["Hallway One", "Hallway Two", "Hallway Three"]
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
            choices: ["Hallway Three"],
            wrench: true // Add a flag to indicate the wrench should be displayed
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
            choices: ["Hallway Final"],
            gun: true // Add a flag to indicate the gun should be displayed
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

    // If entering Lab and event hasn't triggered, call labEvent
    if (roomName === "Lab" && !labEventTriggered) {
        console.log("[Event]: Lab event triggered!");
        labEvent();
        labEventTriggered = true;
        return;
    }

    // Update room display
    document.getElementById("room-display").textContent = `Room: ${roomName}`;

    // Change the room image
    changeImage(roomInfo.image);

    // Show or hide the keycard image based on the room and whether it has been picked up
    const keycardPanel = document.querySelector(".keycard-item-panel");
    if (roomInfo.keycard && !keycardPickedUp) {
        keycardPanel.style.display = "block"; // Show the keycard
        console.log("Keycard panel is now visible.");
    } else {
        keycardPanel.style.display = "none"; // Hide the keycard
        console.log("Keycard panel is hidden.");
    }
    
    // Show or hide the wrench image based on the room and whether it has been picked up
    const wrenchPanel = document.querySelector(".wrench-item-panel");
    if (roomInfo.wrench && !wrenchPickedUp) {
        wrenchPanel.style.display = "block"; // Show the wrench
        console.log("Wrench panel is now visible.");
    } else {
        wrenchPanel.style.display = "none"; // Hide the wrench
        console.log("Wrench panel is hidden.");
    }
    
    // Show or hide the gun image
    const gunPanel = document.querySelector(".gun-item-panel");
    if (roomInfo.gun && !gunPickedUp) {
        gunPanel.style.display = "block";
        console.log("Gun panel is now visible.");
    } else {
        gunPanel.style.display = "none";
        console.log("Gun panel is hidden.");
    }

    // Create buttons for available choices
    createChoiceButtons(roomInfo.choices, roomInfo.keycard && !keycardPickedUp, roomInfo.wrench && !wrenchPickedUp, roomInfo.gun && !gunPickedUp);
}

function labEvent() {
    // Stop any ongoing typing and notify the player
    stopTyping();
    typeText("[AI-Companion] Did you hear that? Hide now!", 15);

    const consolePanel = document.getElementById("console");
    const choices = ["Hide inside the medical closet.", "Hide under the desk"];
    changeImage("images/room_Lab.jpg");

    if (!choices || choices.length === 0) {
        playerDeath();
        return;
    }

    // Remove any existing button container
    let existingButtonContainer = document.getElementById("button-container");
    if (existingButtonContainer) {
        existingButtonContainer.remove();
    }

    // Create a button container
    const buttonContainer = document.createElement("div");
    buttonContainer.id = "button-container";
    buttonContainer.style.position = "absolute";
    buttonContainer.style.bottom = "5px";
    buttonContainer.style.left = "5px";
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "5px";
    buttonContainer.style.flexWrap = "wrap";
    buttonContainer.style.maxWidth = "100%";

    // Start a timer that kills the player if they don't hide in 5 seconds
    let hideTimer = setTimeout(() => {
        console.log("[DEBUG] Timer expired! Player failed to hide."); // Debugging log
        typeText("[AI-Companion] Too slow! It's too late...", 15);
        changeImage("images/LabRoomImage_Death.png");
        playerDeath();
    }, 5000); // 5 seconds

    choices.forEach(choice => {
        const button = document.createElement("button");
        button.textContent = choice;

        // Assign specific behavior based on choice
        button.addEventListener("click", () => {
            console.log(`[DEBUG] Player selected: ${choice}`); // Debugging log
            clearTimeout(hideTimer); // Cancel the death timer

            if (choice === "Hide inside the medical closet.") {
                labEventTriggered = true;
                handleRoomEntry("Lab");
            } else if (choice === "Hide under the desk") {
                changeImage("images/LabRoomImage_Death.png");
                playerDeath();
            }
        });

        // Styled for better appearance
        button.style.padding = "5px 10px";
        button.style.backgroundColor = "black";
        button.style.color = "rgb(0, 255, 0)";
        button.style.border = "1px solid rgb(0, 255, 0)";
        button.style.fontFamily = "monospace";
        button.style.cursor = "pointer";
        button.style.borderRadius = "4px";

        buttonContainer.appendChild(button);
    });

    // Append the button container to the console
    consolePanel.appendChild(buttonContainer);
    consolePanel.scrollTop = consolePanel.scrollHeight; // Auto-scroll
}


function createChoiceButtons(choices, hasKeycard, hasWrench, hasGun) {
    const consolePanel = document.getElementById("console");

    if (!choices || choices.length === 0) {
        playerDeath();
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
    buttonContainer.style.bottom = "5px";
    buttonContainer.style.left = "5px";
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "5px";
    buttonContainer.style.flexWrap = "wrap";
    buttonContainer.style.maxWidth = "100%";

    // Create buttons for each room choice
    choices.forEach(choice => {
        const button = document.createElement("button");
        button.textContent = choice;

        button.addEventListener('click', () => {
            handleRoomEntry(choice);
        });

        // Apply styles for room buttons
        styleButton(button);

        buttonContainer.appendChild(button);
    });

    // Add a "Pickup Keycard" button if the room has a keycard and it hasn't been picked up
    if (hasKeycard) {
        const pickupButton = document.createElement("button");
        pickupButton.textContent = "Pickup Keycard";

        pickupButton.addEventListener('click', () => {
            console.log("[Debug]: Keycard picked up!");

            // Hide the keycard image and the button
            const keycardPanel = document.querySelector(".keycard-item-panel");
            keycardPanel.style.display = "none";
            pickupButton.style.display = "none";

            // Add the keycard to the first empty inventory slot
            addItemToInventory("images/item_Keycard.png", "Keycard");

            // Set the flag to true to prevent the keycard from being picked up again
            keycardPickedUp = true;
        });

        // Apply styles for the "Pickup Keycard" button
        styleButton(pickupButton);

        buttonContainer.appendChild(pickupButton);
    }

    // Add a "Pickup Wrench" button if the room has a wrench and it hasn't been picked up
    if (hasWrench) {
        const pickupButton = document.createElement("button");
        pickupButton.textContent = "Pickup Wrench";

        pickupButton.addEventListener('click', () => {
            console.log("[Debug]: Wrench picked up!");

            // Hide the wrench image and the button
            const wrenchPanel = document.querySelector(".wrench-item-panel");
            wrenchPanel.style.display = "none";
            pickupButton.style.display = "none";

            // Add the wrench to the first empty inventory slot
            addItemToInventory("images/item_Wrench.png", "Wrench");

            // Set the flag to true to prevent the wrench from being picked up again
            wrenchPickedUp = true;
        });

        // Apply styles for the "Pickup Wrench" button
        styleButton(pickupButton);

        buttonContainer.appendChild(pickupButton);
    }

    // Add a "Pickup Gun" button if the room has a gun and it hasn't been picked up
    if (hasGun) {
        const pickupButton = document.createElement("button");
        pickupButton.textContent = "Pickup Gun";

        pickupButton.addEventListener('click', () => {
            console.log("[Debug]: Gun picked up!");

            // Hide the gun image and the button
            const gunPanel = document.querySelector(".gun-item-panel");
            gunPanel.style.display = "none";
            pickupButton.style.display = "none";

            // Add the gun to the first empty inventory slot
            addItemToInventory("images/item_Gun.png", "Gun");

            // Set the flag to true to prevent the gun from being picked up again
            gunPickedUp = true;
        });

        // Apply styles for the "Pickup Gun" button
        styleButton(pickupButton);

        buttonContainer.appendChild(pickupButton);
    }

    // Append the button container at the bottom-left of the console
    consolePanel.appendChild(buttonContainer);
    consolePanel.scrollTop = consolePanel.scrollHeight; // Auto-scroll to keep the buttons visible
}

// Helper function to apply button styles
function styleButton(button) {
    button.style.padding = "5px 10px";
    button.style.backgroundColor = "black";
    button.style.color = "rgb(0, 255, 0)";
    button.style.border = "1px solid rgb(0, 255, 0)";
    button.style.fontFamily = "monospace";
    button.style.cursor = "pointer";
    button.style.borderRadius = "4px";
}

function playerDeath() {
    typeText("You died...");

    // Play death sound
    let deathSound = new Audio("Audio/PlayerDeath.mp3");
    deathSound.play();

    // Remove any existing button container
    let existingButtonContainer = document.getElementById("button-container");
    if (existingButtonContainer) {
        existingButtonContainer.remove();
    }

    // Wait for the typing animation to finish before adding the button
    setTimeout(() => {
        const consolePanel = document.getElementById("console");

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

        const button = document.createElement("button");
        button.textContent = "Restart";

        button.addEventListener("click", () => {
            initializeGame(); // Restart the game
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

        // Append the button container at the bottom-left of the console
        consolePanel.appendChild(buttonContainer);
    }, 2000); // Delay adding the button to allow text to fully type out
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

function clearInventory() {
    const inventorySlots = document.querySelectorAll(".inventory-slot");
    inventorySlots.forEach(slot => {
        slot.innerHTML = ""; // Remove all items from the inventory slots
    });
    console.log("[System]: Inventory cleared.");
}

function addItemToInventory(imageSrc, altText) {
    const inventorySlots = document.querySelectorAll(".inventory-slot");
    const itemImage = document.createElement("img");
    itemImage.src = imageSrc;
    itemImage.alt = altText;
    itemImage.style.maxWidth = "100%";
    itemImage.style.maxHeight = "100%";

    let addedToInventory = false;
    for (let slot of inventorySlots) {
        if (slot.children.length === 0) { // Check if the slot is empty
            slot.appendChild(itemImage);
            console.log(`[System]: ${altText} added to inventory slot.`);
            addedToInventory = true;
            break;
        }
    }

    if (!addedToInventory) {
        console.log("[Error]: No empty inventory slots available.");
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