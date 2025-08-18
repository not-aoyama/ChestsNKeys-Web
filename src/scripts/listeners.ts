/*
This file contains all of the event listeners that the Archipelago.js Client needs to function.
*/

import { ConnectedPacket, Item, MessageNode } from "archipelago.js";
import { client } from "./login.js";
import {
    setupMainGameContainer,
    setKeysEnabled,
    displayLocationChecked,
    ITEM_THAT_DOES_NOTHING_ID,
    ITEM_ID_PREFIX,
    LOCATION_ID_PREFIX,
    displayChestUnlocked
} from "./mainGame.js";
import { addToLog } from "./textClient.js";
import { displayIfWin } from "./win.js";

const connectedListener = (packet : ConnectedPacket) => {
    /*
    Find the total amount of chests in this slot.
    This is the total amount of locations (checked and missing) - 1, because the desk is the only non-chest location.
    */
    var numChests = packet.checked_locations.length + packet.missing_locations.length - 1;

    // Find and record in a global variable whether keys are enabled in the options YAML.
    if (packet.slot_data["keys_enabled"] == 0) {
        setKeysEnabled(false);
    } else {
        setKeysEnabled(true);
    }

    // Set up and display the main game container.
    setupMainGameContainer(numChests);
};

const disconnectedListener = () => {
    /*
    Someday, I'll change this code to try to reconnect every 10 seconds,
    but for now, I'll just send an alert because it's easier.
    */
    alert("You've been disconnected from the server! Reload the page and log in again in order to reconnect.");
};

const itemsReceivedListener = (items : Item[], index : number) => {
    for (let item of items) {
        /*
        If the item isn't an Item That Does Nothing, it's a key. Unlock its corresponding chest.
        That is, unless the chest is already empty. Then, leave it be.
        */
        if (item.id != ITEM_THAT_DOES_NOTHING_ID) {
            var chestNumber = item.id - ITEM_ID_PREFIX;
            if (!client.room.checkedLocations.includes(LOCATION_ID_PREFIX + chestNumber)) {
                displayChestUnlocked(chestNumber);
            }
        }
    }
};

const locationsCheckedListener = (locations : number[]) => {
    // Update the appearance of every location that has been checked.
    for (var i = 0; i < locations.length; i++) {
        displayLocationChecked(locations[i]);
    }

    // Check if all chests have been opened yet, and display the win message if so.
    displayIfWin();
};

const messageListener = (text : string, nodes : MessageNode[]) => {
    // IDK why the string parameter is necessary. All we need are the nodes.
    addToLog(nodes);
}

// Adds all listeners to the client.
export function setupClientListeners() {
    client.socket.on("connected", connectedListener);
    client.socket.on("disconnected", disconnectedListener);
    client.items.on("itemsReceived", itemsReceivedListener);
    client.room.on("locationsChecked", locationsCheckedListener);
    client.messages.on("message", messageListener);
}