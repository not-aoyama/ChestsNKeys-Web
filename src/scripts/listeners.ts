/*
This file contains all of the event listeners that the Archipelago.js Client needs to function.
*/

import { ConnectedPacket, Item, JSONRecord, MessageNode } from "archipelago.js";
import { client } from "./login.js";
import {
    displayChestUnlocked,
    displayItemSent,
    displayLocationChecked,
    hasLoaded,
    ITEM_THAT_DOES_NOTHING_ID,
    ITEM_ID_PREFIX,
    LOCATION_ID_PREFIX,
    setupDisconnectButton,
    setupMainGameContainer,
    setNumberChests,
    setNumberLockedChests,
    setNumberRequiredChests,
    setupReconnectButton,
    updateGoalMessage,
    updateIcon
} from "./mainGame.js";
import { addToLog, addPlainTextToLog, setupTextClient } from "./textClient.js";
import { displayIfWin } from "./win.js";

const connectedListener = (packet : ConnectedPacket) => {
    // If the game hasn't already been set up, set everything up.
    if (!hasLoaded()) {
        /*
        Find the total amount of chests in this slot.
        This is the total amount of locations (checked and missing) - 1, because the desk is the only non-chest location.
        */
        setNumberChests(packet.checked_locations.length + packet.missing_locations.length);

        // Find and record in a global variable the number of locked chests and required chests, as specified in the options YAML.
        var slotData : JSONRecord = packet.slot_data as JSONRecord;
        setNumberLockedChests(slotData["number_of_locked_chests"] as number);
        setNumberRequiredChests(slotData["number_of_required_chests"] as number);

        // Set up and display the main game container.
        setupMainGameContainer();

        // Set up the text client/log.
        setupTextClient();
    }

    /*
    Regardless of whether the game has already been set up or not,
    set up the "Disconnect" button so the user can leave the server without having to reload or exit the page.
    */
    setupDisconnectButton();
};

const disconnectedListener = () => {
    // Add a "you've been disconnected" message to the chat log.
    addPlainTextToLog("Disconnected from the server.");

    alert("You've been disconnected from the server! Click the \"Reconnect\" button at the top of the page to reconnect.");

    // Turn the "Disconnect" button into the "Reconnect" button, so the user can join the server again.
    setupReconnectButton();
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

            // Now that a new chest might be openable, update the website icon.
            updateIcon();
        }
    }
};

const locationsCheckedListener = (locations : number[]) => {
    /*
    Update the appearance of every location that has been checked.
    Also, display the item sent from each newly checked location.
    */
    for (var i = 0; i < locations.length; i++) {
        displayLocationChecked(locations[i]);
        displayItemSent(locations[i]);
    }

    // Now that there may no longer be any openable chests, update the website icon.
    updateIcon();

    // Update the message at the top of the screen that shows how many chests have been opened.
    updateGoalMessage();

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