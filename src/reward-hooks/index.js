const Rewards = {
  BuriedPawggers: '5aa81e72-5708-434c-ac2e-3dd45e94aa2f',
  First: '18e618a5-476f-4f63-a353-8c6ff9b5562c',
};

module.exports = {
  [Rewards.BuriedPawggers]: require('./dig'),
  [Rewards.First]: require('./first'),
};
