const Rewards = {
  BuriedPawggers: '5aa81e72-5708-434c-ac2e-3dd45e94aa2f',
  CheckIn: 'de092f87-91af-43e6-912c-5026b12eab45',
  EarlyBirds: '18e618a5-476f-4f63-a353-8c6ff9b5562c',
  GiveawayEntry: '4ab117c9-da32-4ea6-b411-78bc65b4decd',
  Hydrate: '24bc0256-ad10-47c0-9564-b97fe440ec7a',
  PetEmmy: 'fc268e39-e2f4-4676-a1b4-dfc8282d9336',
};

module.exports = {
  [Rewards.BuriedPawggers]: require('./dig'),
  [Rewards.CheckIn]: require('./checkin'),
  [Rewards.EarlyBirds]: require('./earlybirds'),
  [Rewards.GiveawayEntry]: require('./giveawayentry'),
  [Rewards.Hydrate]: require('./hydrate'),
  [Rewards.PetEmmy]: require('./petemmy'),
};
