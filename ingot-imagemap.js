var CSVResults;
$(document).ready(function () {
    $('.ingot-box.mapster_tooltip').removeAttr('style');
    $('.close').click(function () {
        $('.mapster_tooltip').css('display', 'none');
    })
});

function _main() {

    //TODO parse dependant on file format & details

    //get sheet object as JSON object or array


    var sheet = CSVResults.data;


    isPortrait = window.matchMedia("only screen and (max-width: 1024px)").matches;
    isLandscape = !isPortrait;

    var portraitContainer = {
        mapKey: 'name',
        listKey: 'name',
        scaleMap: true,
        staticState: true,
        stroke: true,
        fillOpacity: 0.2,
        strokeOpacity: 1.0,
        strokeWidth: 1,
        showToolTip: true,
        toolTipClose: ["area-click"],
        isSelected: true,
        render_highlight: {
            fillOpacity: 0.5,
            stroke: true,
            strokeOpacity: 1.0,
            strokeWidth: 2
        },
        areas: [],
        toolTipContainer: '<div class="ingot-box"></div>',
    };

    var landscapeContainer = {
        mapKey: 'name',
        // listKey: 'name',
        scaleMap: true,
        staticState: true,
        stroke: true,
        fillOpacity: 0.2,
        strokeOpacity: 1.0,
        strokeWidth: 2,
        wrapClass: 'imageMapster_wrapper',
        showToolTip: false, // hide popup
        // toolTip: 'Test',
        toolTipClose: ["tooltip-click"],
        isSelected: false,
        onClick: function () {
            $(this).mapster('tooltip');
            $('.ingot-box.mapster_tooltip').removeAttr('style');
        },
        render_highlight: {
            fillOpacity: 0.5,
            stroke: true,
            strokeOpacity: 1.0,
            strokeWidth: 3
        },
        areas: [],
        toolTipContainer: '<div class="ingot-box"></div>'
    };

    var overviewContainer = {
        onClick: function () {
            window.location = this.href;
            return false;
        },
        mapKey: 'name',
        listKey: 'name',
        scaleMap: true,
        staticState: true,
        stroke: true,
        fillOpacity: 0.2,
        strokeOpacity: 1.0,
        strokeWidth: 2,
        showToolTip: false,
        toolTipClose: ["area-click"],
        render_highlight: {
            fillOpacity: 0.5,
            stroke: true,
            strokeOpacity: 1.0,
            strokeWidth: 2,
        },
        areas: [
            {
                name: 'stage-16',
                title: 'Stage 16',
                key: 'stage-16',
                fillColor: "15371C",
                fillOpacity: 0,
                strokeOpacity: 0,
                strokeColor: "8c7503",
                render_highlight: {
                    fillColor: "15371C",
                    strokeColor: "8c7503",
                },
                isSelectable: true,
            },
            {
                name: 'stage-17',
                title: 'Stage 17',
                fillColor: "15371C",
                fillOpacity: 0,
                strokeOpacity: 0,
                strokeColor: "8c7503",
                key: 'stage-17',
                render_highlight: {
                    fillColor: "15371C",
                    strokeColor: "8c7503",
                },
                isSelectable: true,
            },
            {
                name: 'stage-18',
                title: 'Stage 18',
                fillColor: "15371C",
                fillOpacity: 0,
                strokeOpacity: 0,
                strokeColor: "8c7503",
                key: 'stage-18',
                render_highlight: {
                    fillColor: "15371C",
                    strokeColor: "8c7503",
                },
                isSelectable: false,
            },
            {
                name: 'stage-18A',
                title: 'Stage 18A',
                fillColor: "15371C",
                fillOpacity: 0,
                strokeOpacity: 0,
                strokeColor: "8c7503",
                key: 'stage-18A',
                render_highlight: {
                    fillColor: "15371C",
                    strokeColor: "8c7503",
                },
                isSelectable: false,
            },
            {
                name: 'stage-19',
                title: 'Stage 19',
                fillColor: "15371C",
                fillOpacity: 0,
                strokeOpacity: 0,
                strokeColor: "8c7503",
                key: 'stage-19',
                render_highlight: {
                    fillColor: "15371C",
                    strokeColor: "8c7503",
                },
                isSelectable: true,
            },
            {
                name: 'stage-20',
                title: 'Stage 20',
                fillColor: "15371C",
                fillOpacity: 0,
                strokeOpacity: 0,
                strokeColor: "8c7503",
                key: 'stage-20',
                render_highlight: {
                    fillColor: "15371C",
                    strokeColor: "8c7503",
                },
                isSelectable: true,
            },
            {
                name: 'stage-25A',
                title: 'Stage 25A',
                fillColor: "15371C",
                fillOpacity: 0,
                strokeOpacity: 0,
                strokeColor: "8c7503",
                key: 'stage-25A',
                render_highlight: {
                    fillColor: "15371C",
                    strokeColor: "8c7503",
                },
                isSelectable: true,
            }
        ],
        toolTipContainer: '<div class="ingot-box"></div>',
    }

    //for each row in the sheet;
    sheet.forEach((row, index, array) => {


        row.title = "Lot " + row.Lot + '<span class="close">&#10005;</span>';
        row.blurb = "<p><strong>Status:</strong> " + row.Status + "</p>"
            + "<p><strong>Price:</strong> " + row.Price + "</p>"
            + "<p><strong>Area: </strong>" + row['Area (m2)'] + " mÂ²" + "</p>"
            + "<p><strong> Length: </strong>" + row.Length + ", Width: " + row.Width + "</p>"
            + "<p><strong>Builder:</strong> " + row.Purchaser + "</p>"
            + "<p><strong>Title Status:</strong> " + row.Expected + "</p>"
            + "<h2 style='color:black; font-size:30px; margin-bottom:10px;'>Contact:</h2>"
            + "<p><strong>Email: </strong><a href='mailto:info@greenhillpark.co.nz'>info@greenhillpark.co.nz</a></p>"
            + "<p><strong>Phone: </strong><a href='tel:0800639929'>0800 639 929</a></p>"
            ;

        switch (row.Status) {
            case "Available":
                row.fillColor = "1B9728";
                row.strokeColour = "404040";
                row.isSelectable = true;
                break;
            case "Unavailable":
            case "Sold":
                row.fillColor = "DE0000";
                row.fillOpacity = 1;
                row.strokeColour = "404040";
                row.isSelectable = false;
                row.isDeselectable = true;

                break;
            default:
                row.fillColor = "404040";
                row.strokeColour = "404040";
                row.isSelectable = true;
        }

        // dynamic more details link 
        if (row.Status == 'Sold' || row.Status == 'Enquire With Builder') {
            $(this).on(function () {
                return false;
            });
            var buttonLink = '<a href="https://www.greenhillpark.co.nz/building-partners/">More Details</a>';
        }
        else {
            var buttonLink = '<a href="https://www.greenhillpark.co.nz/contact/">Contact Us</a>';
        }

        var area = {
            key: "lot-" + row.Lot,
            fillColor: row.fillColor,
            strokeColor: row.strokeColour,

            render_highlight: {
                fillColor: row.fillColor,
                strokeColor: row.strokeColour
            },
            isSelectable: row.isSelectable,

            toolTip:
                '<div class="container"><h3 class="ingot-title">' + row.title + '</h3>' +
                '<p>' + row.blurb + '</p>' +
                '<div class="ingot-button">' + buttonLink + '</div></div>',
        };

        portraitContainer.areas.push(area);

        landscapeContainer.areas.push(area);

    });


    // if (isPortrait) {
    //     $.mapster.utils.areaCorners = newAreaCorners;
    // } else {
    //     $.mapster.utils.areaCorners = origAreaCorners;
    // }
    $.mapster.utils.areaCorners = newAreaCorners;

    // if (isPortrait) {
    //     $('.map-portrait-overview').mapster(overviewContainer);
    //     $('.map-portrait-stage-16').mapster(portraitContainer);
    //     $('.map-portrait-stage-17').mapster(portraitContainer);
    // } else {
    $('.map-landscape-overview').mapster(overviewContainer);
    $('.map-landscape-stage-16').mapster(landscapeContainer);
    $('.map-landscape-stage-17').mapster(landscapeContainer);
    //$('#stage-18').mapster(landscapeContainer);
    $('.map-landscape-stage-18').mapster(landscapeContainer);
    $('.map-landscape-stage-18A').mapster(landscapeContainer);
    $('.map-landscape-stage-19').mapster(landscapeContainer);
    $('.map-landscape-stage-20').mapster(landscapeContainer);
    $('.map-landscape-stage-25A').mapster(landscapeContainer);


    // }
}

$('.close').on(function () {
    $('.ingot-box').css('display', 'none');
});

function parseCSV(_next) {

    Papa.parse("/HTML_Image_map_for_Greenhill_Park_-_Sheet1.csv",
        {
            download: true,
            header: true,

            complete: function (results) {
                CSVResults = results;
                console.log(results);
                _next();
            },
        });
}

var origAreaCorners = $.mapster.utils.areaCorners;

var newAreaCorners = function (elements, image, container, width, height) {
    var u = $.mapster.utils;
    var pos,
        found,
        minX,
        minY,
        maxX,
        maxY,
        bestMinX,
        bestMaxX,
        bestMinY,
        bestMaxY,
        curX,
        curY,
        nest,
        j,
        offsetx = 0,
        offsety = 0,
        rootx,
        rooty,
        iCoords,
        radius,
        angle,
        el,
        coords = [];

    // if a single element was passed, map it to an array

    elements = elements.length ? elements : [elements];

    container = container ? $(container) : $(document.body);

    // get the relative root of calculation

    pos = container.offset();
    //rootx = pos.left;
    //rootx = pos.right;
    //rooty = pos.top;

    // with areas, all we know about is relative to the top-left corner of the image. We need to add an offset compared to
    // the actual container. After this calculation, offsetx/offsety can be added to either the area coords, or the target's
    // absolute position to get the correct top/left boundaries of the container.

    if (image) {
        //pos = $(image).offset();
        //offsetx = pos.left;
        // offsetx = pos.right;
        // offsety = pos.top;

    }

    // map the coordinates of any type of shape to a poly and use the logic. simpler than using three different
    // calculation methods. Circles use a 20 degree increment for this estimation.

    for (j = 0; j < elements.length; j++) {
        el = elements[j];
        if (el.nodeName === 'AREA') {
            iCoords = u.split(el.coords, parseInt);

            switch (el.shape) {
                case 'circle':
                    curX = iCoords[0];
                    curY = iCoords[1];
                    radius = iCoords[2];
                    coords = [];
                    for (j = 0; j < 360; j += 20) {
                        angle = (j * Math.PI) / 180;
                        coords.push(
                            curX + radius * Math.cos(angle),
                            curY + radius * Math.sin(angle)
                        );
                    }
                    break;
                case 'rect':
                    coords.push(
                        iCoords[0],
                        iCoords[1],
                        iCoords[2],
                        iCoords[1],
                        iCoords[2],
                        iCoords[3],
                        iCoords[0],
                        iCoords[3]
                    );
                    break;
                default:
                    coords = coords.concat(iCoords);
                    break;
            }

            // map area positions to it's real position in the container

            for (j = 0; j < coords.length; j += 2) {
                coords[j] = parseInt(coords[j], 10) + offsetx;
                coords[j + 1] = parseInt(coords[j + 1], 10) + offsety;
            }
        } else {
            // el = $(el);
            // pos = el.position();
            // coords.push(
            //     pos.left,
            //     pos.top,
            //     pos.left + el.width(),
            //     pos.top,
            //     pos.left + el.width(),
            //     pos.top + el.height(),
            //     pos.left,
            //     pos.top + el.height()
            // );
        }
    }

    minX = minY = bestMinX = bestMinY = 999999;
    maxX = maxY = bestMaxX = bestMaxY = -1;

    for (j = coords.length - 2; j >= 0; j -= 2) {
        curX = coords[j];
        curY = coords[j + 1];

        if (curX < minX) {
            minX = curX;
            bestMaxY = curY;
        }
        if (curX > maxX) {
            maxX = curX;
            bestMinY = curY;
        }
        if (curY < minY) {
            minY = curY;
            bestMaxX = curX;
        }
        if (curY > maxY) {
            maxY = curY;
            bestMinX = curX;
        }
    }

    // try to figure out the best place for the tooltip

    if (width && height) {
        found = false;
        $.each(
            [

                // [maxX, bestMinY - (height / 2)]
                [maxX - width, bestMinY - height]
                // [minX - (bestMinX / 2), minY - height],
                // [bestMaxX - width, minY - height],
                // [minX, minY - height],
                // [bestMinX, minY - height],
                // [minX - width, bestMaxY - height],
                // [minX - width, bestMinY],
                // [maxX, bestMaxY - height],
                // [maxX, bestMinY],
                // [bestMaxX - width, maxY],
                // [bestMinX, maxY]
                // [bestMinX, minY]
            ],
            function (_, e) {
                if (!found && e[0] > rootx && e[1] > rooty) {
                    nest = e;
                    found = true;
                    return false;
                }
            }
        );

        // default to lower-right corner if nothing fit inside the boundaries of the image

        if (!found) {
            nest = [maxX, maxY];
        }
    }
    return nest;
};

$(document).ready(function () {

    parseCSV(_main);

});
