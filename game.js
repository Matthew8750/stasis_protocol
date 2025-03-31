let typingTimeouts = []; // Store all active timeouts
let typingInProgress = false; // Track ongoing typing
let labEventTriggered = false;
let noOfDeaths = 0;
let time_played = 0;
let rooms_explored = 0;
let location_name = "Cryogenic Chamber";
let startTime = Date.now();  // Store the timestamp when the game starts
let wrenchPickedUp = false; // Global flag to track if the wrench has been picked up
let gunPickedUp = false; // Global flag to track if the gun has been picked up
let keycardPickedUp = false; // Global flag to track if the keycard has been picked up
let gameStartTime = Date.now() / 1000;
let lastSaveTime = 0;
let backgroundMusic = new Audio("Audio/StasisProtocolBgMusic.mp3");
backgroundMusic.loop = true;
let isMusicPlaying = true; // Track whether the music is playing
/*
Current Bugs: 

On new player save, after error is displayed you cant click show or hide password button

*/

async function initializeGame(restartGame = false) {
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


    labEventTriggered = false;
    keycardPickedUp = false;
    gunPickedUp = false;
    wrenchPickedUp = false;
    clearInventory();

    handleRoomEntry("Cryogenic Chamber");
}

function typeText(message, speed = 30) {  // Default speed set to 30
    const consolePanel = document.getElementById("console");

    // Internal function to stop ongoing typing
    function stopTyping() {
        typingInProgress = false; // Mark typing as stopped
        typingTimeouts.forEach(clearTimeout); // Clear all active timeouts
        typingTimeouts = []; // Reset timeouts array
    }

    stopTyping(); // Stop any previous typing effect

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

function changeImage(newSrc) {
    document.getElementById("display-image").src = newSrc;
}
function handleRoomEntry(roomName) {
    const roomData = {
        "Cryogenic Chamber": {
            image: "images/room_Chamber.jpg",
            choices: ["Hallway One"],
            description: "[N0VA]: You awaken in the Cryogenic Chamber. The ship is eerily silent. Systems flicker weakly—something is wrong.",
            interactions: {
                "Inspect Stasis Pods": { 
                    description: "add text here",
                    newImage: "images/placeholder.jpg"
                }
            }
        },
        "Hallway One": {
            image: "images/room_Hallway.jpg",
            choices: ["Med Bay", "Lab"],
            description: "[N0VA]: This hallway connects various sections of the ship. Faint emergency lights flicker, casting long shadows."
            
        },
        "Med Bay": {
            image: "images/room_MedBay.jpg",
            choices: ["Hallway One"],
            keycard: true,
            description: "[N0VA]: This is the Med Bay. A security keycard is present; retrieval is advised.",
            interactions: {
                "Open Drawers": { 
                    description: "add text here",
                    newImage: "images/placeholder.jpg"
                },
                "Inspect Blood": { 
                    description: "add text here",
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
                    description: "add text here",
                    newImage: "images/placeholder.jpg"
                }
            }
        },
        "Admin": {
            image: "images/room_Admin.jpg",
            choices: ["Cafeteria"],
            description: "[N0VA]: This is the Admin Control Room. Multiple terminals are active but unstable—data corruption detected.",
            interactions: {
                "Inspect Terminal": { 
                    description: "add text here",
                    newImage: "images/placeholder.jpg"
                }
            }
        },
        "Cafeteria": {
            image: "images/room_Cafeteria.jpg",
            choices: ["Lab", "Admin"],
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
                    description: "add text here",
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
                    description: "add text here",
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
            description: "[N0VA]: The Escape Pod Bay. Some pods appear damaged. If you have the required tools, secure your exit."
        }
    }


    if (!roomData[roomName]) {
        console.log(`[Error]: Room "${roomName}" not found.`);
        return;
    }

    // Play the door open sound when entering the room
    playDoorOpenSound();

    // Function for playing door open sound
    function playDoorOpenSound() {
        let doorSound = new Audio('Audio/DoorOpen.mp3');
        doorSound.play();
    }

    // Check for a 10% chance to play the alien random noise
    if (Math.random() < 0.1) {
        playAlienRandomNoise();
    }

    // Check if the Armory is locked
    if (roomName === "Armory" && !keycardPickedUp) {
        typeText("[System]: The Armory is locked. You need the keycard to enter.");
        console.log("[Debug]: Access to the Armory denied. Keycard not found in inventory.");
        return; // Prevent access to the Armory
    }

    // Check if the Escape Pods require the wrench
    if (roomName === "Escape Pods" && !wrenchPickedUp) {
        typeText("[N0VA]: The escape pods are damaged. You need the wrench to repair them and escape.");
        console.log("[Debug]: Access to escape pods denied. Wrench not found in inventory.");
        return; // Prevent escape without the wrench
    }

    const roomInfo = roomData[roomName];

    // Log room entry (Debugging)
    console.log(`[Debug]: Entered ${roomName}...`);

    // Update room display
    document.getElementById("room-display").textContent = `Room: ${roomName}`;

    // Change the room image
    changeImage(roomInfo.image);

    // Display the room description
    typeText(roomInfo.description); // <-- This will write the room description

    // Show or hide the keycard image based on the room and whether it has been picked up
    // When entering the room, ensure all item panels are checked for visibility
    const keycardPanel = document.querySelector(".keycard-item-panel");
    const wrenchPanel = document.querySelector(".wrench-item-panel");
    const gunPanel = document.querySelector(".gun-item-panel");

    // Handle keycard visibility
    if (roomInfo.keycard && !keycardPickedUp) {
        keycardPanel.style.display = "block"; // Show keycard
    } else {
        keycardPanel.style.display = "none"; // Hide keycard
    }

    // Handle wrench visibility
    if (roomInfo.wrench && !wrenchPickedUp) {
        wrenchPanel.style.display = "block"; // Show wrench
    } else {
        wrenchPanel.style.display = "none"; // Hide wrench
    }

    // Handle gun visibility
    if (roomInfo.gun && !gunPickedUp) {
        gunPanel.style.display = "block"; // Show gun
    } else {
        gunPanel.style.display = "none"; // Hide gun
    }

    // Create buttons for available choices
    createButtons(roomInfo);
}

// Function for playing alien random noise
function playAlienRandomNoise() {
    let alienNoise = new Audio('Audio/AlienRandomNoise.mp3');
    alienNoise.play();
}

function labEvent() {
    typeText("[N0VA] Did you hear that? Hide now!", 15);

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
        changeImage("images/LabRoomImage_Death.png");
        playerDeath();
    }, 5000); // 5 seconds

    choices.forEach(choice => {
        const button = document.createElement("button");
        button.textContent = choice;

        // Assign specific behavior based on choice
        button.addEventListener("click", () => {
            clearTimeout(hideTimer); // Cancel the death timer

            if (choice === "Hide inside the medical closet.") {
                labEventTriggered = true;
                consolePanel.innerHTML = '';
                typeText("[AI Companion] add some text here when you hide in the closet ")
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

function createButtons(roomInfo) {
    const consolePanel = document.getElementById("console");

    // Remove existing button container
    let existingButtonContainer = document.getElementById("button-container");
    if (existingButtonContainer) {
        existingButtonContainer.remove();
    }

    // Create a new button container
    const buttonContainer = document.createElement("div");
    buttonContainer.id = "button-container";
    buttonContainer.style.position = "absolute";
    buttonContainer.style.bottom = "5px";
    buttonContainer.style.left = "5px";
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "5px";
    buttonContainer.style.flexWrap = "wrap";
    buttonContainer.style.maxWidth = "100%";

    // Function to create buttons dynamically
    function createButton(label, onClick) {
        const button = document.createElement("button");
        button.textContent = label;
        button.addEventListener("click", onClick);
        styleButton(button);
        buttonContainer.appendChild(button);
        return button; // Return the button so we can remove it later
    }

    // Create movement buttons
    roomInfo.choices.forEach(choice => {
        createButton(choice, () => handleRoomEntry(choice));
    });

    // Create item pickup buttons
    const interactableItems = {
        keycard: "Keycard",
        wrench: "Wrench",
        gun: "Gun"
    };

    Object.entries(interactableItems).forEach(([item, name]) => {
        // Check if the item is in the room and hasn't been picked up yet
        if (roomInfo[item]) {
            let isPickedUp = false;
    
            // Set the flag based on the item type
            if (item === 'keycard' && !keycardPickedUp) {
                isPickedUp = true;
            } else if (item === 'wrench' && !wrenchPickedUp) {
                isPickedUp = true;
            } else if (item === 'gun' && !gunPickedUp) {
                isPickedUp = true;
            }
    
            // If the item is available and hasn't been picked up, create a button
            if (isPickedUp) {
                const button = createButton(`Pickup ${name}`, () => {
                    console.log(`[Debug]: ${name} picked up!`);  // Confirm button click
                    document.querySelector(`.${item}-item-panel`).style.display = "none"; // Hide the item panel
    
                    // Set the appropriate flag based on the item
                    if (item === 'keycard') {
                        keycardPickedUp = true;
                    } else if (item === 'wrench') {
                        wrenchPickedUp = true;
                    } else if (item === 'gun') {
                        gunPickedUp = true;
                    }
    
                    console.log(`${item}PickedUp: ${eval(`${item}PickedUp`)}`); // Log the flag to confirm it was set
    
                    // Add item to inventory
                    manageInventory(`images/item_${name}.png`, name);
    
                    // Hide the pickup button
                    button.style.display = "none"; // Hide the pickup button
                });
            }
        }
    });
    
   let isRoomChanging = false;  // Flag to track if the room is changing

// Create interaction buttons (e.g., "Open Drawer")
if (roomInfo.interactions) {
    Object.entries(roomInfo.interactions).forEach(([key, interaction]) => {
        createButton(`${key.charAt(0).toUpperCase() + key.slice(1)}`, () => {
            typeText(interaction.description);

            // Store the current room image before interacting with the drawer
            const originalImage = roomInfo.image;

            // If there's a new image for the interaction, display it
            if (interaction.newImage) {
                changeImage(interaction.newImage);

                // Set a timeout to revert back to the original image after 5 seconds
                setTimeout(() => {
                    // Check if the room has not changed and we are still in the same room
                    if (!isRoomChanging && originalImage === roomInfo.image) {
                        changeImage(originalImage);  // Revert to the original image
                    }
                }, 5000);
            }
        });
    });
}

// Call this method when the room is about to change
function handleRoomChange() {
    isRoomChanging = true;  // Mark that the room is changing
}

// Call this method after the room has changed
function resetRoomChangeFlag() {
    isRoomChanging = false;  // Reset the flag after the room change is complete
}



    // Append buttons to console panel
    consolePanel.appendChild(buttonContainer);
    consolePanel.scrollTop = consolePanel.scrollHeight; // Auto-scroll to keep buttons visible
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

    clearInventory();

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
            noOfDeaths++;
            initializeGame(true); // Restart the game
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

// Function to return to the game (reload the game page)
function returnToGame() {
    toggleEscapeMenu(); // Close the escape menu
    window.location.href = "sp_play.html";  // Redirects to the game page
}

// Function to exit the game (or close the window)
function exitGame() 
{
    location_name = document.getElementById("room-display").textContent
    saveToDatabase(noOfDeaths, getTimePlayed(), rooms_explored, location_name, labEventTriggered);
    //window.location.href = 'sp-gamehub.html'; // Redirect to previous screen
}

// Function to get the total time played in seconds
function getTimePlayed() {
    let elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Convert ms to seconds
    return elapsedTime;
}

// Event listener for the Escape key to open the menu
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        toggleEscapeMenu(); // Toggle the escape menu on Escape key press
    }
});

function toggleEscapeMenu() {
    const menu = document.getElementById('escapeMenu');
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}

function manageInventory(imageSrc, altText) {
    const inventorySlots = document.querySelectorAll(".inventory-slot");

    // Check if the item already exists in inventory
    for (let slot of inventorySlots) {
        if (slot.children.length > 0 && slot.children[0].alt === altText) {
            console.log(`[System]: ${altText} is already in the inventory.`);
            return; // Stop execution if item is already in inventory
        }
    }

    // Add item if it's not already in the inventory
    const itemImage = document.createElement("img");
    itemImage.src = imageSrc;
    itemImage.alt = altText;
    itemImage.style.maxWidth = "100%";
    itemImage.style.maxHeight = "100%";

    for (let slot of inventorySlots) {
        if (slot.children.length === 0) { // Check for an empty slot
            slot.appendChild(itemImage);
            console.log(`[System]: ${altText} added to inventory slot.`);
            return;
        }
    }

    console.log("[Error]: No empty inventory slots available.");
}

//Database Functions Below
async function saveToDatabase(noOfDeaths, time_played, rooms_explored, location_name, labEventTriggered) {
    console.log('Connecting to the database...');

    const loggedInID = sessionStorage.getItem('loggedInID');
    if (!loggedInID) {
        console.error('Error: No player ID found in session.');
        return;
    }

    let sanitizedInput = loggedInID.replace(/'/g, "\\'");
    let sanitizedLocation = location_name ? location_name.replace(/^Room:\s*/, '').replace(/'/g, "\\'") : "Unknown Location";

    // Calculate time played
    let currentTime = Date.now() / 1000;
    let elapsedTime = currentTime - gameStartTime + lastSaveTime;
    let hours = Math.floor(elapsedTime / 3600).toString().padStart(2, '0');
    let minutes = Math.floor((elapsedTime % 3600) / 60).toString().padStart(2, '0');
    let seconds = (elapsedTime % 60).toString().padStart(2, '0');
    let formattedTime = `${hours}:${minutes}:${seconds}`;

    let labTriggeredValue = labEventTriggered ? 1 : 0;

    try {
        // Check if a save already exists
        let checkQuery = `SELECT COUNT(*) AS saveExists FROM game_stats WHERE player_id = '${sanitizedInput}'`;
        let checkData = new FormData();
        checkData.append('hostname', 'localhost');
        checkData.append('username', 'jrice27');
        checkData.append('password', 'rZk8FVrXNllcPl8Y');
        checkData.append('database', 'CSC1034_CW_13');
        checkData.append('query', checkQuery);

        let checkResponse = await fetch('https://jrice27.webhosting1.eeecs.qub.ac.uk/dbConnector.php', { method: 'POST', body: checkData });
        let checkResult = await checkResponse.json();
        let saveExists = checkResult.data && checkResult.data[0].saveExists > 0;

        // Save or update game stats
        let query = saveExists
            ? `UPDATE game_stats SET deaths = ${noOfDeaths}, time_played = '${formattedTime}', rooms_explored = ${rooms_explored}, 
                location_name = '${sanitizedLocation}', labEventTriggered = ${labTriggeredValue} WHERE player_id = '${sanitizedInput}'`
            : `INSERT INTO game_stats (player_id, deaths, time_played, rooms_explored, location_name, labEventTriggered) 
                VALUES ('${sanitizedInput}', ${noOfDeaths}, '${formattedTime}', ${rooms_explored}, '${sanitizedLocation}', ${labTriggeredValue})`;

        let formData = new FormData();
        formData.append('hostname', 'localhost');
        formData.append('username', 'jrice27');
        formData.append('password', 'rZk8FVrXNllcPl8Y');
        formData.append('database', 'CSC1034_CW_13');
        formData.append('query', query);

        let response = await fetch('https://jrice27.webhosting1.eeecs.qub.ac.uk/dbConnector.php', { method: 'POST', body: formData });
        let result = await response.json();

        if (result.error) {
            console.log(result.error.toString());
        } else {
            console.log("Game save successful!");
        }

        // Function to check if an item exists before inserting
        async function addItemIfNotExists(itemID) {
            // Ensure itemID is a valid number
            if (!itemID || isNaN(itemID) || itemID <= 0) {
                console.log(`Invalid item ID: ${itemID}, skipping insert.`);
                return;
            }

            let itemCheckQuery = `SELECT COUNT(*) AS itemExists FROM player_inventory WHERE player_id = '${sanitizedInput}' AND item_id = ${itemID}`;
            let itemCheckData = new FormData();
            itemCheckData.append('hostname', 'localhost');
            itemCheckData.append('username', 'jrice27');
            itemCheckData.append('password', 'rZk8FVrXNllcPl8Y');
            itemCheckData.append('database', 'CSC1034_CW_13');
            itemCheckData.append('query', itemCheckQuery);

            let itemCheckResponse = await fetch('https://jrice27.webhosting1.eeecs.qub.ac.uk/dbConnector.php', { method: 'POST', body: itemCheckData });
            let itemCheckResult = await itemCheckResponse.json();

            if (itemCheckResult.data[0].itemExists == 0) {
                let insertQuery = `INSERT INTO player_inventory (player_id, item_id) VALUES ('${sanitizedInput}', ${itemID})`;
                let insertData = new FormData();
                insertData.append('hostname', 'localhost');
                insertData.append('username', 'jrice27');
                insertData.append('password', 'rZk8FVrXNllcPl8Y');
                insertData.append('database', 'CSC1034_CW_13');
                insertData.append('query', insertQuery);

                let insertResponse = await fetch('https://jrice27.webhosting1.eeecs.qub.ac.uk/dbConnector.php', { method: 'POST', body: insertData });
                let insertResult = await insertResponse.json();

                if (insertResult.error) {
                    console.log(`Error saving item ${itemID}:`, insertResult.error);
                } else {
                    console.log(`Item ${itemID} added to inventory.`);
                }
            } else {
                console.log(`Item ${itemID} already exists, skipping insert.`);
            }
        }

        // Insert only if the item does not exist
        if (wrenchPickedUp) {
            console.log("Attempting to add wrench (item 1) to inventory...");
            await addItemIfNotExists(1);
        }
        if (keycardPickedUp) {
            console.log("Attempting to add keycard (item 2) to inventory...");
            await addItemIfNotExists(2);
        }
        if (gunPickedUp) {
            console.log("Attempting to add gun (item 3) to inventory...");
            await addItemIfNotExists(3);
        }
        

    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadSave(playerID) {
    console.log("[System]: Checking for saved game...");

    let query = `SELECT deaths, time_played, rooms_explored, location_name, labEventTriggered FROM game_stats WHERE player_ID = '${playerID}'`;
    let inventoryQuery = `SELECT item_id FROM player_inventory WHERE player_id = '${playerID}'`;

    let formData = new FormData();
    formData.append('hostname', 'localhost');
    formData.append('username', 'jrice27');
    formData.append('password', 'rZk8FVrXNllcPl8Y');
    formData.append('database', 'CSC1034_CW_13');
    formData.append('query', query);

    try {
        let url = 'https://jrice27.webhosting1.eeecs.qub.ac.uk/dbConnector.php';
        let response = await fetch(url, { method: 'POST', body: formData });
        let result = await response.json();

        console.log("[Debug]: Game stats result", result); // Debugging line

        if (result.error) {
            console.error("[Error]:", result.error);
            return false;
        }

        if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            let saveData = result.data[0];

            // Convert the time_played from HH:MM:SS to seconds
            let startTime = saveData.time_played || "00:00:00"; // Default if undefined
            let [hours, minutes, seconds] = startTime.split(":").map(Number);

            if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
                startTime = "00:00:00";
                hours = 0;
                minutes = 0;
                seconds = 0;
            }

            lastSaveTime = hours * 3600 + minutes * 60 + seconds;
            gameStartTime = Date.now() / 1000 - lastSaveTime;

            noOfDeaths = saveData.deaths || 0;
            rooms_explored = saveData.rooms_explored || 0;
            location_name = saveData.location_name || "Cryogenic Chamber";

            handleRoomEntry(location_name);
            console.log(`Loaded save time: ${lastSaveTime} seconds`);

            // Fetch inventory items
            let inventoryFormData = new FormData();
            inventoryFormData.append('hostname', 'localhost');
            inventoryFormData.append('username', 'jrice27');
            inventoryFormData.append('password', 'rZk8FVrXNllcPl8Y');
            inventoryFormData.append('database', 'CSC1034_CW_13');
            inventoryFormData.append('query', inventoryQuery);

            let inventoryResponse = await fetch(url, { method: 'POST', body: inventoryFormData });
            let inventoryResult = await inventoryResponse.json();

            console.log("[Debug]: Inventory query result", inventoryResult); // Debugging line

            if (inventoryResult.data && Array.isArray(inventoryResult.data)) {
                inventoryResult.data.forEach(item => {
                    console.log(`[Debug]: Found item with ID ${item.item_id}`);
                    if (parseInt(item.item_id, 10) === 1) {
                        manageInventory("images/item_Wrench.png", "Wrench");
                        wrenchPickedUp = true;
                    } else if (parseInt(item.item_id, 10) === 2) {
                        manageInventory("images/item_Keycard.png", "Keycard");
                        keycardPickedUp = true;
                    } else if (parseInt(item.item_id, 10) === 3) {
                        manageInventory("images/item_Gun.png", "Gun");
                        gunPickedUp = true;
                    }
                });
            } else {
                console.log("[Debug]: No inventory data found for this player.");
            }

            return true;
        }

        console.log("[System]: No save data found.");
        return false;
    } catch (error) {
        console.error("[Error]: Unable to connect to the database.", error);
        return false;
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

async function clearInventory() {
    const inventorySlots = document.querySelectorAll(".inventory-slot");
    inventorySlots.forEach(slot => {
        slot.innerHTML = ""; // Remove all items from the inventory slots
    });

    const loggedInID = sessionStorage.getItem('loggedInID');
    if (!loggedInID) {
        console.error('Error: No player ID found in session.');
        return;
    }

    // Sanitize the logged-in player ID
    let sanitizedInput = loggedInID.replace(/'/g, "\\'");

    // Query to delete all items for the current player from the player_inventory table
    let deleteQuery = `DELETE FROM player_inventory WHERE player_id = '${sanitizedInput}'`;

    let formData = new FormData();
    formData.append('hostname', 'localhost');
    formData.append('username', 'jrice27');
    formData.append('password', 'rZk8FVrXNllcPl8Y');
    formData.append('database', 'CSC1034_CW_13');
    formData.append('query', deleteQuery);

    try {
        let url = 'https://jrice27.webhosting1.eeecs.qub.ac.uk/dbConnector.php';
        let response = await fetch(url, { method: 'POST', body: formData });
        let result = await response.json();

        if (result.error) {
            console.error("[Error]:", result.error);
        } else {
            console.log("[System]: Inventory cleared in database.");
        }
    } catch (error) {
        console.error("[Error]: Unable to connect to the database.", error);
    }

    console.log("[System]: Inventory cleared.");
}

function toggleBackgroundMusic() {
    const toggleButton = document.getElementById("toggle-music-button");

    if (backgroundMusic.muted) {
        backgroundMusic.muted = false; // Unmute the music
        console.log("[System]: Background music unmuted.");
        toggleButton.style.backgroundImage = "url('images/music_unmute.png')"; // Set unmute icon
        console.log("Background image set to: images/music_unmute.png");
    } else {
        backgroundMusic.muted = true; // Mute the music
        console.log("[System]: Background music muted.");
        toggleButton.style.backgroundImage = "url('images/music_mute.png')"; // Set mute icon
        console.log("Background image set to: images/music_mute.png");
    }
}

function toggleFontSize() {
    const body = document.body;
    const buttons = document.querySelectorAll("button"); // Select all buttons
    const roomPanel = document.querySelector(".room-panel"); // Select the room panel
    const consolePanel = document.querySelector(".console-panel"); // Select the console panel
    const currentFontSize = window.getComputedStyle(body).fontSize;

    if (currentFontSize === "16px") { // Assuming the original font size is 16px
        body.style.fontSize = "20px"; // Set to larger font size
        buttons.forEach(button => {
            button.style.fontSize = "18px"; // Increase button font size
        });
        roomPanel.style.fontSize = "16px"; // Increase room panel font size for larger mode
        consolePanel.style.fontSize = "16px"; // Increase console panel font size for larger mode
        console.log("[System]: Font size increased.");
    } else {
        body.style.fontSize = "16px"; // Reset to original font size
        buttons.forEach(button => {
            button.style.fontSize = "14px"; // Reset button font size
        });
        roomPanel.style.fontSize = "14px"; // Reset room panel font size to default
        consolePanel.style.fontSize = "14px"; // Reset console panel font size to default
        console.log("[System]: Font size reset to original.");
    }
}

// Add an event listener to the button
document.getElementById("toggle-font-size-button").addEventListener("click", toggleFontSize);

// Expose functions to global scope
window.fetchAndDisplayInventory = fetchAndDisplayInventory;
window.initializeGame = initializeGame;
window.changeImage = changeImage;
window.typeText = typeText;
window.updateAIImage = updateAIImage;
window.updateRoom = updateRoom;
window.handleRoomEntry = handleRoomEntry;
window.createButtons = createButtons;
// Set up event listeners for the buttons in the escape menu
document.getElementById('returnButton').addEventListener('click', toggleEscapeMenu);
document.getElementById('exitButton').addEventListener('click', exitGame);
document.getElementById("toggle-music-button").addEventListener("click", toggleBackgroundMusic);

document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("toggle-music-button");
    toggleButton.style.backgroundImage = "url('images/music_unmute.png')"; // Set the default background image
});

document.getElementById("settings-button").addEventListener("click", () => {
    const settingsPanel = document.getElementById("settings-panel");
    settingsPanel.classList.toggle("visible"); // Toggle the "visible" class
});

// Toggle the visibility of the settings panel
function toggleSettingsPanel() {
    const settingsPanel = document.getElementById("settingsPanel");
    if (settingsPanel.style.display === "none" || settingsPanel.style.display === "") {
        settingsPanel.style.display = "block"; // Show the panel
    } else {
        settingsPanel.style.display = "none"; // Hide the panel
    }
}

// Add event listener to the settings button
document.getElementById("settings-button").addEventListener("click", toggleSettingsPanel);

// Add event listeners for the buttons inside the settings panel
document.getElementById("toggle-music-button").addEventListener("click", toggleBackgroundMusic);
document.getElementById("toggle-font-size-button").addEventListener("click", toggleFontSize);

document.getElementById("settings-button").addEventListener("click", () => {
    const settingsPanel = document.getElementById("settings-panel");
    if (settingsPanel.style.display === "none" || settingsPanel.style.display === "") {
        settingsPanel.style.display = "block"; // Show the panel
    } else {
        settingsPanel.style.display = "none"; // Hide the panel
    }
});
