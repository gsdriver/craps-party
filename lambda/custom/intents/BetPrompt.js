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

        // If you are the shooter and we aren't adding players
        // and you don't have enough money to place a new bet anyways
        // then we won't process this and let it fall to roll
        if (existingPlayer && !attributes.temp.addingPlayers
          && (attributes.temp.bettingPlayer === game.shooter)
          && (game.players[attributes.temp.bettingPlayer].bankroll < game.minBet)) {
          return false;
        }

        // We handle if an existing player pressed the button
        // unless it was the shooter who has pressed it twice
        if (existingPlayer &&
          !(lastPressShooter && (attributes.temp.bettingPlayer === game.shooter))) {
          return true;
        }
      }
    }

    return ((game.players.length > 0) && attributes.temp.addingPlayers &&
      (request.type === 'IntentRequest') && (request.intent.name === 'StartIntent'));
  },
  handle: function(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    const res = require('../resources')(handlerInput);
    let speech = '';
    let reprompt;

    // If this player has no money left they can't place a bet
    if (attributes.temp.addingPlayers) {
      if (game.players.length === 1) {
        speech += res.getString('BETPROMPT_STARTING_SOLO');
      } else {
        speech += res.getString('BETPROMPT_STARTING').replace('{0}', game.players.length);
      }
      utils.startGame(handlerInput);
      attributes.temp.bettingPlayer = undefined;
    } else if (game.players[attributes.temp.bettingPlayer].bankroll < game.minBet) {
      speech += res.getString('BETPROMPT_NOTENOUGH');
      reprompt = res.getString('BETPROMPT_NOTENOUGH_REPROMPT');
    } else {
      // Color this player's button
      buttons.turnOffButtons(handlerInput);
      buttons.lightPlayer(handlerInput,
        game.players[attributes.temp.bettingPlayer].buttonId,
        game.players[attributes.temp.bettingPlayer].buttonColor);

      if (attributes.temp.bettingPlayer === game.shooter) {
        speech += res.getString('BETPROMPT_SHOOTER');
        reprompt = res.getString('BETPROMPT_SHOOTER_REPROMPT');
      } else {
        speech += res.getString('BETPROMPT_PLACEBET')
            .replace('{0}', utils.playerName(handlerInput, attributes.temp.bettingPlayer + 1));
        reprompt = res.getString('BETPROMPT_PLACEBET_REPROMPT')
            .replace('{0}', utils.playerName(handlerInput, attributes.temp.bettingPlayer + 1));
      }
    }

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt(reprompt)
      .getResponse();
  },
};
