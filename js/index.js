/* === DEFINITIONS === */
var svg = {
    '01': 'svg-day-sunny',
    '02': 'svg-day-cloudy',
    '03': 'svg-cloud',
    '04': 'svg-cloudy',
    '09': 'svg-rain',
    '10': 'svg-day-rain',
    '11': 'svg-sunderstorm',
    '13': 'svg-snow',
    '50': 'svg-dust'
}

/* === ON DOM LOADED === */

$(function () {
    $("button#reset-btn").hide();

    /* === LISTENERS === */

    $("button#search-btn").click(run);
    $("button#reset-btn").click(reset);

    /* === SHORTCUTS === */
    initIMG();
});


/***
 * New function to Jquery's shortcut. Filter GET parameters from the url.
 * @param name: Name of the paramter to get.
 * @return: Value of the given parameter.
 */
$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null) return null;
    else return decodeURI(results[1]) || 0;
}


/***
 * Main function of the script. Given a city, add three cards displaying the
 * weather forecast on three days. OpenWeatherMap API is called twice:
 *  - first, get the weather for today and add the first card;
 *  - then, call the forecast API and display the remaining cards.
 * @param city: The city name.
 * @return: undefined.
 */
function getWeather(city) {
    // Declare variables.
    var data = {}, today = {}, tomorrow = {}, aftertomorrow = {};

    // First AJAX request:
    $.get({
        url: 'http://api.openweathermap.org/data/2.5/weather?units=metric&lang=FR&APPID=64f2bd1bc711f052f5fd549f75f4bba3&q=' + city,
        success: function (data) {
            // On success, create a literal object for today's weather.
            var options = {weekday: "long", year: "numeric", month: "long", day: "numeric"};
            today = {
                city: data.name,
                weather: data.weather[0].description,
                temp: data.main.temp,
                pressure: data.main.pressure,
                humidity: data.main.humidity,
                wind: data.wind.speed,
                date: new Date().toLocaleString('fr-FR', options),
                iconclass: svg[data.weather[0].icon.substring(0, 2)],
                precipitation: "n/a"
            };
        },

    }).done(function () {
        // When the request is completed, display the card.
        addWeatherCard(today);

    }).then(function () {
        // Second AJAX call, 2-days forecast.
        var days = [];
        $.get({
            url: 'http://api.openweathermap.org/data/2.5/forecast?units=metric&lang=FR&APPID=64f2bd1bc711f052f5fd549f75f4bba3&q=' + city,
            success: function (data) {
                /* API call retrieve the forecast for every 3 hours, starting at
                 * the time of the API call. This means that the first results
                 * will concern the current day if until after midnight. We need
                 * to exclude the first results from the list. Also, we only
                 * need one result per day, noon has been chosen arbitrarily.
                 */
                for (var day in data.list) {
                    // Keep only results at noon:
                    if (data.list[day].dt_txt.split(" ")[1] == "12:00:00"
                    // Keep only results for a different day:
                        && new Date().getDate() != new Date(data.list[day].dt_txt).getDate()) {

                        // Append the results.
                        days.push(data.list[day]);
                    }
                }
            }

        }).done(function () {
            // Set options for the Date() printing.
            var options = {weekday: "long", year: "numeric", month: "long", day: "numeric"};

            // Add the card for tomorrow:
            addWeatherCard({
                city: today.city,
                weather: days[0].weather[0].description,
                temp: days[0].main.temp,
                pressure: days[0].main.pressure,
                humidity: days[0].main.humidity,
                wind: days[0].wind.speed,
                date: new Date(days[0].dt_txt).toLocaleString('fr-FR', options),
                iconclass: svg[days[0].weather[0].icon.substring(0, 2)],
                precipitation: "n/a"
            });

            // Add the card for the day after tomorrow:
            addWeatherCard({
                city: today.city,
                weather: days[1].weather[0].description,
                temp: days[1].main.temp,
                pressure: days[1].main.pressure,
                humidity: days[1].main.humidity,
                wind: days[1].wind.speed,
                date: new Date(days[1].dt_txt).toLocaleString('fr-FR', options),
                iconclass: svg[days[1].weather[0].icon.substring(0, 2)],
                precipitation: "n/a"
            });

        });
    });
}


/***
 * Use template literals to add a card in the DOM. Refresh the images on the
 * page after appending the card.
 * @param data: Literal object containg all the informations on one day.
 * @return: undefined.
 */
function addWeatherCard(data) {
    // Append the card to the <main></main> node.
    $("main").append(
        `<section class="col-xl-3 col-lg-4 col-md-7 col-sm-12 m-3 meteo-card d-flex flex-column">
            <div class="card-head d-flex flex-row">
                <div class="img ${ data.iconclass }"></div>
                <div class="card-head-text d-flex flex-column justify-content-center ml-2">
                    <p id="city">${ data.city }</p>
                    <p id="date">${ data.date }</p>
                </div>
                <p class="d-flex m-0 temp"><span class="align-self-center">${ data.temp }</span><i class="wi wi-celsius align-self-center"></i></p>
            </div>
            <div class="card-info d-flex flex-column">
                <div class="line d-flex flex-row">
                    <div class="info d-flex" id="wind">
                        <div class="img svg-windy"></div>
                        <p class="desc m-0 pl-3">${ data.wind } <span class="units">km/h</span></p>
                    </div>
                    <div class="info d-flex" id="rain">
                        <div class="img svg-umbrella"></div>
                        <p class="desc m-0 pl-3">${ data.precipitation } <span class="units">mm</span></p>
                    </div>
                </div>
                <div class="line d-flex flex-row">
                    <div class="info d-flex" id="humidity">
                        <div class="img svg-humidity"></div>
                        <p class="desc m-0 pl-3">${ data.humidity } <span class="units">%</span></p>
                    </div>
                    <div class="info d-flex" id="pressure">
                        <div class="img svg-barometer"></div>
                        <p class="desc m-0 pl-3">${ data.pressure } <span class="units">hPa</span></p>
                    </div>
                </div>
            </div>
        </section>`
    );

    // Refresh SVG images (cf. function's documentation).
    initIMG();
}


/***
 * Run the app. Called by an event listener on the submit button. Move the UI
 * before adding the cards.
 * @param e: Event, used only to prevent the default behavior of the submit tag.
 * @return: undefined.
 */
function run(e) {
    // Prevent submit tag behavior.
    e.preventDefault();

    // Move the header to the top and display the reset button.
    if (!$("header").hasClass("h-top")) {
        headerTop();
        $("button#reset-btn").show();
    } else {
        $("main").empty();
    }

    // Retrieve the field value and call the API.
    var city = $("input#city").val();
    getWeather(city);

}


/***
 * Reset function to recover the initial state of the app.
 */
function reset() {
    $("main").empty();
    $("button#reset-btn").hide();
    headerCenter();
}


/***
 * Change CSS classes to alter UI.
 */
function headerTop() {
    if ($("header").hasClass("h-center")) {
        $("h1#app-name").removeClass("mb-4").addClass("col-xl-3 col-lg-4 col-md-5 m-0");
        $("#search-bar").addClass("col-xl-5 col-lg-5 col-md-7");
        $("header").removeClass("h-center col-xl-3 col-lg-4 col-md-6 col-sm-10").addClass("h-top");
    }
}


/***
 * Change CSS classes to alter UI.
 */
function headerCenter() {
    if ($("header").hasClass("h-top")) {
        $("h1#app-name").removeClass("col-xl-3 col-lg-4 col-md-5 m-0").addClass("mb-4");
        $("#search-bar").removeClass("col-xl-5 col-lg-5 col-md-7");
        $("header").removeClass("h-top").addClass("h-center col-xl-3 col-lg-4 col-md-6 col-sm-10");
    }
}


/***
 * Hack to emulate the use of a bootstrap-compatible icon set. Those aren't easy
 * to resize and move, compared to <div> element. Use the class to declare an
 * icon and use the SVG file to create a mask on the background color. This way,
 * only the SVG will appear white and the icon will stay easy to resize.
 */
function initIMG() {
    $(".img").each(function (index) {
        var img = "img/svg/wi" + /(?!svg)-\S+/g.exec($(this).attr('class')) + ".svg";
        if (img !== null) $(this).css({
            "mask-image": "url(" + img + ")",
            "background-color": "white"
        });
    });
}
