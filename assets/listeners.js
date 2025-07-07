/*
This file contains all of the event listeners that the Archipelago.js Client needs to function.
*/
const connectedListener = (packet) => {
    // Debug print statement
    console.log(packet);

    // Show the main game now that we are connected!
    $("#main-game-container").show();
};