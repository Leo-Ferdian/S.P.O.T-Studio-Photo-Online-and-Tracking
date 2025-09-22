const apiError = require('../utils/apiError');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');
const AuthService = require('./auth.services');
require('dotenv').config();


module.exports = BookingService;