"use strict";
var selected = "";
var toDoObjects = null;
var toDos = null;


function updateData(result) {
    console.log(result);

    //toDoObjects.push(newToDo);
    toDoObjects = result;

    // update toDos
    toDos = toDoObjects.map(function (toDo) {
        return toDo.description;
    });
}

var main = function (results) {
    toDoObjects = results;

    console.log("SANITY CHECK");
    toDos = toDoObjects.map(function (toDo) {
        // we'll just return the description
        // of this toDoObject
        return toDo.description;
    });


    $(".tabs a span").toArray().forEach(function (element) {
        var $element = $(element);

        // create a click handler for this element
        $element.on("click", function () {
            var $content,
                $input,
                $button,
                i;

            $(".tabs a span").removeClass("active");
            $element.addClass("active");
            $("main .content").empty();

            if ($element.parent().is(":nth-child(1)")) {
                $content = $("<ul>");
                for (i = toDos.length - 1; i >= 0; i--) {
                    $content.append($("<li>").text(toDos[i]));
                }
                selected = "nth-child(1)";
            } else if ($element.parent().is(":nth-child(2)")) {
                $content = $("<ul>");
                toDos.forEach(function (todo) {
                    $content.append($("<li>").text(todo));
                });
                selected = "nth-child(2)";
            } else if ($element.parent().is(":nth-child(3)")) {
                var tags = [];

                toDoObjects.forEach(function (toDo) {
                    toDo.tags.forEach(function (tag) {
                        if (tags.indexOf(tag) === -1) {
                            tags.push(tag);
                        }
                    });
                });
                console.log(tags);

                var tagObjects = tags.map(function (tag) {
                    var toDosWithTag = [];

                    toDoObjects.forEach(function (toDo) {
                        if (toDo.tags.indexOf(tag) !== -1) {
                            toDosWithTag.push(toDo.description);
                        }
                    });

                    return {"name": tag, "toDos": toDosWithTag};
                });

                console.log(tagObjects);

                tagObjects.forEach(function (tag) {
                    var $tagName = $("<h3>").text(tag.name),
                        $content = $("<ul>");


                    tag.toDos.forEach(function (description) {
                        var $li = $("<li>").text(description);
                        $content.append($li);
                    });

                    $tagName.hide();
                    $content.hide();
                    $("main .content").append($tagName);
                    $("main .content").append($content);
                    $tagName.slideDown();
                    $content.slideDown();
                });
                selected = "nth-child(3)";

            } else if ($element.parent().is(":nth-child(4)")) {
                $input = $("<input>").addClass("description");
                var $inputLabel = $("<p>").text("Description: "),
                    $tagInput = $("<input>").addClass("tags"),
                    $tagLabel = $("<p>").text("Tags: ");
                $button = $("<span>").text("+");

                $button.on("click", function () {
                    var description = $input.val(),
                        tags = $tagInput.val().split(","),
                        newToDo = {"description": description, "tags": tags};

                    $.post("todos", newToDo, function (result) {
                        updateData(result);
                        $input.val("");
                        $tagInput.val("");
                    });
                });

                $content = $("<div>").append($inputLabel)
                    .append($input)
                    .append($tagLabel)
                    .append($tagInput)
                    .append($button);
                selected = "nth-child(4)";
            }

            if ($content !== null && $content !== undefined) {
                $content.hide();
                $("main .content").append($content);
                $content.slideDown();
            }

            return false;
        });
    });

    $(".tabs a:first-child span").trigger("click");
};

$(document).ready(function () {
    $.getJSON("todos.json", function (toDoObjects) {
        main(toDoObjects);
    });

    var socket = io("http://localhost:3000");
    socket.on("newData", function (newData) {
        updateData(newData);
        if (selected !== "nth-child(4)") {
            $(".tabs a:" + selected + " span").trigger("click");
        }
    });
});
