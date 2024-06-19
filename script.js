const apiKey = 'dc623b669245617e22328d659131ed82'; // Replace with your actual API key
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastApiUrl = 'https://api.openweathermap.org/data/2.5/forecast';
const locationInput = document.getElementById('locationInput');
const searchButton = document.getElementById('searchButton');
const locationElement = document.getElementById('location');
const geolocationElement = document.getElementById('geolocation'); // New geolocation element
const temperatureElement = document.getElementById('temperature');
const descriptionElement = document.getElementById('description');
const humidityElement = document.getElementById('humidity');
const timeElement = document.getElementById('time');
const forecastElement = document.getElementById('forecast');
const weatherIconElement = document.getElementById('weatherIcon');
const windElement = document.getElementById('wind');
const precipitationElement = document.getElementById('precipitation');

searchButton.addEventListener('click', () => {
    const location = locationInput.value;
    if (location) {
        fetchWeather(location); // Pass location (city) to fetchWeather function
        fetchForecast(location); // Pass location (city) to fetchForecast function
    }
});


function fetchWeather(location) {
    const url = `${apiUrl}?q=${location}&appid=${apiKey}&units=imperial`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Populate weather data
            locationElement.textContent = data.name; // Display city name only
            temperatureElement.textContent = `${Math.round(data.main.temp)}°F`;
            descriptionElement.textContent = data.weather[0].description;
            humidityElement.textContent = `Humidity: ${data.main.humidity}%`;
            windElement.textContent = `Wind Speed: ${data.wind.speed} mph`;

            // Update geolocationElement with coordinates from weather data
            const latitude = data.coord.lat;
            const longitude = data.coord.lon;
            geolocationElement.textContent = `Latitude: ${latitude.toFixed(2)}, Longitude: ${longitude.toFixed(2)}`;

            // Estimating precipitation percentage based on humidity
            let precipitationPercentage = 0;
            if (data.main.humidity > 70) {
                precipitationPercentage = 50;
            } else if (data.main.humidity > 50) {
                precipitationPercentage = 30;
            }
            precipitationElement.textContent = `Precipitation: ${precipitationPercentage}%`;
            
            // Set weather icon
            const weatherIcon = data.weather[0].icon;
            const iconUrl = `https://openweathermap.org/img/wn/${weatherIcon}.png`;
            weatherIconElement.src = iconUrl;
            weatherIconElement.alt = 'Weather Icon'; // Set alt text here
            // Add class to indicate loaded state
            weatherIconElement.parentNode.classList.add('loaded');
            // Format and display current time
            const currentTime = new Date(data.dt * 1000);
            const options = { weekday: 'long', hour: 'numeric', minute: 'numeric' };
            const formattedTime = new Intl.DateTimeFormat('en-US', options).format(currentTime);
            timeElement.textContent = `${formattedTime}`;
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}

function fetchForecast(location) {
    const url = `${forecastApiUrl}?q=${location}&appid=${apiKey}&units=imperial`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const forecastData = data.list;
            forecastElement.innerHTML = '';
            let currentDate = null;
            let currentDayData = null;
            forecastData.forEach(item => {
                const date = new Date(item.dt * 1000);
                const day = date.toLocaleDateString('en-US', { weekday: 'short' });
                if (day !== currentDate) {
                    if (currentDayData) {
                        addForecastItem(currentDayData);
                    }
                    currentDayData = {
                        day: day,
                        high: -Infinity,
                        low: Infinity,
                        icon: null
                    };
                    currentDate = day;
                }
                if (item.main.temp_max > currentDayData.high) {
                    currentDayData.high = item.main.temp_max;
                    currentDayData.icon = item.weather[0].icon;
                }
                if (item.main.temp_min < currentDayData.low) {
                    currentDayData.low = item.main.temp_min;
                }
            });
            if (currentDayData) {
                addForecastItem(currentDayData);
            }
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
        });
}
function addForecastItem(data) {
    const forecastItem = document.createElement('div');
    forecastItem.classList.add('forecast-item');
    forecastItem.innerHTML = `
        <p>${data.day}</p>
        <img src="https://openweathermap.org/img/wn/${data.icon}.png" alt="Weather Icon">
        <p>High: ${Math.round(data.high)}°F</p>
        <p>Low: ${Math.round(data.low)}°F</p>
    `;
    forecastElement.appendChild(forecastItem);
}

