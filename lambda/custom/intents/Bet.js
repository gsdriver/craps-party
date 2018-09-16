//
// Handles taking a player's bet
//

'use strict';

const utils = require('../utils');

module.exports = {
  canHandle: function(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    return ((attributes.temp.bettingPlayer !== undefined)
      && (request.type === 'IntentRequest')
      && ((request.intent.name === 'PassBetIntent')
        || (request.intent.name === 'DontPassBetIntent')
        || (request.intent.name === 'OddsBetIntent')
        || (request.intent.name === 'FieldBetIntent')));
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const game = attributes[attributes.currentGame];
    const player = game.players[attributes.temp.bettingPlayer];
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
    if (game.point) {
      if (validBets['POINT'].indexOf(event.request.intent.name) === -1) {
        speechError = res.getString('INVALID_BET_POINT');
        reprompt = res.getString('BET_INVALID_REPROMPT');
      }
    } else {
      if (validBets['NOPOINT'].indexOf(event.request.intent.name) === -1) {
        speechError = res.getString('INVALID_BET_NO_POINT');
        reprompt = res.getString('BET_INVALID_REPROMPT');
      }
    }

    // If this is pass or don't pass, make sure we don't already have a line bet
    if (((event.request.intent.name === 'PassBetIntent') ||
          (event.request.intent.name === 'DontPassBetIntent'))
        && utils.getLineBet(player.bets)) {
      speechError = res.getString('INVALID_BET_HAVE_LINEBET');
      reprompt = res.getString('BET_INVALID_REPROMPT');
    }

    // Keep validating input if we don't have an error yet
    if (!speechError) {
      bet.amount = getBet(event, attributes);
      if (event.request.intent.name === 'OddsBetIntent') {
        baseBet = utils.getBaseBet(attributes);
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
      switch (event.request.intent.name) {
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

      reprompt = res.getString('BET_PLACED_REPROMPT');
      speech = speech.replace('{0}', bet.amount).replace('{1}', reprompt);
      if (duplicateText) {
        speech = duplicateText + speech;
      }
    }

    if (speechError) {
      speechError += (' ' + reprompt);
    }

    return handlerInput.responseBuilder
      .speak((speechError) ? speechError : speech)
      .reprompt(reprompt)
      .getResponse();
  },
};

function getBet(event, attributes) {
  // The bet amount is optional - if not present we will use a default value
  // of either the last bet amount or the minimum bet for the table
  let amount;
  const game = attributes[attributes.currentGame];
  const player = game.players[attributes.temp.bettingPlayer];
  const amountSlot = (event.request.intent && event.request.intent.slots
      && event.request.intent.slots.Amount);

  if (amountSlot && amountSlot.value) {
    // If the bet amount isn't an integer, we'll use the default value (1 unit)
    amount = parseInt(amountSlot.value);
  } else if (player.lineBet && (event.request.intent.name === 'OddsBetIntent')) {
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
