/*
This file contains all of the event listeners that the Archipelago.js Client needs to function.
*/
const connectedListener = (packet) => {
    /*
    Find the total amount of chests in this slot.
    This is the total amount of locations (checked and missing) - 1, because the desk is the only non-chest location.
    */
    var numChests = packet.checked_locations.length + packet.missing_locations.length - 1;

    // Find and record in a global variable whether keys are enabled in the options YAML.
    if (packet.slot_data.keys_enabled == 0) {
        keysEnabled = false;
    } else {
        keysEnabled = true;
    }

    // Set up and display the main game container.
    setupMainGameContainer(numChests);
};