const moment = require('moment');

function formatMessage(username, text, imageUrl){
    return {
        username,
        text,
        time: moment().format('h:mm a')
    }
}

module.exports = formatMessage;