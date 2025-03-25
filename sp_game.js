function initializeGame() {
    logToConsole("[System]: Game initialized...");
    changeImage("images/ArmoryImage.jpg");
}

function changeImage(newSrc) {
    document.getElementById("display-image").src = newSrc;
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
