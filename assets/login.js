import {
    Client
} from "https://unpkg.com/archipelago.js/dist/archipelago.min.js";

var client;

$(document).ready(function () {
    /*
    Before displaying the login screen, fill the text fields with the credentials saved from last time.
    This way, the player doesn't have to repeatedly input the same credentials.
    */
    $("#host-port-input").val(localStorage.getItem("host-port"));
    $("#slot-name-input").val(localStorage.getItem("slot-name"));
    $("#password-input").val(localStorage.getItem("password"));

    // Connect to the server when the login button is clicked.
    $("#login-submit").click(function () {
        /*
        Hide the login button and display a loading symbol.
        This way, the player won't send multiple connection requests at a time.
        Also hide any previously shown error message to avoid confusion.
        */
        $("#login-submit").hide();
        $("#error-message").hide();
        $("#loader").show();

        var connectionInfo = {
            hostport: $("#host-port-input").val(),
            game: "Chests 'n' Keys",
            slot: $("#slot-name-input").val(),
            password: $("#password-input").val(),
            items_handling: 0b111
        };

        client = new Client();

        // Set up event listeners for the Client.
        client.socket.on("connected", connectedListener);
        client.socket.on("disconnected", disconnectedListener);

        client
            .login(
                connectionInfo.hostport,
                connectionInfo.slot,
                connectionInfo.game,
                {password: connectionInfo.password}
            )
            .then(() => {
                // Save the login credentials for later so the player doesn't have to enter them again next time.
                localStorage.setItem("host-port", connectionInfo.hostport);
                localStorage.setItem("slot-name", connectionInfo.slot);
                localStorage.setItem("password", connectionInfo.password);

                // Hide the login menu to make way for the actual game to be shown.
                // The actual game will be shown by the connectionListener.
                $("#login-container").hide();
            })
            .catch((error) => {
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
                $("#loader").hide();
                $("#error-message").show();
                $("#login-submit").show();
            });
    });

    // Now that the text fields and login button are ready, it's safe to display the login menu.
    $("#login-container").show();
});