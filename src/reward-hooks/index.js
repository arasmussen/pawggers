const Rewards = {
  BuriedPawggers: '5aa81e72-5708-434c-ac2e-3dd45e94aa2f',
  First: '18e618a5-476f-4f63-a353-8c6ff9b5562c',
  PetEmmy: 'fc268e39-e2f4-4676-a1b4-dfc8282d9336',
};

module.exports = {
  [Rewards.BuriedPawggers]: require('./dig'),
  [Rewards.First]: require('./first'),
  [Rewards.PetEmmy]: require('./petemmy'),
};
