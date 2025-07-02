$(document).ready(function () {
    $("#login-submit").click(function () {
        connectionInfo = {
            hostport: $("#host-port-input").val(),
            game: "Chests 'n' Keys",
            name: $("#slot-name-input").val(),
            password: $("#password-input").val(),
            items_handling: 0b111
        };

        console.log(connectionInfo);
    });
});