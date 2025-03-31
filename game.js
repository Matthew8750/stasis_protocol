// ==========================
// 1. Global Variables and Constants
// ==========================
let typingTimeouts = [];
let typingInProgress = false;
let labEventTriggered = false;
let noOfDeaths = 0;
let time_played = 0;
let rooms_explored = 0;
let location_name = "Cryogenic Chamber";
let startTime = Date.now();
let wrenchPickedUp = false;
let gunPickedUp = false;
let keycardPickedUp = false;
let gameStartTime = Date.now() / 1000;
let lastSaveTime = 0;
let backgroundMusic = new Audio("Audio/StasisProtocolBgMusic.mp3");
backgroundMusic.loop = true;
let isMusicPlaying = true;

// ==========================
// 2. Utility Functions
// ==========================
function typeText(message, speed = 30) {
    const consolePanel = document.getElementById("console");

    function stopTyping() {
        typingInProgress = false;
        typingTimeouts.forEach(clearTimeout);
        typingTimeouts = [];
    }

    stopTyping();

    let textContainer = document.getElementById("text-container");
    if (!textContainer) {
        textContainer = document.createElement("div");
        textContainer.id = "text-container";
        consolePanel.insertBefore(textContainer, consolePanel.firstChild);
    }
    
    textContainer.innerHTML = "";
    typingInProgress = true;

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
            typingInProgress = false;
            consolePanel.scrollTop = consolePanel.scrollHeight;
        }
    }

    typeLine();
}

function changeImage(newSrc) {
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

// ==========================
// 3. Game Initialization
// ==========================
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
            return;
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

        console.log("[Debug]: Game stats result", result);

        if (result.error) {
            console.error("[Error]:", result.error);
            return false;
        }

        if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            let saveData = result.data[0];

            let startTime = saveData.time_played || "00:00:00";
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

            let inventoryFormData = new FormData();
            inventoryFormData.append('hostname', 'localhost');
            inventoryFormData.append('username', 'jrice27');
            inventoryFormData.append('password', 'rZk8FVrXNllcPl8Y');
            inventoryFormData.append('database', 'CSC1034_CW_13');
            inventoryFormData.append('query', inventoryQuery);

            let inventoryResponse = await fetch(url, { method: 'POST', body: inventoryFormData });
            let inventoryResult = await inventoryResponse.json();

            console.log("[Debug]: Inventory query result", inventoryResult);

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

// ==========================
// 4. Room Management
// ==========================
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
            description: "[N0VA]: The Escape Pod Bay. Some pods appear damaged. If you have the required tools, secure your exit.",
            interactions: {
                "Repair Escape Pods": { 
                    description: "[N0VA]: You use the wrench to repair the escape pods. The pods are now operational and ready for launch!",
                    newImage: "images/EscapePods_Repaired.jpg"
                }
            }
        }
    };

    if (!roomData[roomName]) {
        console.log(`[Error]: Room "${roomName}" not found.`);
        return;
    }

    if (roomName === "Lab" && !labEventTriggered) {
        labEventTriggered = true;
        labEvent();
        return;
    }

    playDoorOpenSound();

    function playDoorOpenSound() {
        let doorSound = new Audio('Audio/DoorOpen.mp3');
        doorSound.play();
    }

    if (Math.random() < 0.1) {
        playAlienRandomNoise();
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

function createButtons(roomInfo) {
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

    function createButton(label, onClick) {
        const button = document.createElement("button");
        button.textContent = label;
        button.addEventListener("click", onClick);
        styleButton(button);
        buttonContainer.appendChild(button);
        return button;
    }

    roomInfo.choices.forEach(choice => {
        createButton(choice, () => handleRoomEntry(choice));
    });

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
                const button = createButton(`Pickup ${name}`, () => {
                    console.log(`[Debug]: ${name} picked up!`);
                    document.querySelector(`.${item}-item-panel`).style.display = "none";
    
                    if (item === 'keycard') {
                        keycardPickedUp = true;
                    } else if (item === 'wrench') {
                        wrenchPickedUp = true;
                    } else if (item === 'gun') {
                        gunPickedUp = true;
                    }
    
                    console.log(`${item}PickedUp: ${eval(`${item}PickedUp`)}`);
    
                    manageInventory(`images/item_${name}.png`, name);
    
                    button.style.display = "none";
                });
            }
        }
    });
    
   let isRoomChanging = false;

if (roomInfo.interactions) {
    Object.entries(roomInfo.interactions).forEach(([key, interaction]) => {
        createButton(`${key.charAt(0).toUpperCase() + key.slice(1)}`, () => {
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
        });
    });
}

function handleRoomChange() {
    isRoomChanging = true;
}

function resetRoomChangeFlag() {
    isRoomChanging = false;
}

    consolePanel.appendChild(buttonContainer);
    consolePanel.scrollTop = consolePanel.scrollHeight;
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
        const button = document.createElement("button");
        button.textContent = choice;

        button.addEventListener("click", () => {
            clearTimeout(hideTimer);

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

        styleButton(button);

        buttonContainer.appendChild(button);
    });

    consolePanel.appendChild(buttonContainer);
    consolePanel.scrollTop = consolePanel.scrollHeight;
}

// ==========================
// 5. Inventory Management
// ==========================
function manageInventory(imageSrc, altText) {
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

async function clearInventory() {
    const inventorySlots = document.querySelectorAll(".inventory-slot");
    inventorySlots.forEach(slot => {
        slot.innerHTML = "";
    });

    const loggedInID = sessionStorage.getItem('loggedInID');
    if (!loggedInID) {
        console.error('Error: No player ID found in session.');
        return;
    }

    let sanitizedInput = loggedInID.replace(/'/g, "\\'");

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

async function fetchAndDisplayInventory() {
    console.log('Fetching inventory items from the database...');

    let hostname = 'localhost';
    let username = 'jrice27';
    let password = 'rZk8FVrXNllcPl8Y';
    let database = 'CSC1034_CW_13';

    let query = `SELECT item_name, item_image FROM player_inventory`;

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

        const inventoryContainer = document.querySelector('.inventory');
        inventoryContainer.innerHTML = '';

        result.data.forEach(item => {
            const slot = document.createElement('div');
            slot.classList.add('inventory-slot');

            const img = document.createElement('img');
            img.src = item.item_image;
            img.alt = item.item_name;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';

            slot.appendChild(img);

            inventoryContainer.appendChild(slot);
        });

        console.log(`[System]: Inventory updated with ${result.data.length} items.`);
    } catch (error) {
        console.error('Error:', error);
        console.log('[Error]: Unable to fetch inventory items. Please try again later.');
    }
}

// ==========================
// 6. Database Operations
// ==========================
async function saveToDatabase(noOfDeaths, time_played, rooms_explored, location_name, labEventTriggered) {
    console.log('Connecting to the database...');

    const loggedInID = sessionStorage.getItem('loggedInID');
    if (!loggedInID) {
        console.error('Error: No player ID found in session.');
        return;
    }

    let sanitizedInput = loggedInID.replace(/'/g, "\\'");
    let sanitizedLocation = location_name ? location_name.replace(/^Room:\s*/, '').replace(/'/g, "\\'") : "Unknown Location";

    let currentTime = Date.now() / 1000;
    let elapsedTime = currentTime - gameStartTime + lastSaveTime;
    let hours = Math.floor(elapsedTime / 3600).toString().padStart(2, '0');
    let minutes = Math.floor((elapsedTime % 3600) / 60).toString().padStart(2, '0');
    let seconds = (elapsedTime % 60).toString().padStart(2, '0');
    let formattedTime = `${hours}:${minutes}:${seconds}`;

    let labTriggeredValue = labEventTriggered ? 1 : 0;

    try {
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

        async function addItemIfNotExists(itemID) {
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

// ==========================
// 7. Event Listeners
// ==========================
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        toggleEscapeMenu();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("toggle-music-button");
    toggleButton.style.backgroundImage = "url('images/music_unmute.png')"; // Set the default background image
});

document.getElementById("settings-button").addEventListener("click", toggleSettingsPanel);
document.getElementById("toggle-music-button").addEventListener("click", toggleBackgroundMusic);
document.getElementById("toggle-font-size-button").addEventListener("click", toggleFontSize);

// ==========================
// 8. Expose Functions to Global Scope
// ==========================
window.fetchAndDisplayInventory = fetchAndDisplayInventory;
window.initializeGame = initializeGame;
window.changeImage = changeImage;
window.typeText = typeText;
window.updateAIImage = updateAIImage;
window.updateRoom = updateRoom;
window.handleRoomEntry = handleRoomEntry;
window.createButtons = createButtons;

function playerDeath() {
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
            noOfDeaths++;
            initializeGame(true);
        });

        styleButton(button);

        buttonContainer.appendChild(button);

        consolePanel.appendChild(buttonContainer);
    }, 2000);
}

function updateAIImage(newSrc) {
    document.getElementById("ai-companion").src = newSrc;
}

function updateRoom(roomName) {
    document.getElementById("room-display").textContent = "Room: " + roomName;
}

function returnToGame() {
    toggleEscapeMenu();
    window.location.href = "sp_play.html";
}

function exitGame() 
{
    location_name = document.getElementById("room-display").textContent
    saveToDatabase(noOfDeaths, getTimePlayed(), rooms_explored, location_name, labEventTriggered);
}

function getTimePlayed() {
    let elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    return elapsedTime;
}

document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        toggleEscapeMenu();
    }
});

function toggleEscapeMenu() {
    const menu = document.getElementById('escapeMenu');
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
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

function toggleSettingsPanel() {
    const settingsPanel = document.getElementById("settingsPanel");
    if (settingsPanel.style.display === "none" || settingsPanel.style.display === "") {
        settingsPanel.style.display = "block";
    } else {
        settingsPanel.style.display = "none";
    }
}

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
