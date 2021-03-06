//
// Saves attributes at the end of the session
//

'use strict';

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

module.exports = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'SessionEndedRequest');
  },
  handle: function(handlerInput) {
    console.log('End session - saving attributes');
    return new Promise((resolve, reject) => {
      const attributes = handlerInput.attributesManager.getSessionAttributes();
      const event = handlerInput.requestEnvelope;
      const game = attributes[attributes.currentGame];

      if (game.startingPlayerCount && !process.env.NOSAVETABLE) {
        // Save the table to S3 - OK if this fails
        const data = {
          userId: event.session.user.userId,
          tableSize: game.startingPlayerCount,
          rounds: attributes.temp.sessionRounds,
        };
        s3.putObject({Body: JSON.stringify(data),
             Bucket: 'garrett-alexa-usage',
             Key: 'craps-party/' + Date.now() + '.txt'}, (err, data) => {
          done();
        });
      } else {
        done();
      }

      function done() {
        // Clear and persist attributes
        attributes.temp = undefined;
        handlerInput.attributesManager.setPersistentAttributes(attributes);
        handlerInput.attributesManager.savePersistentAttributes();
        resolve();
      }
    });
  },
};
