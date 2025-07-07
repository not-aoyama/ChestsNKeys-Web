/*
This file contains all of the event listeners that the Archipelago.js Client needs to function.
*/
const connectedListener = (packet) => {
    // Debug print statement
    console.log(packet);

    /*
    Find the total amount of chests in this slot.
    This is the total amount of locations (checked and missing) - 1, because the desk is the only non-chest location.
    */
   var numChests = packet.checked_locations.length + packet.missing_locations.length - 1;

   // Set up and display the main game container.
   setupMainGameContainer(numChests);
};