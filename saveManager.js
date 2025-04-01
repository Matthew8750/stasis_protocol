import {
    gameStartTime,
    lastSaveTime,
    noOfDeaths,
    rooms_explored,
    location_name,
    labEventTriggered,
    wrenchPickedUp,
    keycardPickedUp,
    gunPickedUp,
    setLastSaveTime,
    setGameStartTime,
    setNoOfDeaths,
    setRoomsExplored,
    setLocationName,
    setLabEventTriggered,
    setWrenchPickedUp,
    setKeycardPickedUp,
    setGunPickedUp
} from './globals.js';

import { handleRoomEntry, manageInventory } from './game.js'; // Ensure this is imported

export async function clearInventory() {
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

export async function fetchAndDisplayInventory() {
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
export async function saveToDatabase(noOfDeaths, time_played, rooms_explored, location_name, labEventTriggered) {
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

export async function loadSave(playerID) {
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
        console.log("[Debug]: Sending game stats query to database:", query);

        let response = await fetch(url, { method: 'POST', body: formData });
        let result = await response.json();

        console.log("[Debug]: Game stats query result:", result);

        if (result.error) {
            console.error("[Error]:", result.error);
            return false;
        }

        if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            let saveData = result.data[0];
            console.log("[Debug]: Retrieved save data:", saveData);

            let startTime = saveData.time_played || "00:00:00";
            console.log("[Debug]: Retrieved time_played:", startTime);

            let [hours, minutes, seconds] = startTime.split(":").map(Number);

            if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
                console.warn("[Warning]: Invalid time_played format. Resetting to 00:00:00.");
                startTime = "00:00:00";
                hours = 0;
                minutes = 0;
                seconds = 0;
            }

            // Use setter functions to update global variables
            setLastSaveTime(hours * 3600 + minutes * 60 + seconds);
            console.log("[Debug]: Set lastSaveTime to:", hours * 3600 + minutes * 60 + seconds);

            setGameStartTime(Date.now() / 1000 - (hours * 3600 + minutes * 60 + seconds));
            console.log("[Debug]: Set gameStartTime to:", Date.now() / 1000 - (hours * 3600 + minutes * 60 + seconds));

            setNoOfDeaths(saveData.deaths || 0);
            console.log("[Debug]: Set noOfDeaths to:", saveData.deaths || 0);

            setRoomsExplored(saveData.rooms_explored || 0);
            console.log("[Debug]: Set rooms_explored to:", saveData.rooms_explored || 0);

            setLocationName(saveData.location_name || "Cryogenic Chamber");
            console.log("[Debug]: Set location_name to:", saveData.location_name || "Cryogenic Chamber");

            // Explicitly check for 0 or 1
            console.log("[Debug]: Raw labEventTriggered value and type:", saveData.labEventTriggered, typeof saveData.labEventTriggered);
            setLabEventTriggered(saveData.labEventTriggered === 1 || saveData.labEventTriggered === "1");
            console.log("[Debug]: Set labEventTriggered to:", saveData.labEventTriggered === 1 || saveData.labEventTriggered === "1");

            // Call handleRoomEntry to update the UI
            console.log("[Debug]: Calling handleRoomEntry with room:", saveData.location_name || "Cryogenic Chamber");
            handleRoomEntry(saveData.location_name || "Cryogenic Chamber");

            // Fetch and process inventory data
            let inventoryFormData = new FormData();
            inventoryFormData.append('hostname', 'localhost');
            inventoryFormData.append('username', 'jrice27');
            inventoryFormData.append('password', 'rZk8FVrXNllcPl8Y');
            inventoryFormData.append('database', 'CSC1034_CW_13');
            inventoryFormData.append('query', inventoryQuery);

            console.log("[Debug]: Sending inventory query to database:", inventoryQuery);

            let inventoryResponse = await fetch(url, { method: 'POST', body: inventoryFormData });
            let inventoryResult = await inventoryResponse.json();

            console.log("[Debug]: Inventory query result:", inventoryResult);

            if (inventoryResult.data && Array.isArray(inventoryResult.data)) {
                inventoryResult.data.forEach(item => {
                    console.log(`[Debug]: Found item with ID ${item.item_id}`);
                    if (parseInt(item.item_id, 10) === 1) {
                        manageInventory("images/item_Wrench.png", "Wrench");
                        setWrenchPickedUp(true); // Use setter
                        console.log("[Debug]: Wrench picked up.");
                    } else if (parseInt(item.item_id, 10) === 2) {
                        manageInventory("images/item_Keycard.png", "Keycard");
                        setKeycardPickedUp(true); // Use setter
                        console.log("[Debug]: Keycard picked up.");
                    } else if (parseInt(item.item_id, 10) === 3) {
                        manageInventory("images/item_Gun.png", "Gun");
                        setGunPickedUp(true); // Use setter
                        console.log("[Debug]: Gun picked up.");
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
