var map;

window.initMap = function() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 0, lng: 0 },
        zoom: 2
    });
}

function getWeather() {
    const city = document.getElementById('cityInput').value;
    fetch('/weather', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: data.error,
            });
        } else {
            const output = document.getElementById('weatherOutput');
            output.innerHTML = `
                <img src="http://openweathermap.org/img/w/${data.icon}.png" alt="${data.description}" class="img-fluid mb-3">
                <p class="weather-info">City: ${data.city}, ${data.country}</p>
                <p class="weather-info">Coordinates: ${data.latitude}, ${data.longitude}</p>
                <p class="weather-info">Temperature: ${data.temperature}°C</p>
                <p class="weather-info">Feels Like: ${data.feels_like}°C</p>
                <p class="weather-info">Humidity: ${data.humidity}%</p>
                <p class="weather-info">Pressure: ${data.pressure} mb</p>
                <p class="weather-info">Wind Speed: ${data.wind_speed} km/h</p>
                <p class="weather-info">Description: ${data.description}</p>
                <p class="weather-info">Rain Volume for the last 3 hours: ${data.rain ? data.rain : 'No rain'}</p>
                <p class="weather-info">UV Index: ${data.uv_index}</p>
                <p class="weather-info">Max Temp: ${data.max_temp}°C</p>
                <p class="weather-info">Min Temp: ${data.min_temp}°C</p>
                <p class="weather-info">Wind Direction: ${data.wind_dir}</p>
                <p class="weather-info">Sunrise: ${data.sunrise}</p>
                <p class="weather-info">Sunset: ${data.sunset}</p>
                <p class="weather-info">Condition: ${data.condition}</p>
            `;

            map.setCenter({ lat: data.latitude, lng: data.longitude });
            map.setZoom(8);
        }
    });
}

document.addEventListener('DOMContentLoaded', initMap);
document.getElementById('button1').addEventListener('click', function() {
    getWeather();
    document.getElementById('cityInput').value = '';
});