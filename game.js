let typingTimeouts = []; // Store all active timeouts
let typingInProgress = false; // Track ongoing typing
let labEventTriggered = false;
let keycardPickedUp = false; // Global flag to track if the keycard has been picked up
let noOfDeaths = 0;
let time_played = 0;
let rooms_explored = 0;
let location_name = "Cryogenic Chamber";
let startTime = Date.now();  // Store the timestamp when the game starts
let wrenchPickedUp = false; // Global flag to track if the wrench has been picked up
let gunPickedUp = false; // Global flag to track if the gun has been picked up

async function initializeGame(restartGame = false) {
    console.log("[System]: Initializing game...");

    let backgroundMusic = new Audio("Audio/StasisProtocolBgMusic.mp3");
    backgroundMusic.loop = true;

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

    typeText(
        "[System]: Game initialized...\n" +
        "You wake up in a cryo-chamber, cold and disoriented. The chamber doors open, revealing the dim, damaged interior of the ship. Something's wrong - systems are failing and the ship is eerily quiet.\n" +
        "Stasis disengaged. System diagnostics: compromised.\n" +
        "A mechanical voice cuts through the silence.\n" +
        "[N0VA]: Welcome back, Operator. I'm your AI companion 'N0VA'. The ship is in critical condition. We need to exit the cryo-chamber and assess the situation."
    );

    labEventTriggered = false;
    keycardPickedUp = false;
    clearInventory();

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
            choices: ["Hallway One", "Cafeteria", "Hallway Two"]
        },
        "Admin": {
            image: "images/room_Admin.jpg",
            choices: ["Cafeteria"]
        },
        "Cafeteria": {
            image: "images/room_Cafeteria.jpg",
            choices: ["Lab", "Admin"]
        },
        "Hallway Two": {
            image: "images/room_Hallway.jpg",
            choices: ["Lab", "Engine Left", "Engine Right", "Hallway Final"]
        },
        "Engine Left": {
            image: "images/room_Engine1.jpg",
            choices: ["Hallway Two"],
            wrench: true // Add a flag to indicate the wrench should be displayed
        },
        "Engine Right": {
            image: "images/room_Engine2.jpg",
            choices: ["Hallway Two"]
        },
        "Hallway Final": {
            image: "images/room_Hallway.jpg",
            choices: ["Hallway Twps", "Armory", "Escape Pods"]
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
    // Check if the Armory is locked
    if (roomName === "Armory" && !isItemInInventory("Keycard")) {
        typeText("[System]: The Armory is locked. You need the keycard to enter.");
        console.log("[Debug]: Access to the Armory denied. Keycard not found in inventory.");
        return; // Prevent access to the Armory
    }

    // Check if the Escape Pods require the wrench
    if (roomName === "Escape Pods" && !isItemInInventory("Wrench")) {
        typeText("[N0VA]: The escape pods are damaged. You need the wrench to repair them and escape.");
        console.log("[Debug]: Access to escape pods denied. Wrench not found in inventory.");
        return; // Prevent escape without the wrench
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
    rooms_explored++;
    
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
    }, 7000); // 7 seconds

    choices.forEach(choice => {
        const button = document.createElement("button");
        button.textContent = choice;

        // Assign specific behavior based on choice
        button.addEventListener("click", () => {
            console.log(`[DEBUG] Player selected: ${choice}`); // Debugging log
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

//Database Functions Below
async function saveToDatabase(noOfDeaths, time_played, rooms_explored, location_name, labEventTriggered) {
    console.log('Connecting to the database...');

    const loggedInID = sessionStorage.getItem('loggedInID');
    if (!loggedInID) {
        console.error('Error: No player ID found in session.');
        return;
    }

    let sanitizedInput = loggedInID.replace(/'/g, "\\'");
    let sanitizedLocation = location_name.replace(/^Room:\s*/, '').replace(/'/g, "\\'");

    // Calculate time played since the last save
    let currentTime = Date.now() / 1000; // Get the current time in seconds
    let elapsedTime = currentTime - gameStartTime + lastSaveTime;

    // Convert the elapsed time to HH:MM:SS format
    let hours = Math.floor(elapsedTime / 3600).toString().padStart(2, '0');
    let minutes = Math.floor((elapsedTime % 3600) / 60).toString().padStart(2, '0');
    let seconds = (elapsedTime % 60).toString().padStart(2, '0');
    let formattedTime = `${hours}:${minutes}:${seconds}`;

    // Ensure labEventTriggered is always 0 or 1
    let labTriggeredValue = labEventTriggered ? 1 : 0; // Convert true → 1, false → 0

    // Check if a save already exists for this player
    let checkQuery = `SELECT COUNT(*) AS saveExists FROM game_stats WHERE player_id = '${sanitizedInput}'`;

    let checkData = new FormData();
    checkData.append('hostname', 'localhost');
    checkData.append('username', 'jrice27');
    checkData.append('password', 'rZk8FVrXNllcPl8Y');
    checkData.append('database', 'CSC1034_CW_13');
    checkData.append('query', checkQuery);

    try {
        let checkResponse = await fetch('https://jrice27.webhosting1.eeecs.qub.ac.uk/dbConnector.php', {
            method: 'POST',
            body: checkData
        });

        let checkResult = await checkResponse.json();
        let saveExists = checkResult.data && checkResult.data[0].saveExists > 0;

        // If a save exists, update it; otherwise, insert a new one
        let query;
        if (saveExists) {
            query = `UPDATE game_stats 
                     SET deaths = ${noOfDeaths}, time_played = '${formattedTime}', 
                     rooms_explored = ${rooms_explored}, location_name = '${sanitizedLocation}', 
                     labEventTriggered = ${labTriggeredValue} 
                     WHERE player_id = '${sanitizedInput}'`;
        } else {
            query = `INSERT INTO game_stats (player_id, deaths, time_played, rooms_explored, location_name, labEventTriggered) 
                     VALUES ('${sanitizedInput}', ${noOfDeaths}, '${formattedTime}', ${rooms_explored}, '${sanitizedLocation}', ${labTriggeredValue})`;
        }

        let formData = new FormData();
        formData.append('hostname', 'localhost');
        formData.append('username', 'jrice27');
        formData.append('password', 'rZk8FVrXNllcPl8Y');
        formData.append('database', 'CSC1034_CW_13');
        formData.append('query', query);

        let response = await fetch('https://jrice27.webhosting1.eeecs.qub.ac.uk/dbConnector.php', {
            method: 'POST',
            body: formData
        });

        let result = await response.json();
        let resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';

        if (result.error) {
            console.log(result.error.toString());
            resultsDiv.innerHTML = `<p style="color:red;">${result.error}</p>`;
        } else {
            resultsDiv.innerHTML = `<p>${result.success ? 'Save updated successfully' : 'New save created successfully'}</p>`;
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

async function loadSave(playerID) {
    console.log("[System]: Checking for saved game...");

    let query = `SELECT deaths, time_played, rooms_explored, location_name, labEventTriggered FROM game_stats WHERE player_ID = '${playerID}'`;

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

        if (result.error) {
            console.error("[Error]:", result.error);
            return false; // Error occurred, no save loaded
        }

        if (result.data && result.data.length > 0) {
            // Load save data
            let saveData = result.data[0];

            // Convert the time_played from HH:MM:SS to seconds
            let startTime = saveData.time_played || "00:00:00"; // Default if undefined
            let [hours, minutes, seconds] = startTime.split(":").map(Number);

            // If time is not valid, set it to the default
            if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
                startTime = "00:00:00"; // Set to default if invalid
                hours = 0;
                minutes = 0;
                seconds = 0;
            }

            // Convert startTime to seconds
            lastSaveTime = hours * 3600 + minutes * 60 + seconds;
            gameStartTime = Date.now() / 1000; // Set the current time in seconds

            noOfDeaths = saveData.deaths || 0;
            rooms_explored = saveData.rooms_explored || 0;
            location_name = saveData.location_name || "Cryogenic Chamber"; // Default room
            labEventTriggered = saveData.labEventTriggered || false;

            // Load the saved room
            handleRoomEntry(location_name);

            console.log(`Loaded save time: ${lastSaveTime} seconds`);
            return true; // Save successfully loaded
        }

        console.log("[System]: No save data found.");
        return false; // No save found
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

function clearInventory() {
    const inventorySlots = document.querySelectorAll(".inventory-slot");
    inventorySlots.forEach(slot => {
        slot.innerHTML = ""; // Remove all items from the inventory slots
    });
    console.log("[System]: Inventory cleared.");
}

function updateAIImage(newSrc) {
    document.getElementById("ai-companion").src = newSrc;
}

function updateRoom(roomName) {
    document.getElementById("room-display").textContent = "Room: " + roomName;
}
// Function to show the escape menu
function showEscapeMenu() {
    document.getElementById('escapeMenu').style.display = 'block'; // Set to block to show the menu
}

// Function to hide the escape menu
function hideEscapeMenu() {
    document.getElementById('escapeMenu').style.display = 'none'; // Hide the menu
}

// Function to return to the game (reload the game page)
function returnToGame() {
    hideEscapeMenu(); // Close the escape menu
    window.location.href = "sp_play.html";  // Redirects to the game page
}

// Function to exit the game (or close the window)
function exitGame() 
{
    location_name = document.getElementById("room-display").textContent
    saveToDatabase(noOfDeaths, getTimePlayed(), rooms_explored, location_name, labEventTriggered);
    //window.location.href = 'sp_play.html'; // Redirect to previous screen
}

// Function to get the total time played in seconds
function getTimePlayed() {
    let elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Convert ms to seconds
    return elapsedTime;
}

// Event listener for the Escape key to open the menu
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        const escapeMenu = document.getElementById('escapeMenu');
        // Toggle escape menu visibility on Escape key press
        if (escapeMenu.style.display === 'none' || escapeMenu.style.display === '') {
            showEscapeMenu();  // Show the escape menu
        } else {
            hideEscapeMenu();  // Hide the escape menu if it's already visible
        }
    }
});

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

function isItemInInventory(itemAltText) {
    const inventorySlots = document.querySelectorAll(".inventory-slot");
    for (let slot of inventorySlots) {
        if (slot.children.length > 0 && slot.children[0].alt === itemAltText) {
            return true; // Item is found in the inventory
        }
    }
    return false; // Item is not in the inventory
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
// Set up event listeners for the buttons in the escape menu
document.getElementById('returnButton').addEventListener('click', hideEscapeMenu);
document.getElementById('exitButton').addEventListener('click', exitGame);
