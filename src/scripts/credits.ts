import * as $ from "jquery"

$(document).ready(() => {
    // Toggle whether the credits is shown when the credits hyperlink is clicked.
    $("#credits-link").click(() => {
        // If the settings menu is hidden, show it.
        if ($("#credits-menu").css("display") == "none") {
            $("#credits-menu").show();
        } else {
            $("#credits-menu").hide();
        }
    });

    // Hide the settings menu when the X button is clicked.
    $("#credits-x").click(() => {
        $("#credits-menu").hide();
    });
});