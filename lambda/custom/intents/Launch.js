//
// Handles launching the skill
//

'use strict';

const moment = require('moment-timezone');
const https = require('https');

module.exports = {
  canHandle: function(handlerInput) {
    return handlerInput.requestEnvelope.session.new ||
      (handlerInput.requestEnvelope.request.type === 'LaunchRequest');
  },
  handle: async function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const res = require('../resources')(handlerInput);
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    let speech = '<audio src=\"https://s3-us-west-2.amazonaws.com/alexasoundclips/casinowelcome.mp3\"/> ';
    let response;

    const timezone = await getUserTimezone(event);
    if (timezone) {
      const hour = moment.tz(Date.now(), timezone).format('H');
      if ((hour > 5) && (hour < 12)) {
        speech += res.getString('LAUNCH_GOOD_MORNING');
      } else if ((hour >= 12) && (hour < 18)) {
        speech += res.getString('LAUNCH_GOOD_AFTERNOON');
      } else {
        speech += res.getString('LAUNCH_GOOD_EVENING');
      }
    }

    attributes.temp.needPlayerCount = true;
    speech += res.getString('LAUNCH_WELCOME').replace('{0}', res.getString('SKILL_NAME'));
    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt(res.getString('LAUNCH_REPROMPT'))
      .getResponse();
  },
};

function getUserTimezone(event) {
  if (event.context.System.apiAccessToken) {
    // Invoke the entitlement API to load timezone
    const options = {
      host: 'api.amazonalexa.com',
      path: '/v2/devices/' + event.context.System.device.deviceId + '/settings/System.timeZone',
      method: 'GET',
      timeout: 1000,
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': event.request.locale,
        'Authorization': 'bearer ' + event.context.System.apiAccessToken,
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.get(options, (res) => {
        let returnData = '';
        res.setEncoding('utf8');
        if (res.statusCode != 200) {
          console.log('deviceTimezone returned status code ' + res.statusCode);
          resolve();
        } else {
          res.on('data', (chunk) => {
            returnData += chunk;
          });

          res.on('end', () => {
            // Strip quotes
            const timezone = returnData.replace(/['"]+/g, '');
            resolve(moment.tz.zone(timezone) ? timezone : undefined);
          });
        }
      });

      req.on('error', (err) => {
        console.log('Error calling user settings API: ' + err.message);
        resolve();
      });
    });
  } else {
    // No API token - no user timezone
    return Promise.resolve();
  }
}
