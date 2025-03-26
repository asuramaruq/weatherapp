const express = require('express');
const session = require('express-session')
const axios = require('axios');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const http = require('http');
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./model/usermodel');
const Weather = require('./model/weatherdatamodel');

const uri = process.env.MONGODB_URI;
const apiKey = process.env.WEATHER_API_KEY;
const openUvApiKey = process.env.OPENUV_API_KEY;
const openWeatherApiKey = process.env.OPENWEATHER_API_KEY;
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
const port = process.env.PORT || 3000;


const connectionParams = {};

mongoose
    .connect(uri, connectionParams)
    .then(() => {
        console.info("Connected to DB");
    })
    .catch((e) => {
        console.log("Error: ", e);
    });


app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'views')));

app.use(session({
    name: 'my.sid',
    secret: 'tech',
    resave: false,
    saveUninitialized: true,
}));

app.set("view engine", "ejs");
app.set('views',path.join(process.cwd(), 'views'));


app.get('/', (req, res) => {
    res.render('auth');
});

app.post("/login", async (req, res) => {
    const {username, password} = req.body;
    const currentUser = await User.findOne({username, password}) 
    if (!currentUser){
        return res.status(404).json({message: "Incorrect username or password"})
    }   

    req.session.user = currentUser;

    if (currentUser.isAdmin) {
        res.status(200).json({redirect: '/adminpanel', user: currentUser});
    } else {
        res.status(200).json({redirect: '/main', user: currentUser});
    }
})

app.post("/registration", async (req, res) => {
    const {username, password} = req.body;
    const newUser = new User({
        username,
        password,
        isAdmin: false,
        deletedAt: null,
    })
    const currentUser = await User.findOne({username}) 
    if (currentUser){
        return res.status(409).json({message: "Username already in use"})
    } 
    const user = await newUser.save()

    req.session.user = user;

    res.status(200).json({redirect: '/'});
})

app.get('/main', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    const history = await Weather.find({ userId: req.session.user._id });
    res.render('index', { 
        history, 
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if(err) {
        return res.redirect('/main');
      }
      res.clearCookie('my.sid');
      res.redirect('/');
    });
});

app.post('/weather', (req, res) => {
    const city = req.body.city;
    const userId = req.body.userId; 
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=1`;

    http.get(url, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', async () => {
            const weatherData = JSON.parse(data);
            
            if (weatherData.error) {
                res.json({ error: weatherData.error.message });
            } else {
                const current = weatherData.current;
                const forecast = weatherData.forecast.forecastday[0];

                const openUvUrl = `https://api.openuv.io/api/v1/uv?lat=${weatherData.location.lat}&lng=${weatherData.location.lon}`;

                axios.get(openUvUrl, {
                    headers: { 'x-access-token': openUvApiKey }
                }).then((response) => {
                    const uvIndex = response.data.result.uv;

                    const openWeatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${openWeatherApiKey}&units=metric`;

                    axios.get(openWeatherUrl)
                        .then(async (response) => {
                            const openWeatherData = response.data;

                            const weather = new Weather({
                                userId: req.session.user._id,
                                city: weatherData.location.name,
                                lat: weatherData.location.lat,
                                lon: weatherData.location.lon,
                                temperature: openWeatherData.main.temp,
                                description: openWeatherData.weather[0].description,
                              });
                            await weather.save();

                            res.json({
                                city: weatherData.location.name,
                                country: weatherData.location.country,
                                latitude: weatherData.location.lat,
                                longitude: weatherData.location.lon,
                                temperature: openWeatherData.main.temp,
                                feels_like: openWeatherData.main.feels_like,
                                humidity: openWeatherData.main.humidity,
                                pressure: openWeatherData.main.pressure,
                                wind_speed: openWeatherData.wind.speed,
                                description: openWeatherData.weather[0].description,
                                icon: openWeatherData.weather[0].icon,
                                rain: openWeatherData.rain ? openWeatherData.rain['3h'] : null,
                                uv_index: uvIndex,
                                max_temp: forecast.day.maxtemp_c,
                                min_temp: forecast.day.mintemp_c,
                                wind_dir: current.wind_dir,
                                sunrise: forecast.astro.sunrise,
                                sunset: forecast.astro.sunset,
                                condition: current.condition.text,
                            });
                        })
                        .catch((error) => {
                            res.json({ error: "An error occurred while fetching the OpenWeather data." });
                        });

                }).catch((error) => {
                    res.json({ error: "An error occurred while fetching the UV index." });
                });
            }
        });

    }).on("error", (err) => {
        res.json({ error: "An error occurred while fetching the WeatherAPI data." });
    });
});

app.get('/adminpanel', async (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.redirect('/');
    }

    const users = await User.find({});

    res.render('adminpanel', { users });
});

app.post('/addUser', async (req, res) => {
    const { username, password, isAdmin } = req.body;

    const newUser = new User({
        username,
        password,
        isAdmin,
        deletedAt: null,
    });

    try {
        const user = await newUser.save();
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/updateUser/:userId', async (req, res) => {
    const { username, password, isAdmin } = req.body;
    const { userId } = req.params;

    try {
        const user = await User.findByIdAndUpdate(userId, { username, password, isAdmin }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/deleteUser/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});