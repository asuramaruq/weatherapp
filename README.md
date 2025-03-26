# Weather Application

## Deployed Link
- https://backend-weatherapplication.onrender.com

## Installation guide
1. Clone the repository.
2. Use `npm install` command to install necessary dependencies.
3. Change API keys or server port in `.env` file, if you wish to do so.
4. Use `npm start` command to start the local server (by default on port 3000).
5. Head to http://localhost:3000/ from you browser (or http://localhost:(CUSTOM_PORT)/ if you changed the port in `.env` file) 

## User guide
### test user account ( moodle submission )
1. Register a new account (skip if account already exists)
2. Login into the existing account
3. Enter the name of the city into the input field
4. Press the button to output the weather and show the location of the chosen city on the map
5. If you wish to see previous requests made, head to history tab on navigation bar
6. If you wish to logout press the logout button on the navigation bar

## Admin guide
### base admin account ( moodle submission )
1. Use already existing admin account to login into the admin panel
2. The list of the users provided on the page, as well as available actions
3. If you wish to create a new user, press "Add user" button and fill out the form
4. If you wish to edit existing user, press "Edit" button next to the relative user and fill out the form
5. If you wish to delete the existing user, press the "Delete" button next to the relative user
6. There might be a delay between server and your machine, so if changes did not appear on the page reload the page
7. If you wish to logout press the logout button on the navigation bar

## Dependencies
1. NodeJS
2. MongoDB
3. Bootstrap
4. Sweetalert2
5. ExpressJS
6. Express-session
7. EJS
8. Body-Parser
9. Dotenv
10. Axios
11. Morgan
12. Mongoose

## API
1. WeatherAPI
2. OpenWeatherAPI
3. OpenUVAPI
4. GoogleMapsAPI
