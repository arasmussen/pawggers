const TRIGGER_STATE = {};

// name: string key per trigger ("emmy_meeting", etc.)
// chance: 0–1 (e.g. 0.15 for 15%)
// cooldownMs: cooldown per trigger in ms
function shouldTrigger(name, chance, cooldownMs) {
  const now = Date.now();
  const last = TRIGGER_STATE[name] || 0;

  // cooldown check
  if (now - last < cooldownMs) return false;

  // random chance check
  if (Math.random() > chance) return false;

  TRIGGER_STATE[name] = now;
  return true;
}

function normalizeChannel(target) {
  if (!target) return target;
  return target.startsWith('#') ? target : `#${target}`;
}

// Twitch threaded reply: tmi.js say() cannot attach reply-parent-msg-id; use the socket when possible.
function sayAsReplyTo(client, target, context, text) {
  const parentId = context && context.id;
  const chan = normalizeChannel(target);
  const ws = client && client.ws;
  const wsOpen = ws && (ws.readyState === 1 || ws.readyState === ws.OPEN);
  if (parentId && chan && wsOpen) {
    const safe = String(text).replace(/\r|\n/g, ' ');
    ws.send(`@reply-parent-msg-id=${parentId} PRIVMSG ${chan} :${safe}`);
    return;
  }
  client.say(target, text);
}

// send a message with a small random delay so emmy feels more "alive"
function sayWithDelay(client, target, message, context) {
  const minDelay = 3000;
  const maxDelay = 8000;
  const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  setTimeout(() => {
    sayAsReplyTo(client, target, context, message);
  }, delay);
}

function handleEmmyReactions(client, target, context, message) {
  if (!client || !target || !message) return;

  // don't react to Emmy's own messages
  const authorName = (context && (context.username || context['display-name'] || '')).toLowerCase();
  if (authorName === 'emmydotjs') return;

  const msg = message.toLowerCase();

  // Emmy trigger #1: "meeting" / "call" / "zoom" → walk joke
  const MEETING_WORDS = ['meeting', 'call', 'zoom', 'meetings', 'calls'];
  const mentionsMeeting = MEETING_WORDS.some((w) => msg.includes(w));
  const isMeetingDoneCommand = msg.trim().startsWith('!meetingdone');

  if (mentionsMeeting && !isMeetingDoneCommand && shouldTrigger('emmy_meeting', 0.30, 90 * 1000)) {
    const lines = [
      'meeting... is that like walkies?',
      'another meeting? boooooring',
      "meetings sound suspiciously like times you're not throwing the ball for me.",
      'if that meeting could have been an email...',
      'good luck with your meeting! give me pets after',
      "don't forget about me during your boring meeting!",
    ];
    const line = lines[Math.floor(Math.random() * lines.length)];

    sayWithDelay(client, target, line, context);
  }

   // Emmy trigger #2: breaks / tired → gentle break enforcement
   const BREAK_WORDS = ['break', 'tired', 'exhausted', 'burnt out', 'burned out', 'eepy', 'sleepy'];
   const mentionsBreakOrTired = BREAK_WORDS.some((w) => msg.includes(w));
 
  if (mentionsBreakOrTired && shouldTrigger('emmy_break', 0.30, 90 * 1000)) {
     const lines = [
       'i prescribe one sip of water, one stretch, and at least five pets for me.',
       'break time! i fully support this paws.',
       "break time! what're we snacking on?",
       "finally break time! let's nap again!",
       'how was your pom? my nap was great thanks',
     ];
     const line = lines[Math.floor(Math.random() * lines.length)];
 
    sayWithDelay(client, target, line, context);
   }
 
   // Emmy trigger #3: meals → food gremlin
   const MEAL_WORDS = ['breakfast', 'lunch', 'dinner', 'snack', 'snacks', 'brunch'];
   const mentionsMeal = MEAL_WORDS.some((w) => msg.includes(w));
 
  if (mentionsMeal && shouldTrigger('emmy_meal', 0.30, 120 * 1000)) {
    const lines = [
      'food? i want food',
      'food? sharsies?',
      'nom can i have some?',
      'food? food? who said food? sniff sniff',
      'what are you having and how much is for me?',
      'i will taste test for you! woof woof',
      'food? you have my attention',
      'will do tricks for food!',
    ];
    const line = lines[Math.floor(Math.random() * lines.length)];

    sayWithDelay(client, target, line, context);
  }

  // Emmy trigger #4: naps → nap encouragement
  const NAP_WORDS = ['nap', 'napping', 'power nap', 'rest my eyes'];
  const mentionsNap = NAP_WORDS.some((w) => msg.includes(w));

  if (mentionsNap && shouldTrigger('emmy_nap', 0.30, 180 * 1000)) {
    const lines = [
      'i fully support horizontal productivity',
      'naps are the best',
      "i'm glad i was born a dog because naps",
      'a smol nap now means more energy for walkies and snacks later nise',
    ];
    const line = lines[Math.floor(Math.random() * lines.length)];

    sayWithDelay(client, target, line, context);
  }

  // Emmy trigger #5: emails → email feelings
  const EMAIL_WORDS = ['email', 'emails', 'inbox', 'outlook', 'gmail'];
  const mentionsEmail = EMAIL_WORDS.some((w) => msg.includes(w));

  if (mentionsEmail && shouldTrigger('emmy_email', 0.30, 120 * 1000)) {
    const lines = [
      'email me a treat!',
      'email me why dont cha Flirt',
    ];
    const line = lines[Math.floor(Math.random() * lines.length)];

    sayWithDelay(client, target, line, context);
  }
}

module.exports = {
  handleEmmyReactions,
};
 