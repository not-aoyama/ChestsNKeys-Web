var keysEnabled;

// Display the main game screen, complete with a desk and the given number of chests.
function setupMainGameContainer(numChests) {
    // Create and display the ul tag representing the desk.
    var desk = document.createElement("ul");
    $(desk).attr("id", "desk");
    $(desk).text("The Desk");
    $("#locations-list").append(desk);

    // Create and display a ul tag representing each of the chests.
    for (var i = 1; i <= numChests; i++) {
        var chest = document.createElement("ul");
        $(chest).attr("id", "chest" + i);
        $(chest).text("Chest " + i);
        $("#locations-list").append(chest);
    }

    // Show the main game container now that it is ready!
    $("#main-game-container").show();
}