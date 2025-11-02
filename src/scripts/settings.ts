import * as $ from "jquery";

$(document).ready(() => {
    // Show the settings menu when the settings button is clicked.
    $("#settings-button").click(() => {
        $("#settings-menu").show();
    });

    // Hide the settings menu when the X button is clicked.
    $("#settings-x").click(() => {
        $("#settings-menu").hide();
    });
});