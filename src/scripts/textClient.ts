import { ItemMessageNode, LocationMessageNode, MessageNode, PlayerMessageNode, TextualMessageNode } from "archipelago.js";
import * as $ from "jquery";
import { client } from "./login";

/*
At first, the form to send a chat message and the checkbox to filter out irrelevant messages will exist as HTML, but
they will be non-functional.
This function adds event listeners to them to make them work!
*/
export function setupTextClient() : void {
    // Pressing the "Send Chat" button will send a chat message.
    $("#send-chat-submit").click(sendChat);

    // Pressing the Enter key while in the chat text box will send a chat message.
    $("#send-chat-input").keypress((event) => {
        // Check if Enter key was pressed (has code 13)
        if (event.which == 13) {
            sendChat();
        }
    });
}

export function addToLog(message : MessageNode[]) : void {
    // The entire message will be stored in a single li tag.
    var li = document.createElement("li");

    // Add each of the message nodes to the li.
    for (let i = 0; i < message.length; i++) {
        /*
        For some reason, an enhanced for loop doesn't work.
        It assumes the elements of message are strings, not MessageNodes.
        */
        let node : MessageNode = message[i];

        // Each node represents a part of the message and will be stored in its own span tag.
        let span = document.createElement("span");

        // The hover text and CSS class(es) of the span will depend on what type the node is.
        let spanClass : string;
        let spanHoverText : string;
        switch (node.type) {
            case "item":
                // The hover text CSS classes will depend on what type of item this node represents.
                spanClass = "itemMessage";
                let itemClasses : string[] = [];
                if (node.item.progression) {
                    spanClass += " progressionItemMessage";
                    itemClasses.push("progression");
                }
                if (node.item.useful) {
                    spanClass += " usefulItemMessage";
                    itemClasses.push("useful");
                }
                if (node.item.trap) {
                    spanClass += " trapItemMessage";
                    itemClasses.push("trap");
                }

                // If no item classes were added so far, this item's only class is "filler".
                if (itemClasses.length == 0) {
                    itemClasses.push("filler");
                }
                
                // List all the item classes in the hover text.
                spanHoverText = "Item class: " + itemClasses[0];
                for (let i = 1; i < itemClasses.length; i++) {
                    // Add a comma for every item class other than the first one.
                    spanHoverText += ", " + itemClasses[i];
                }

                break;
            case "location":
                spanClass = "locationMessage";
                break;
            case "color":
                // Put the color in as the CSS class and let the stylesheet take care of it.
                spanClass = node.color;
                break;
            case "text":
                spanClass = "textualMessage";
                break;
            case "entrance":
                spanClass = "entranceMessage";
                break;
            case "player":
                // The CSS classes will depend on whether the node represents this player or another player.
                spanClass = "playerMessage";
                if (client.name == node.player.name) {
                    spanClass += " thisPlayerMessage";
                } else {
                    spanClass += " otherPlayerMessage";
                }

                // The hover text will show which game the player is playing.
                spanHoverText = "Game: " + node.player.game;

                break;
        }

        // Set the span's class, hover text, and content
        $(span).attr("class", spanClass);
        $(span).attr("title", spanHoverText);
        $(span).text(node.text);

        // Add the span to the li.
        $(li).append(span);
    }
    
    // Add the message to the end of the log.
    $("#log").append(li);
}

function sendChat() : void {
    // Get the text that's currently in the chat textbox.
    var textbox = $("#send-chat-input");
    var message : string = textbox.val();

    // Do nothing if the textbox is empty.
    if (message == "")
        return;

    // Make the textbox empty.
    textbox.val("");

    // Send the message to the server!
    client.messages.say(message);
}