//
// Handles stop, which will exit the skill
//

'use strict';

const ads = require('../ads');
const speechUtils = require('alexa-speech-utils')();

module.exports = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    // Can always handle with Stop and Cancel
    if (request.type === 'IntentRequest') {
      if ((request.intent.name === 'AMAZON.CancelIntent')
        || (request.intent.name === 'AMAZON.StopIntent')) {
        return true;
      }

      // Can also handle No if said at end of round
      if ((request.intent.name === 'AMAZON.NoIntent')
        && (attributes.temp.roundOver = true)) {
        return true;
      }
    }

    return false;
  },
  handle: async function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    const res = require('../resources')(handlerInput);
    let status = '';

    // Is a game in progress?  If so, let's read bankrolls and say who's in the lead
    if (!attributes.temp.needPlayerCount && !attributes.temp.addingPlayers) {
      const scores = game.players.slice(0).sort((a, b) => b.bankroll - a.bankroll);
      const values = speechUtils.and(scores.map((x) => res.sayPlayerBankroll(x)));
      status = res.getString('EXIT_COME_BACK').replace('{0}', values);
    } else {
      // They didn't finish adding players - nuke the players before we save
      game.players = [];
    }

    const adText = await ads.getAd(attributes, 'craps-party', event.request.locale);
    return handlerInput.responseBuilder
      .speak(res.getString('EXIT_GAME').replace('{0}', adText).replace('{1}', status))
      .withShouldEndSession(true)
      .getResponse();
  },
};
