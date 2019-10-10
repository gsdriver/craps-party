//
// Handles taking a player's bet
//

'use strict';

const utils = require('../utils');
const speechUtils = require('alexa-speech-utils')();

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];

    // We need to be past the registration state
    if (!attributes.temp.needPlayerCount && !attributes.temp.addingPlayers
      && (request.type === 'IntentRequest')
      && ((request.intent.name === 'PassBetIntent')
        || (request.intent.name === 'DontPassBetIntent')
        || (request.intent.name === 'OddsBetIntent')
        || (request.intent.name === 'FieldBetIntent'))) {
      return true;
    }

    // It's possible we needed them to confirm their name
    if (!attributes.temp.addingPlayers && attributes.temp.bettingIntent &&
      ((request.type === 'IntentRequest')
      && (request.intent.name === 'PlayerNameIntent'))) {
      return true;
    }

    return false;
  },
  handle: async function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    const res = require('../resources')(handlerInput);
    const validBets = {
      'POINT': ['OddsBetIntent', 'FieldBetIntent'],
      'NOPOINT': ['PassBetIntent', 'DontPassBetIntent', 'FieldBetIntent'],
    };
    let reprompt;
    let speechError;
    let speech = '';
    let bet = {};
    let baseBet;

    // Make sure this is a valid bet for the state
    if (handlerInput.requestEnvelope.request.intent.name !== 'PlayerNameIntent') {
      if (game.point) {
        if (validBets['POINT'].indexOf(event.request.intent.name) === -1) {
          return handlerInput.responseBuilder
            .speak(res.getString('INVALID_BET_POINT'))
            .reprompt(res.getString('BET_INVALID_REPROMPT'))
            .getResponse();
        }
      } else {
        if (validBets['NOPOINT'].indexOf(event.request.intent.name) === -1) {
          return handlerInput.responseBuilder
            .speak(res.getString('INVALID_BET_NO_POINT'))
            .reprompt(res.getString('BET_INVALID_REPROMPT'))
            .getResponse();
        }
      }
    }

    // Now let's see if we can figure out who is placing this bet
    // If not, then we will need to prompt
    const player = utils.getActivePlayer(handlerInput);
    const intent = (player && (event.request.intent.name === 'PlayerNameIntent')) 
      ? attributes.temp.bettingIntent : event.request.intent;

    if (!player) {
      if (attributes.temp.bettingIntent && (intent.name === 'PlayerNameIntent')
        && (intent.slots.Name && intent.slots.Name.value)) {
        // This means they were prompted for a name but gave one not in our roster
        // So let's echo back the name we heard and the names of the players
        speech = res.getString('BET_WRONG_NAME')
          .replace('{0}', intent.slots.Name.value)
          .replace('{1}', speechUtils.or(game.players.map((p) => p.name)));
        return handlerInput.responseBuilder
          .speak(speech)
          .reprompt(res.getString('BET_NEED_NAME'))
          .getResponse();
      }

      attributes.temp.bettingIntent = attributes.temp.bettingIntent || intent;
      return handlerInput.responseBuilder
        .speak(res.getString('BET_NEED_NAME'))
        .reprompt(res.getString('BET_NEED_NAME'))
        .getResponse();
    }

    // If this is pass or don't pass, make sure we don't already have a line bet
    attributes.temp.bettingIntent = undefined;
    if (((intent.name === 'PassBetIntent') ||
          (intent.name === 'DontPassBetIntent'))
        && utils.getLineBet(player.bets)) {
      return handlerInput.responseBuilder
        .speak(res.getString('INVALID_BET_HAVE_LINEBET'))
        .reprompt(res.getString('BET_INVALID_REPROMPT'))
        .getResponse();
    }

    // Keep validating input if we don't have an error yet
    if (!speechError) {
      bet.amount = getBet(player, intent, attributes);
      if (intent.name === 'OddsBetIntent') {
        baseBet = utils.getBaseBet(player, attributes);
        if (!baseBet) {
          speechError = res.getString('BET_NO_BETFORODDS');
          reprompt = res.getString('BET_INVALID_REPROMPT');
        } else if (game.maxOdds && (bet.amount > (game.maxOdds * baseBet.amount))) {
          speechError = res.getString('BET_EXCEEDS_ODDS')
              .replace('{0}', game.maxOdds).replace('{1}', player.lineBet);
          reprompt = res.getString('BET_INVALID_REPROMPT');
        }
      }

      if (!speechError) {
        player.bankroll -= bet.amount;
      }
    }

    if (!speechError) {
      // OK, we're good to bet - let's set up the numbers and type
      switch (intent.name) {
        case 'DontPassBetIntent':
          player.lineBet = bet.amount;
          player.passPlayer = false;
          bet = utils.createLineBet(bet.amount, player.passPlayer);
          speech += res.getString('DONTPASSBET_PLACED');
          break;
        case 'PassBetIntent':
          player.lineBet = bet.amount;
          player.passPlayer = true;
          bet = utils.createLineBet(bet.amount, player.passPlayer);
          speech += res.getString('PASSBET_PLACED');
          break;
        case 'OddsBetIntent':
          bet.type = 'OddsBet';
          speech += res.getString('ODDS_BET_PLACED');
          baseBet.odds = (baseBet.odds) ? (baseBet.odds + bet.amount) : bet.amount;
          if ((baseBet.type === 'PassBet') || (baseBet.type === 'ComeBet')) {
            const payout = {4: 2, 5: 1.5, 6: 1.2, 8: 1.2, 9: 1.5, 10: 2};
            baseBet.oddsPayout = payout[baseBet.point];
          } else {
            const payout = {4: 0.5, 5: 0.6667, 6: 0.8334, 8: 0.8334, 9: 0.6667, 10: 0.5};
            baseBet.oddsPayout = payout[baseBet.point];
          }
          break;
        case 'FieldBetIntent':
          bet.type = 'FieldBet';
          bet.winningRolls = {2: 2, 3: 1, 4: 1, 9: 1, 10: 1, 11: 1, 12: 3};
          bet.losingRolls = [5, 6, 7, 8];
          speech += res.getString('FIELD_BET_PLACED');
          break;
        default:
          // This shouldn't happen
          console.log('Invalid outside bet???');
          break;
      }

      // Check if they already have an identical bet and if so
      // we'll add to that bet (so long as it doesn't exceed the
      // hand maximum).  Come bets are an exception
      let duplicateBet;
      let duplicateText;
      if (player.bets) {
        let i;
        for (i = 0; i < player.bets.length; i++) {
          if (player.bets[i].type === bet.type) {
            // Yes, it's a match - note and exit
            duplicateBet = player.bets[i];
            break;
          }
        }
      }

      if (duplicateBet) {
        // Can I add this?
        if (game.maxBet
          && ((bet.amount + duplicateBet.amount) > game.maxBet)) {
          // No, you can't
          player.bankroll += bet.amount;
          duplicateText = res.getString('BET_DUPLICATE_NOT_ADDED')
              .replace('{0}', duplicateBet.amount)
              .replace('{1}', bet.amount)
              .replace('{2}', game.maxBet);
          speech = '{1}';
        } else if (game.maxOdds
            && ((bet.amount + duplicateBet.amount) > (game.maxOdds * player.lineBet))) {
          // No, you can't
          player.bankroll += bet.amount;
          duplicateText = res.getString('BET_DUPLICATE_NOT_ADDED')
              .replace('{0}', duplicateBet.amount)
              .replace('{1}', bet.amount)
              .replace('{2}', game.maxOdds * player.lineBet);
          speech = '{1}';
        } else {
          duplicateBet.amount += bet.amount;
          bet.amount = duplicateBet.amount;
          duplicateText = res.getString('BET_DUPLICATE_ADDED');
        }
      } else if (bet.type !== 'OddsBet') {
        if (player.bets) {
          player.bets.push(bet);
        } else {
          player.bets = [bet];
        }
      }

      // If this is non-personalized (in order) then we should prompt
      // for the next player to play, or assume they have all bet (if at end)
      // If it is personalized, just say anyone can should out a bet
      if (attributes.temp.personalized) {
        reprompt = res.getString('BET_PLACED_REPROMPT_PERSONAL');        
      } else {
        game.currentPlayer++;
        if (game.currentPlayer >= game.players.length - 1) {
          game.currentPlayer = undefined;
          reprompt = res.getString('BET_PLACED_REPROMPT_NONPERSONAL_ROLL');
        } else {
          reprompt = res.getString('BET_PLACED_REPROMPT_NONPERSONAL')
            .replace('{0}', game.players[game.currentPlayer].name);
        }
      }

      speech = speech.replace('{0}', bet.amount).replace('{1}', reprompt);
      if (duplicateText) {
        speech = duplicateText + speech;
      }
    }

    if (speechError) {
      speechError += (' ' + reprompt);
    }

    // Speed up the speech (not the errors though)
    speech = '<prosody rate="fast">' + speech + reprompt + '</prosody>';

    return handlerInput.responseBuilder
      .speak((speechError) ? speechError : speech)
      .reprompt(reprompt)
      .getResponse();
  },
};

function getBet(player, intent, attributes) {
  // The bet amount is optional - if not present we will use a default value
  // of either the last bet amount or the minimum bet for the table
  let amount;
  const game = attributes[attributes.currentGame];
  const amountSlot = (intent && intent.slots && intent.slots.Amount);

  if (amountSlot && amountSlot.value) {
    // If the bet amount isn't an integer, we'll use the default value (1 unit)
    amount = parseInt(amountSlot.value);

    // If an odds bet, don't exceed max odds
    if (player.lineBet && (intent.name === 'OddsBetIntent')) {
      amount = Math.min(amount, player.lineBet * game.maxOdds);
    }
  } else if (player.lineBet && (intent.name === 'OddsBetIntent')) {
    amount = player.lineBet * game.maxOdds;
  } else if (player.bets && player.bets.length) {
    amount = player.bets[player.bets.length - 1].amount;
  } else {
    amount = game.minBet;
  }

  // Let's tweak the amount for them
  if (isNaN(amount) || (amount == 0)) {
    amount = 1;
  } else if (amount < game.minBet) {
    amount = game.minBet;
  }
  if (amount > player.bankroll) {
    amount = player.bankroll;
  }

  return amount;
}
