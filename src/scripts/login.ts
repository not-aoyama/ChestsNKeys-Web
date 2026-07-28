import $ from "jquery";
import { Client } from "archipelago.js";
import { setupClientListeners } from "./listeners.js";
import { displayIfWin } from "./win.js";

export var client: Client;

$(() => {
    /*
    Before displaying the login screen, fill the text fields with the credentials saved from last time.
    This way, the player doesn't have to repeatedly input the same credentials.
    */
    $("#host-port-input").val(localStorage.getItem("host-port") as string);
    $("#slot-name-input").val(localStorage.getItem("slot-name") as string);
    $("#password-input").val(localStorage.getItem("password") as string);

    // Connect to the server when the login button is clicked.
    $("#login-submit").on("click", () => {
        /*
        Hide the login button and display a loading symbol.
        This way, the player won't send multiple connection requests at a time.
        Also hide any previously shown error message to avoid confusion.
        */
        $("#login-submit").prop("disabled", true);
        $("#login-submit").hide();
        $("#error-message").text(""); // Empty out the error message so screen readers don't "see" it anymore.
        $("#error-message").hide();
        $("#login-loader").show();
        $("#login-loader-toast").text("Loading..."); // Notifies screen readers that the page is loading.

        var connectionInfo = {
            hostport: $("#host-port-input").val(),
            game: "Chests 'n' Keys",
            slot: $("#slot-name-input").val(),
            password: $("#password-input").val(),
            items_handling: 0b111
        };

        client = new Client();

        // Set up event listeners for the Client.
        setupClientListeners();

        client
            .login(
                connectionInfo.hostport as string,
                connectionInfo.slot as string,
                connectionInfo.game,
                {password: connectionInfo.password as string}
            )
            .then(() => {
                // Save the login credentials for later so the player doesn't have to enter them again next time.
                localStorage.setItem("host-port", connectionInfo.hostport as string);
                localStorage.setItem("slot-name", connectionInfo.slot as string);
                localStorage.setItem("password", connectionInfo.password as string);

                // Hide the login menu to make way for the actual game to be shown.
                // The actual game will be shown by the connectionListener.
                $("#login-loader-toast").text(""); // Make it so the screen reader will no longer say that the game is loading.
                $("#login-container").hide();

                // Notify screen reader users that login was successful.
                $("#login-success-toast").text("Login successful!");
                // This toast message should disappear after 5 seconds.
                setTimeout(() => {
                    $("#login-success-toast").text("");
                }, 5000);

                // Now that we've connected, we can check if we've already won and display the win message.
                displayIfWin();
            })
            .catch((error) => {
                /*
                The error message element must be shown before it has its text updated.
                Otherwise, screen readers won't notify about the change.
                */
                $("#error-message").show();

                // Display the correct error message.
                if (error.errors) {
                    const errorType = error.errors[0];
                    switch (errorType) {
                        case "InvalidSlot":
                            $("#error-message").text("Invalid slot name.");
                            break;
                        case "InvalidPassword":
                            $("#error-message").text("Incorrect password.");
                            break;
                        default:
                            $("#error-message").text("Failed to connect to slot. Reason: " + errorType);
                    }
                } else {
                    // If error.errors is undefined, it's probably because the host/port are incorrect.
                    $("#error-message").text("Failed to connect to server. Are your host URL and port correct?");
                }

                // Hide the loading symbol and show the login button so the user can try logging in again.
                $("#login-loader").hide();
                $("#login-loader-toast").text(""); // Empties out the screen reader notification. This way, if the page starts loading again, the user will be notified again.
                $("#login-submit").show();
                $("#login-submit").prop("disabled", false);
            });
    });

    // Now that the text fields and login button are ready, it's safe to display the login menu.
    $("#login-container").show();
});