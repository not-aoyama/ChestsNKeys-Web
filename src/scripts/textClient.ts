import * as $ from "jquery";

export function addToLog(message : string) {
    var li = document.createElement("li");
    $(li).text(message);
    $("#log").append(li);
}