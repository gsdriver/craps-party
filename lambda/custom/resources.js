// Localized resources

const seedrandom = require('seedrandom');

const common = {
  // AddPlayer.js
  'ADDPLAYER_NEED_NAME': 'Sorry, I didn\'t get that Please say a name for this player.',
  'ADDPLAYER_CONFIRM_NAME': 'I heard {0}. Is that correct?|Sounds like {0} is ready to play. Did I get that name correct?',
  'ADDPLAYER_SAME_PERSON': 'This sounds like {0}. Please have a different person speak up.',
  'ADDPLAYER_SAME_PERSON_REPROMPT': 'Please have a different person give their name.',
  // Bet.js
  'BET_INVALID_REPROMPT': 'What else can I help you with?',
  'BET_NEED_NAME': 'Sorry I\'m not sure who is placing this bet. Who is this?|Sorry, who is this?',
  'BET_NO_BETFORODDS': 'Sorry, there is no bet to place odds on. ',
  'INVALID_BET_NO_POINT': 'Sorry, this bet can\'t be played until a point has been established. Try saying roll to roll the dice.',
  'INVALID_BET_POINT': 'Sorry, this bet can\'t be played once a point has been established. Try placing an odds bet or a field bet <break time=\'300ms\'/> or say roll to roll the dice.',
  'INVALID_BET_HAVE_LINEBET': 'Sorry, you already have a line bet in play. Try another type of bet like an odds bet or a field bet <break time=\'300ms\'/> or say roll to roll the dice.',
  'BET_DUPLICATE_ADDED': 'Adding to your existing bet for a total of ',
  'BET_PLACED_REPROMPT_PERSONAL': 'Anyone else want to yell out a bet? Or say roll to roll the dice.',
  'BET_PLACED_REPROMPT_NONPERSONAL': '{0}, you can place a bet. Or say roll to roll the dice.',
  'BET_PLACED_REPROMPT_NONPERSONAL_ROLL': 'Say roll to roll the dice.',
  'BET_WRONG_NAME': 'Sorry, {0} is not on my list of players. Is this {1}?',
  // ConfirmName.js
  'CONFIRMNAME_NEXT': 'Great. Please say the name of the next player.|Got it. Who is the next player?',
  'CONFIRMNAME_NEXT_REPROMPT': 'What is the name of the next player?',
  'CONFIRMNAME_PLAY_PERSONAL': 'OK, we have all the players names. You can start playing by saying your bet in any order.',
  'CONFIRMNAME_PLAY_NONPERSONAL': 'OK, we have all the player names. Let\'s play! {0}, you first. Place a bet.',
  'CONFIRMNAME_PLAY_REPROMPT': 'Place a bet to start playing.',
  'CONFIRMNAME_TRYAGAIN': 'Please say your name again.',
  // Exit.js
  'EXIT_GAME': '{0} {1} Goodbye.',
  'EXIT_COME_BACK': 'Come back later if you want to resume this game of {0} <break time=\'300ms\'/>',
  // Help.js
  'HELP_ADDING_PLAYERS': 'Say the name of the first player ',
  'HELP_ADDING_PLAYERS_ADDED': 'Say the name of the next player you would like to add. Once we have all players registered, we can start to play the game.',
  'HELP_INGAME': 'You can say roll to roll the dice <break time=\'300ms\'/> or have any player say a bet. Refer to the help card to see what bets you can place.',
  'HELP_REPROMPT': 'What else can I help you with?',
  'HELP_CARD_TEXT': '{0} is a fast-paced game played with a pair of dice. On the first roll of the dice a total of 7 or 11 wins while a roll of 2, 3, or 12 loses.  Any other roll establishes a point. You continue rolling the dice until you either roll the point again (and win), or roll a 7 (and lose).\n  To start the game, have each player say their name. Players can then place their bets. You must bet a line bet which is either a PASS BET which pays if the shooter wins according to the rules above, or a DON\'T PASS bet which will pay if the shooter loses (it pushess if the initial roll is 12). Any player who doesn\'t place a line bet before the shooter rolls the dice will automatically place a pass bet at the table minimum. You can also place a FIELD BET which which pays if the next roll is 2, 3, 4, 9, 10, 11, or 12 (it pays 2:1 on a 12) and loses on all other rolls. Once the point is established you can place an ODDS BET of up to 10 times your line bet. This bet pays true odds if the point is rolled (that is, 2:1 if the point is 4 or 10, 3:2 if the point is 5 or 9, and 6:5 if the point is 6 or 8). If you accidentally place the wrong bet you can say REMOVE BET to remove the bet, and you can say REPEAT to hear the current bankroll and full set of bets you have up. Good luck!',
  // Launch.js
  'LAUNCH_WELCOME_INPROGRESS': 'Welcome back to {0}. You have a game in progress with {1}. Would you like to continue that game?',
  'LAUNCH_WELCOME': 'Welcome to the fast action game of {0}. How many people are playing today?|Ready for some fun? Let\'s play {0}! How many people are playing today?|To get us started with the fast action game of {0}, tell me how many people are playing.',
  'LAUNCH_REPROMPT': 'How many people are playing?',
  'LAUNCH_GOOD_MORNING': 'Good morning <break time=\"200ms\"/> ',
  'LAUNCH_GOOD_AFTERNOON': 'Good afternoon <break time=\"200ms\"/> ',
  'LAUNCH_GOOD_EVENING': 'Good evening <break time=\"200ms\"/> ',
  // PlayerCount.js
  'PLAYERCOUNT_NEED_COUNT': 'Please tell me how many people are playing this game.',
  'PLAYERCOUNT_BAD_COUNT': 'This game supports 1 to 4 players.',
  'PLAYERCOUNT_BAD_COUNT_REPROMPT': 'Please say a number of players between 1 and 4.',
  'GETPLAYER_NAME': 'What is the name of the <say-as interpret-as="ordinal">{0}</say-as> player?',
  'GETPLAYER_NAME_REPROMPT': 'Please tell me the player\'s name.',
  // ResumeGame.js
  'RESUMEGAME_WELCOME_BACK': 'Welcome back! {0} Place a bet or say roll to roll the dice.',
  'RESUMEGAME_PLAY_REPROMPT': 'Place a bet or say roll to roll the dice.',
  'RESUMEGAME_TRYAGAIN': 'Please say yes or no to let me know if you want to resume your game.',
  'RESUMEGAME_NO': 'OK. How many people are playing today?',
  'RESUMEGAME_NO_REPROMPT': 'How many people are playing?',
  // Remove.js
  'REMOVE_REPROMPT': 'What else can I help you with?',
  'REMOVE_CANTREMOVE_PASSBET': 'Sorry, you can\'t remove a line bet once a point has been established. ',
  'REMOVE_BET': 'Removing your bet of {0}. ',
  // From Repeat.js
  'READ_BETS': 'You bet {0}. ',
  'READ_POINT': 'The point is {0}. ',
  // Roll.js
  'ROLL_RESULT': '{1} got {0} <break time=\'300ms\'/> |{1} rolled {0} <break time=\'300ms\'/> |{0} <break time=\'300ms\'/> |The dice came up {0} <break time=\'300ms\'/> |It\'s {0} <break time=\'300ms\'/> ',
  'ROLL_BUSTED': '{0} lost all their money. Resetting their bankroll and clearing their bets. ',
  'ROLL_BUSTED_PLAYEROUT': '{0} lost all their money. You\'re outta here! ',
  'ROLL_NET_PUSH': ' You broke even. ',
  'ROLL_REPROMPT': 'Say roll to roll the dice.',
  'ROLL_COME_REPROMPT': 'Would you like to play another round?',
  'ROLL_POINT_ESTABLISHED': 'The point has been established. ',
  'ROLL_SEVEN_CRAPS': 'Craps 7! ',
  'ROLL_GOT_POINT': 'You rolled the point! |That\'s the point! ',
  'ROLL_OFF_TABLE': 'Oops, one of the dice fell off the table - rolling again. ',
  'ROLL_ALLPLAYERS_OUT': 'That\'s it, all players are out of money! Come back soon to play {0} again! ',
  'ROLL_NEW_SHOOTER': 'New shooter coming out! {0} let\'s roll! |Good run, now let\'s give {0} a turn! ',
  'ROLL_TAKE_ODDS': '<break time=\'300ms\'/> Any player can now place an odds bet up to {0} times their line bet. <amazon:effect name="whispered">It\'s the best bet in the house.</amazon:effect> Just say place odds bet or ',
  // Unhandled.js
  'UNKNOWN_INTENT': 'Sorry, I didn\'t get that. Try saying Bet.',
  'UNKNOWN_ADDING_PLAYERS': 'Please say a name to continue adding players before starting to play.',
  'UNKNOWN_INTENT_REPROMPT': 'Try saying Bet.',
  'UNKNOWN_PLAYER_COUNT': 'Please tell me how many people are playing before we start.',
};

const dollar = {
  // From Bet.js
  'BET_EXCEEDS_ODDS': 'Sorry, this bet exceeds {0} times odds based on your line bet of ${1}. ',
  'PASSBET_PLACED': '${0} pass bet placed for {2}. ',
  'DONTPASSBET_PLACED': '{2} placed a ${0} don\'t pass bet. ',
  'ODDS_BET_PLACED': '${0} odds placed for {2}. |{2}, I got your odds placed for ${0}. ',
  'FIELD_BET_PLACED': '${0} field bet placed for {2}. |${0} on the field for {2}. ',
  'BET_DUPLICATE_NOT_ADDED': 'You already placed ${0} on this bet, and another ${1} would exceed the maximum bet of ${2}. ',
  // From Exit.js
  'EXIT_STATUS_ONE_PLAYER': 'You have ${0}.',
  'EXIT_STATUS_LEADER': '{0} is in the lead with ${1}.',
  'EXIT_STATUS_NO_LEADER': 'OK, here\'s where we stand.',
  // From Repeat.js
  'READ_BANKROLL': 'You have ${0}. ',
  // From Roll.js
  'ROLL_NET_WIN': ' You won ${0}. | Congrats you won ${0}. | Collect your ${0} winnings. | Here\'s ${0}. ',
  'ROLL_NET_LOSE': ' You lost ${0}. | Sorry you lost ${0}. | Tough break you lost ${0}. ',
  'ROLL_ONE_MISSING': 'One of you didn\'t get a bet in. I\'ll put that person down for a pass bet at ${0}. ',
  'ROLL_MISSING_BETS': 'Some players didn\'t get a bet in. I\'ll put them down for a pass bet at ${0}. ',
  // utils.js
  'SKILL_NAME': 'Party Craps',
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
  'BET_EXCEEDS_ODDS': 'Sorry, this bet exceeds {0} times odds based on your line bet of £{1}. ',
  'PASSBET_PLACED': '£{0} pass bet placed for {2}. ',
  'DONTPASSBET_PLACED': '{2} placed a £{0} don\'t pass bet. ',
  'ODDS_BET_PLACED': '£{0} odds placed for {2}. |{2}, I got your odds placed for £{0}. ',
  'FIELD_BET_PLACED': '£{0} field bet placed for {2}. |£{0} on the field for {2}. ',
  'BET_DUPLICATE_NOT_ADDED': 'You already placed £{0} on this bet, and another £{1} would exceed the maximum bet of £{2}. ',
  // From Repeat.js
  'READ_BANKROLL': 'You have £{0}. ',
  // From Roll.js
  'ROLL_NET_WIN': ' You won £{0}. | Congrats you won £{0}. | Collect your £{0} winnings. | Here\'s £{0}. ',
  'ROLL_NET_LOSE': ' You lost £{0}. | Sorry you lost £{0}. | Tough break you lost £{0}. ',
  'ROLL_ONE_MISSING': 'One of you didn\'t get a bet in. I\'ll put that person down for a pass bet at £{0}. ',
  'ROLL_MISSING_BETS': 'Some players didn\'t get a bet in. I\'ll put them down for a pass bet at £{0}. ',
  // utils.js
  'SKILL_NAME': 'Party Dice',
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
    sayPlayerBankroll: function(player) {
      if (locale === 'en-GB') {
        return `${player.name} with ${player.bankroll} pounds`;
      } else {
        return `${player.name} with ${player.bankroll} dollars`;
      }
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
  if (attributes.temp) {
    attributes.temp.stringCount = (attributes.temp.stringCount + 1) || 1;
    seed += attributes.temp.stringCount;
  }
  if (attributes.currentGame && attributes[attributes.currentGame]
    && attributes[attributes.currentGame].timestamp) {
    seed += attributes[attributes.currentGame].timestamp;
  }
  return options[Math.floor(seedrandom(seed)() * options.length)];
}
