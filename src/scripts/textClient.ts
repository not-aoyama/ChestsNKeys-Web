import { ItemMessageNode, LocationMessageNode, MessageNode, PlayerMessageNode, TextualMessageNode } from "archipelago.js";
import * as $ from "jquery";
import { client } from "./login";

const SERVER_HELP_MSG : string = "Now that you are connected, you can use !help to list commands to run via the " +
    "server. If your client supports it, you may have additional local commands you can list with /help.";

/*
At first, the form to send a chat message and the checkbox to filter out irrelevant messages will exist as HTML, but
they will be non-functional.
This function adds event listeners to them to make them work!
*/
export function setupTextClient() : void {
    // Pressing the "Send Chat" button will send a chat message.
    $("#send-chat-submit").click(sendChat);

    // Clicking the "Only messages about me" checkbox will toggle whether irrelevant messages are shown.
    $("#only-relevant-messages").click(toggleShowOnlyRelevantMessages);

    // Pressing the Enter key while in the chat text box will send a chat message.
    $("#send-chat-input").keypress((event) => {
        // Check if Enter key was pressed (has code 13)
        if (event.which == 13) {
            sendChat();
        }
    });
}

export function addToLog(message : MessageNode[]) : void {
    // Debug console log statement
    console.log(message);

    // The entire message will be stored in a single li tag.
    var li = document.createElement("li");

    // Whether or not this message is relevant to the player.
    var isRelevant = false;

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

                /*
                The next few lines of code will check the text to see if this node is relevant.
                This takes time, so if we've already marked a previous node of this message as relevant,
                break out of the switch statement.
                */
                if (isRelevant)
                    break;

                // The message from the server about using !help and /help should be considered relevant.
                if (node.text == SERVER_HELP_MSG)
                    isRelevant = true;

                // If the text contains the player's name, the message is relevant.
                if (node.text.match(client.name))
                    isRelevant = true;

                break;
            case "entrance":
                spanClass = "entranceMessage";
                break;
            case "player":
                // The CSS classes will depend on whether the node represents this player or another player.
                spanClass = "playerMessage";
                if (client.name == node.player.name) {
                    spanClass += " thisPlayerMessage";

                    // Since this message has a node referring to this player, the entire message is relevant!
                    isRelevant = true;
                } else {
                    spanClass += " otherPlayerMessage";
                }

                // The hover text will show which game the player is playing.
                spanHoverText = "Game: " + node.player.game;

                break;
        }

        // Set the span's class and hover text.
        $(span).attr("class", spanClass);
        $(span).attr("title", spanHoverText);

        // Set the span's content to be this node's text.
        // This node might contain "\n", which should be rendered as a newline character but is not.
        // We will replace these with <br> tags.
        let linesOfText : string[] = node.text.split("\n");
        for (let i = 0; i < linesOfText.length; i++) {
            if (i > 0) {
                $(span).append(document.createElement("br"));
            }
            $(span).append(linesOfText[i]);
        }

        // Add the span to the li.
        $(li).append(span);
    }

    // If this message is not relevant to the player,
    // give the li the "irrelevant" class so it can be hidden if the user wants.
    if (!isRelevant) {
        $(li).attr("class", "irrelevant");

        // If the "only messages about me" checkbox is clicked,
        // make this message hidden.

        // This code checks if the checkbox is checked.
        var checkbox = document.getElementById("only-relevant-messages");
        if ((checkbox as HTMLInputElement).checked) {
            $(li).hide();
        }
    }

    // Before adding the message to the log, check to see if the log is scrolled to the bottom.
    var log = document.getElementById("log");
    var isScrolledToBottom : boolean = log.scrollHeight - log.clientHeight <= log.scrollTop + 1;
    
    // Add the message to the end of the log.
    $("#log").append(li);

    // If the log was scrolled all the way down before,
    // make the log automatically stay scrolled all the way down.
    if (isScrolledToBottom)
        log.scrollTop = log.scrollHeight - log.clientHeight;
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

function toggleShowOnlyRelevantMessages() : void {
    // This code checks if the checkbox is checked.
    var checkbox = document.getElementById("only-relevant-messages");
    if ((checkbox as HTMLInputElement).checked) {
        // If it is checked, hide all the log messages that are irrelevant.
        $(".irrelevant").hide();
    } else {
        // Otherwise, show the irrelevant log messages again.
        $(".irrelevant").css("display", "list-item");
    }
}