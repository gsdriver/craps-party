//
// Handles roll call ending due to buttons timing out
//

'use strict';

const utils = require('../utils');

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    let timedOut = false;

    // If this is a button we've seen before, we are now going to prompt for a bet
    if (request.type === 'GameEngine.InputHandlerEvent') {
      const gameEngineEvents = request.events || [];

      gameEngineEvents.forEach((engineEvent) => {
        // in this request type, we'll see one or more incoming events
        // corresponding to the StartInputHandler we sent above
        if (engineEvent.name === 'timeout') {
          timedOut = true;
        }
      });
    }

    return timedOut;
  },
  handle: function(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    const res = require('../resources')(handlerInput);

    if (game.players.length === 0) {
      // No one pressed a button - end the game
      return handlerInput.responseBuilder
        .speak(res.getString('ENDROLLCALL_NOPLAYERS').replace('{0}', res.getString('SKILL_NAME')))
        .withShouldEndSession(true)
        .getResponse();
    } else {
      // OK, we're done waiting for players - let's start the game
      utils.startGame(handlerInput);
      return handlerInput.responseBuilder
        .speak(res.getString('ENDROLLCALL_STARTGAME'))
        .reprompt(res.getString('ENDROLLCALL_STARTGAME_REPROMPT'))
        .getResponse();
    }
  },
};
