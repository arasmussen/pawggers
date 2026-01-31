module.exports = {
  // emmyfest
  //'!top5': require('./top5'),

  // misc
  '!buildraidmsg': require('./buildraidmsg'),
  '!giveawayentries': require('./giveawayentries'),
  '!giveawaywinner': require('./giveawaywinner'),
  '!testtesttest': require('./giveawaywinner'),
  '!startbreak': require('./startbreak'),

  // pawggers
  '!give': require('./give'),
  '!lb': require('./leaderboard'),
  '!leaderboard': require('./leaderboard'),
  '!pawggers': require('./pawggers'),
  '!pirates': require('./pirates'),
  '!points': require('./pawggers'),
  '!top': require('./leaderboard'),
  '!finalwheel': require('./finalwheel'),

  // quotes
  '!t': require('./t'),

  // task
  '!add': require('./task'),
  '!addtask': require('./task'),
  '!c': require('./task'),
  '!check': require('./task'),
  '!complete': require('./done'),
  '!delete': require('./removetask'),
  '!done': require('./done'),
  '!donefortheday': require('./pomsdone'),
  '!donetask': require('./done'),
  '!edit': require('./edittask'),
  '!edittask': require('./edittask'),
  '!finished': require('./done'),
  '!log': require('./log'),
  '!mytask': require('./task'),
  '!next': require('./next'),
  '!now': require('./task'),
  '!pomsdone': require('./pomsdone'),
  '!removetask': require('./removetask'),
  '!summary': require('./summary'),
  '!take': require('./take'),
  '!task': require('./task'),
  '!taskadd': require('./task'),
  '!taska': require('./task'),
  '!taskedit': require('./edittask'),
  '!taskd': require('./done'),
  '!taskdone': require('./done'),
  '!taskrecord': require('./taskrecord'),
  '!todo': require('./task'),

  // ttol
  '!guess': require('./ttol'),
  '!ttol': require('./ttol'),
  '!ttolanswer': require('./ttolend'),
  '!ttolend': require('./ttolend'),
  '!ttolstart': require('./ttolstart'),
  '!ttolguesses': require('./ttolguesses'),

  '!h': require('../reward-hooks/hydrate.js'),
};