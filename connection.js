const mongoose = require('mongoose');

async function connectToMonngoDB(url) {
    return mongoose.connect(url);
}

module.exports = {
    connectToMonngoDB,
}