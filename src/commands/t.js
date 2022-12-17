const { ClientRequest } = require('http');
const isSarah = require('../util/isSarah');

module.exports = function(context) {
  const { client, target } = context;

  // data validation
  if (!context?.['display-name'] ||
      !context?.['user-id']) {
    console.log('validation failed');
    return;
  }

  // get user
  const user = {
    id: context['user-id'],
    name: context['display-name'],
  };

  // return if not sarah
  if (!isSarah(user.id)) {
    return;
  }

  // get mode
  const mode = context.variables.join(' ').trim().toLowerCase();

  // random encouragement
  const pomQuoteList = [
    '“Your talent determines what you can do. Your motivation determines how much you’re willing to do. Your attitude determines how well you do it.” — Lou Holtz',
    '“Light tomorrow with today.” — Elizabeth Barrett Browning',
    '“Never give up on a dream just because of the time it will take to accomplish it. The time will pass anyway.” — Earl Nightingale',
    '“Someday is not a day of the week.” — Janet Dailey',
    '“Success is a state of mind. If you want success, start thinking of yourself as a success.” — Joyce Brothers',
    '"You\'ve got to get up every morning with determination if you\'re going to go to bed with satisfaction.” – George Lorimer',
    '“The man who moves a mountain begins by carrying away small stones.” – Confucius',
    '"Go as far as you can see; when you get there, you\'ll be able to see further." – Thomas Carlyle',
    '"The individual who says it is not possible should move out of the way of those doing it." – Tricia Cunningham',
    '"A year from now you may wish you had started today." – Karen Lamb',
    '"Someday is not a day of the week." – Janet Dailey',
    '"Don’t count the days, make the days count." – Muhammad Ali',
    '"The question isn\'t who is going to let me, it\'s who is going to stop me." – Ayn Rand',
    '"You miss 100% of the shots you don\'t take." – Wayne Gretzky',
    '"Action is the foundational key to all success." – Pablo Picasso',
    '"The way to get started is to quit talking and begin doing." – Walt Disney',
    '"Starve your distraction and feed your focus." – Unknown',
    '"You don\'t have to see the whole staircase, just take the first step." – Martin Luther King',
    '"Tomorrow hopes we have learned something from yesterday." – John Wayne',
    '"Lost time is never found." – Benjamin Franklin',
    '"Nothing is impossible. The word itself says: I\'M POSSIBLE!" – Audrey Hepburn',
    '"A river cuts through a rock not because of its power but its persistence." – Jim Watkins',
    '"You cannot swim for new horizons until you have courage to lose sight of the shore." – William Faulkner',
    '"The expert in anything was once a beginner." – Helen Hayes',
    '"You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose." – Dr. Seuss',
    '"In the book of life, the answers aren\'t in the back." – Charlie Brown',
    '"Success doesn’t come to you, you go to it.” – Marva Collins',
    '"Power\'s not given to you. You have to take it." ― Beyoncé',
    '"If people only knew how hard I\'ve worked to gain my mastery, it wouldn\'t seem so wonderful at all." – Michelangelo',
    '"The only place where success comes before work is in the dictionary." – Vidal Sassoon',
    '"I\'ve failed over and over and over again in my life. And that is why I succeed." – Michael Jordan',
    '"You\'re off to great places, today is your day. Your mountain is waiting, so get on your way." – Dr. Seuss',
    '"Keep your face always toward the sunshine, and shadows will fall behind you." – Walt Whitman',
    '"Tumble outta bed and I stumble to the kitchen. Pour myself a cup of ambition." – Dolly Parton',
    '"Ambition is a dream with a V8 engine." – Elvis Presley',
    '"Be so happy that, when other people look at you, they become happy too." – Anonymous',
    '"Choose to be optimistic, it feels better." – Dalai Lama',
    '"The bad news is time flies. The good news is you\'re the pilot." – Michael Altshuler',
    '"The sky does not begin at the stars, but at the tip of the grass blades." – Mor Jokai'
  ];
  const pomQuote = pomQuoteList[Math.floor(Math.random() * pomQuoteList.length)];
  const breakQuoteList = [
    'It\'s break time! Good stuff everyone!',
    'We made it fam—break time!',
    'Woof woof it\'s break time!',
    'Way to get that bread y\'all. How\'s about a break?',
    'Another pom for the books! Let\'s take a break',
    'Phew, pom done! Break time!',
    'Break time pawggers!',
    'Good job everyone! It\'s break time!',
  ];
  const breakQuote = breakQuoteList[Math.floor(Math.random() * breakQuoteList.length)];

  // print result
  if (mode === 'pom') {
    setTimeout(() => {
      client.say(target, `It's pom time! Here's your motivational quote:`);
    }, 500);
    setTimeout(() => {
      client.say(target, `${pomQuote}`);
    }, 700);
  } else if (mode === 'break') {
    client.say(target, `${breakQuote}`);
  }
}
