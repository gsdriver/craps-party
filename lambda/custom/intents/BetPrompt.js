//
// Handles a user pressing the button to place a bet
//

'use strict';

const buttons = require('../buttons');
const utils = require('../utils');

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];

    // If this is a button we've seen before, we are now going to prompt for a bet
    if (request.type === 'GameEngine.InputHandlerEvent') {
      const buttonId = buttons.getPressedButton(request, attributes);
      const lastPressShooter = (attributes.temp.bettingPlayer !== undefined) &&
        ((attributes.temp.bettingPlayer === game.shooter));

      if (buttonId) {
        let existingPlayer;
        let i;

        for (i = 0; i < game.players.length; i++) {
          if (game.players[i].buttonId === buttonId) {
            attributes.temp.bettingPlayer = i;
            existingPlayer = true;
          }
        }

        // We handle if an existing player pressed the button
        // unless it was the shooter who has pressed it twice
        if (existingPlayer &&
          !(lastPressShooter && (attributes.temp.bettingPlayer === game.shooter))) {
          return true;
        }
      }
    }

    return false;
  },
  handle: function(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    const res = require('../resources')(handlerInput);
    let speech = '';
    let reprompt;

    buttons.turnOffButtons(handlerInput);
    game.timestamp = Date.now();
    if (attributes.temp.addingPlayers) {
      speech += res.getString('BETPROMPT_STARTING').replace('{0}', game.players.length);
      utils.startGame(handlerInput);
      attributes.temp.bettingPlayer = undefined;
    } else {
      // Color this player's button
      buttons.lightPlayer(handlerInput,
        game.players[attributes.temp.bettingPlayer].buttonId,
        game.players[attributes.temp.bettingPlayer].buttonColor);

      if (attributes.temp.bettingPlayer === game.shooter) {
        speech += res.getString('BETPROMPT_SHOOTER');
        reprompt = res.getString('BETPROMPT_SHOOTER_REPROMPT');
      } else {
        speech += res.getString('BETPROMPT_PLACEBET').replace('{0}', attributes.temp.bettingPlayer + 1);
        reprompt = res.getString('BETPROMPT_PLACEBET_REPROMPT')
            .replace('{0}', attributes.temp.bettingPlayer + 1);
      }
    }

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt(reprompt)
      .getResponse();
  },
};
