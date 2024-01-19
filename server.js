import express from 'express';
// const express = require('express');
import { APP_PORT, DB_URL  } from './config/index.js';
import errorHandler from './middlewares/errorHandler.js';
const app = express();
import routes from './routes/index.js';

// const routes = require('./routes');
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//appRoot variable use in any folder in the project
global.appRoot = path.resolve(__dirname);
//express.urlencoded used for multi part data 
app.use(express.urlencoded({extended: false}));
app.use(express.json());

import mongoose from 'mongoose';

mongoose.connect("mongodb://localhost:27017/user-user", { useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error',console.error.bind(console, 'connection error'));
db.once('open', () =>{
    console.log('DB connection....')
})


app.use('/api',routes);
app.use('./uploads', express.static('uploads'));

app.use(errorHandler);
app.listen(APP_PORT, () => console.log('listening on port ' + APP_PORT));