//
// Checks whether we can fulfill this intent
// Note that this is processed outside of the normal Alexa SDK
// So we cannot use alexa-sdk functionality here
//

'use strict';

module.exports = {
  check: function(event) {
    // Everything maps to Launch, so we can fulfill whatever you ask us to
    const universalIntents = ['AMAZON.RepeatIntent', 'AMAZON.FallbackIntent',
      'AMAZON.HelpIntent', 'AMAZON.YesIntent', 'AMAZON.NoIntent', 'AMAZON.StopIntent',
      'AMAZON.CancelIntent', 'PassBetIntent', 'DontPassBetIntent', 'OddsBetIntent', 'FieldBetIntent',
      'RemoveBetIntent', 'RollIntent'];

    // Default to a negative response
    const response = {
    'version': '1.0',
      'response': {
        'canFulfillIntent': {
          'canFulfill': 'NO',
          'slots': {},
        },
      },
    };

    // If this is one we understand regardless of attributes,
    // then we can just return immediately
    if (universalIntents.indexOf(event.request.intent.name) > -1) {
      // We can fulfill it - all slots are good
      let slot;

      response.response.canFulfillIntent.canFulfill = 'YES';
      for (slot in event.request.intent.slots) {
        if (slot) {
          response.response.canFulfillIntent.slots[slot] =
              {'canUnderstand': 'YES', 'canFulfill': 'YES'};
        }
      }
    }

    return response;
  },
};
