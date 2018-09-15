// Localized resources

const seedrandom = require('seedrandom');

const common = {
  // AddPlayer.js
  'ADDPLAYER_FIRSTPLAYER': 'Welcome <say-as interpret-as="ordinal">1</say-as> player. Next player press a different button or press this button again to play solo.|I got 1 player! Next player press a different button or press this button again to go it alone.',
  'ADDPLAYER_NEWPLAYER': 'I have the <say-as interpret-as="ordinal">{0}</say-as> player. Next player press a different button or press one of the buttons that has already joined to start playing.|Player {0} is in the game! Press this button again to start playing or press a new button to add another player|The <say-as interpret-as="ordinal">{0}</say-as> player is in the house! If you\'re ready to play press this button again, or have another player join by pressing a different Echo Button.',
  'ADDPLAYER_MAXPLAYERS': 'OK, that fills the table - let\'s get started! Press a button and say your bet.|Table\'s full! Press a button and place your bet.',
  'ADDPLAYER_NEWPLAYER_REPROMPT': 'Still there? Press a button to play.|Come on, press a button|Press a button <break time=\'300ms\'/> any button.',
  'ADDPLAYER_MAXPLAYERS_REPROMPT': 'Don\'t be shy <break time=\'300ms\'/> someone press a button to place a bet.|Please press a button to place a bet.',
  // Bet.js
  'BET_INVALID_REPROMPT': 'What else can I help you with?',
  'BET_NO_BETFORODDS': 'Sorry, there is no bet to place odds on. ',
  'INVALID_BET_NO_POINT': 'Sorry, this bet can\'t be played until a point has been established.',
  'INVALID_BET_POINT': 'Sorry, this bet can\'t be played once a point has been established.',
  'INVALID_BET_HAVE_LINEBET': 'Sorry, you already have a line bet in play.',
  'BET_DUPLICATE_ADDED': 'Adding to your existing bet for a total of ',
  'BET_PLACED_REPROMPT': 'Place another bet or say roll to roll the dice.',
  // BetPrompt.js
  'BETPROMPT_STARTING': 'Let\'s go with {0} players. Anyone <break time=\'300ms\'/> press your button and say your bet. |Starting the game with {0} players. Anyone can press their button and place a bet. |OK, {0} players today, awesome! Could one of you press your button and place a bet? ',
  'BETPROMPT_PLACEBET': 'OK <say-as interpret-as="ordinal">{0}</say-as> player place your bet.',
  'BETPROMPT_SHOOTER': 'OK shooter, place a bet or press the button again to roll the dice. |Shooter, want to bet? Or press the button to roll the dice. |Let\'s hear what the shooter wants to bet! Or press the button to get those dice rolling! ',
  'BETPROMPT_SHOOTER_REPROMPT': 'Come on shooter <break time=\'300ms\'/> place a bet or press the button to roll.',
  'BETPROMPT_PLACEBET_REPROMPT': 'Place your bet <say-as interpret-as="ordinal">{0}</say-as> player',
  // EndRollCall.js
  'ENDROLLCALL_NOPLAYERS': 'Looks like no one\'s there. Come back to {0} when you\'re ready to play!',
  'ENDROLLCALL_STARTGAME': 'OK, I think we have everyone. Press your Echo Button again to place bets, or say roll to roll the dice.',
  'ENDROLLCALL_STARTGAME_REPROMPT': 'Press a button to bet or say roll to roll the dice.',
  // Exit.js
  'EXIT_GAME': '{0} Goodbye.',
  // Help.js
  'HELP_ADDING_PLAYERS': 'Press a button to add a new player. You need to have Echo Buttons in order to play this game.',
  'HELP_ADDING_PLAYERS_ADDED': 'Press another button to add a new player or one of the buttons you\'ve already pressed to start the game.',
  'HELP_BETTING_PLAYER': 'Press one of the player buttons to place a bet.',
  'HELP_INGAME': 'You can say roll to roll the dice <break time=\'300ms\'/> or any player can press their button to place a bet. Refer to the help card to see what bets you can place.',
  'HELP_REPROMPT': 'What else can I help you with?',
  'HELP_CARD_TEXT': '{0} is a fast-paced game played with a pair of dice. On the first roll of the dice a total of 7 or 11 wins while a roll of 2, 3, or 12 loses.  Any other roll establishes a point. You continue rolling the dice until you either roll the point again (and win), or roll a 7 (and lose).\n  At the start of the game, each player buzzes in with an Echo Button. Each player can then place a bet by pressing the Echo Button. You must bet a line bet which is either a PASS BET which pays if the shooter wins according to the rules above, or a DON\'T PASS bet which will pay if the shooter loses (it pushess if the initial roll is 12). Any player who doesn\'t place a line bet before the shooter rolls the dice will automatically place a pass bet at the table minimum. You can also place a FIELD BET which which pays if the next roll is 2, 3, 4, 9, 10, 11, or 12 (it pays 2:1 on a 12) and loses on all other rolls. Once the point is established you can place an ODDS BET of up to 10 times your line bet. This bet pays true odds if the point is rolled (that is, 2:1 if the point is 4 or 10, 3:2 if the point is 5 or 9, and 6:5 if the point is 6 or 8). If you accidentally place the wrong bet you can say REMOVE BET to remove the bet, and you can say REPEAT to hear the current bankroll and full set of bets you have up. Good luck!',
  // Launch.js
  'LAUNCH_WELCOME_BUTTON': 'Welcome to {0}.  Could the first person get us started by pressing an Echo Button?|Let\'s play {0}! Player one, press an Echo Button.|Would the first player press an Echo Button to play {0}?',
  'LAUNCH_NEED_BUTTONS': 'Sorry to play {0} you must have Echo Buttons.',
  'LAUNCH_REPROMPT': 'Would you like to play? ',
  // Remove.js
  'REMOVE_REPROMPT': 'What else can I help you with?',
  'REMOVE_CANTREMOVE_PASSBET': 'Sorry, you can\'t remove a line bet once a point has been established. ',
  'REMOVE_BET': 'Removing your bet of {0}. ',
  // From Repeat.js
  'READ_BETS': 'You bet {0}. ',
  'READ_POINT': 'The point is {0}. ',
  // Roll.js
  'ROLL_RESULT': 'Shooter got {0}. |The shooter rolled {0}. ',
  'ROLL_BUSTED': 'Player {0} lost all their money. Resetting their bankroll and clearing their bets. ',
  'ROLL_BUSTED_PLAYEROUT': 'Player {0} lost all their money. You\'re outta here! ',
  'ROLL_PLAYER_NUMBER': '<say-as interpret-as="ordinal">{0}</say-as> player |Player {0} ',
  'ROLL_NET_PUSH': ' You broke even. ',
  'ROLL_REPROMPT': 'Say roll to roll the dice.',
  'ROLL_COME_REPROMPT': 'Would you like to play another round?',
  'ROLL_POINT_ESTABLISHED': 'The point has been established. ',
  'ROLL_SEVEN_CRAPS': 'Craps 7! ',
  'ROLL_GOT_POINT': 'You rolled the point! ',
  'ROLL_OFF_TABLE': 'Oops, one of the dice fell off the table - rolling again. ',
  'ROLL_ALLPLAYERS_OUT': 'That\'s it, all players are out of money! ',
  'ROLL_NEW_SHOOTER': 'New shooter coming out! Player {0} let\'s roll! |Good run, now let\'s give the <say-as interpret-as="ordinal">{0}</say-as> player a turn! ',
  'ROLL_TAKE_ODDS': '<break time=\'300ms\'/> Now that the point is established, any player can place an odds bet. Just press your button and say place odds bet. ',
  // Unhandled.js
  'UNKNOWN_INTENT': 'Sorry, I didn\'t get that. Try saying Bet.',
  'UNKNOWN_ADDING_PLAYERS': 'Please press a new button to add players or one you\'ve already pressed to start the game.',
  'UNKNOWN_BETTING_PLAYER': 'You need to press a button first so I know who\'s talking.',
  'UNKNOWN_INTENT_REPROMPT': 'Try saying Bet.',
};

const dollar = {
  // From Bet.js
  'BET_EXCEEDS_ODDS': 'Sorry, this bet exceeds {0} times odds based on your line bet of ${1}.',
  'PASSBET_PLACED': '${0} pass bet placed.',
  'DONTPASSBET_PLACED': '${0} don\'t pass bet placed.',
  'ODDS_BET_PLACED': '${0} odds placed.',
  'FIELD_BET_PLACED': '${0} field bet placed.',
  'BET_DUPLICATE_NOT_ADDED': 'You already placed ${0} on this bet, and another ${1} would exceed the maximum bet of ${2}. ',
  // From Repeat.js
  'READ_BANKROLL': 'You have ${0}. ',
  // From Roll.js
  'ROLL_NET_WIN': ' You won ${0}. ',
  'ROLL_NET_LOSE': ' You lost ${0}. ',
  'ROLL_MISSING_BETS': 'Some players didn\'t get a bet in. I\'ll put them down for a pass bet at ${0}. ',
  // utils.js
  'SKILL_NAME': 'Craps Party',
  // From this file
  'FORMAT_PASSBET': '${0} on the pass line',
  'FORMAT_DONTPASSBET': '${0} on the don\'t pass line',
  'FORMAT_FIELDBET': '${0} field bet',
  'FORMAT_ODDSBET': '${0} odds bet',
  'FORMAT_OTHER': '${0}',
  'FORMAT_WITH_ODDS': ' with ${0} odds',
};

const pound = {
  // From Bet.js
  'BET_EXCEEDS_ODDS': 'Sorry, this bet exceeds {0} times odds based on your line bet of £{1}.',
  'PASSBET_PLACED': '£{0} pass bet placed.',
  'DONTPASSBET_PLACED': '£{0} don\'t pass bet placed.',
  'ODDS_BET_PLACED': '£{0} odds placed.',
  'FIELD_BET_PLACED': '£{0} field bet placed.',
  'BET_DUPLICATE_NOT_ADDED': 'You already placed £{0} on this bet, and another £{1} would exceed the maximum bet of £{2}. ',
  // From Repeat.js
  'READ_BANKROLL': 'You have £{0}. ',
  // From Roll.js
  'ROLL_NET_WIN': ' You won £{0}. ',
  'ROLL_NET_LOSE': ' You lost £{0}. ',
  'ROLL_MISSING_BETS': 'Some players didn\'t get a bet in. I\'ll put them down for a pass bet at £{0}. ',
  // utils.js
  'SKILL_NAME': 'Dice Party',
  // From this file
  'FORMAT_PASSBET': '£{0} on the pass line',
  'FORMAT_DONTPASSBET': '£{0} on the don\'t pass line',
  'FORMAT_FIELDBET': '£{0} field bet',
  'FORMAT_ODDSBET': '£{0} odds bet',
  'FORMAT_OTHER': '£{0}',
  'FORMAT_WITH_ODDS': ' with £{0} odds',
};

const resources = {
  'en-US': {
    'translation': Object.assign({}, common, dollar),
  },
  'en-GB': {
    'translation': Object.assign({}, common, pound),
  },
};

const utils = (handlerInput) => {
  const locale = handlerInput.requestEnvelope.request.locale;
  let translation;
  if (resources[locale]) {
    translation = resources[locale].translation;
  } else {
    translation = resources['en-US'].translation;
  }

  return {
    getString: function(res) {
      return pickRandomOption(handlerInput, translation[res]);
    },
    sayRoll: function(dice, point) {
      const totalFormat = {
        2: 'snake eyes|aces|craps 2|2',
        3: '3|craps 3',
        11: '11|11|yo 11',
        12: '12|boxcars|double sixes|12|craps 12',
      };
      const otherFormat = '{0} and {1} for a total of {2}|{0} and {1} making {2}|{0} and {1} <break time=\'300ms\'/> that\'s {2}';
      const hardFormat = 'double {0}s|' + otherFormat;
      const pimpleFormat1 = '{0} and a pimple making {2}|' + otherFormat;
      const pimpleFormat2 = '{1} and a pimple making {2}|' + otherFormat;
      const hard = (dice[0] === dice[1]);
      const total = dice[0] + dice[1];
      let format;

      if (totalFormat[total]) {
        format = pickRandomOption(handlerInput, totalFormat[total]);
      } else if (hard) {
        format = pickRandomOption(handlerInput, hardFormat);
      } else if (dice[0] === 1) {
        format = pickRandomOption(handlerInput, pimpleFormat2);
      } else if (dice[1] === 1) {
        format = pickRandomOption(handlerInput, pimpleFormat1);
      } else {
        format = pickRandomOption(handlerInput, otherFormat);
      }

      return format.replace('{0}', dice[0]).replace('{1}', dice[1]).replace('{2}', total);
    },
    sayBet: function(bet) {
      let format;
      let result;

      switch (bet.type) {
        case 'PassBet':
          format = translation['FORMAT_PASSBET'];
          break;
        case 'DontPassBet':
          format = translation['FORMAT_DONTPASSBET'];
          break;
        case 'FieldBet':
          format = translation['FORMAT_FIELDBET'];
          break;
        case 'OddsBet':
          format = translation['FORMAT_ODDSBET'];
          break;
        default:
          format = translation['FORMAT_OTHER'];
          break;
      }

      result = format.replace('{0}', bet.amount);
      if (bet.odds) {
        result += translation['FORMAT_WITH_ODDS'].replace('{0}', bet.odds);
      }

      return result;
    },
  };
};

module.exports = utils;

function pickRandomOption(handlerInput, res) {
  const event = handlerInput.requestEnvelope;
  const attributes = handlerInput.attributesManager.getSessionAttributes();

  const options = res.split('|');
  let seed = event.session.user.userId;
  if (attributes.currentGame && attributes[attributes.currentGame]
    && attributes[attributes.currentGame].timestamp) {
    seed += attributes[attributes.currentGame].timestamp;
  }
  return options[Math.floor(seedrandom(seed)() * options.length)];
}
