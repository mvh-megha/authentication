/**
 * This file is the entry point of the app
 */

const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const serverPort = 8080;//appConfiguration.getPortNumber();
try {
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    /** Server Health checkup*/
    app.get('/', (req, res) => {
        res.send('Server is up and running');
    });

    var router = require("./router/mainRouter");
    app.use('/', router);

    /** Starting the server using express */
    app.listen(serverPort, (error) => {
        if (error) {
            return console.log('Error while starting the server', error);
        }
        console.log(`server is listening on ${serverPort}`);
    });

} catch (error) {
    console.log(error);
}





