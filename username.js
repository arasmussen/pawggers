const async = require('async');
const fs = require('fs');
const path = require('path');
const twitch = require('./src/managers/twitch');

// const MediumWordsFilePath = path.resolve(__dirname, 'src/util/medium-words.txt');
const PrefixSuffixFilePath = path.resolve(__dirname, 'src/util/prefix-suffix-list.txt');
// const ShortWordsFilePath = path.resolve(__dirname, 'src/util/short-words.txt');

async function main() {
  const prefixSuffixList = await (await fs.promises.readFile(PrefixSuffixFilePath, 'utf8')).split('\n').filter((line, i) => {
    if (i === 0) {
      return 0;
    }
    return !!line;
  }).map((line, i) => {
    return line.split('\t')[2];
  });
  await async.eachSeries(prefixSuffixList, async (prefixSuffix) => {
    const replace = prefixSuffix.replace('+', 'sarah');
    const user = await twitch.getUserByName(replace);
    if (!user) {
      console.log(`${replace} is available`);
    }
  });
}

main();

