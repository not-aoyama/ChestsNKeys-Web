import { ItemMessageNode, LocationMessageNode, MessageNode, PlayerMessageNode, TextualMessageNode } from "archipelago.js";
import * as $ from "jquery";
import { client } from "./login";

export function addToLog(message : MessageNode[]) {
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

        // The CSS class(es) of the span will depend on what type the node is.
        let spanClass : string = "";
        switch (node.type) {
            case "item":
                // The CSS classes will depend on what type of item this node represents.
                spanClass = "itemMessage";
                if (node.item.progression) {
                    spanClass += " progressionItemMessage";
                }
                if (node.item.useful) {
                    spanClass += " usefulItemMessage";
                }
                if (node.item.trap) {
                    spanClass += " trapItemMessage";
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
                break;
        }

        // Set the span's class and content
        $(span).attr("class", spanClass);
        $(span).text(node.text);

        // Add the span to the li.
        $(li).append(span);
    }
    
    // Add the message to the end of the log.
    $("#log").append(li);
}