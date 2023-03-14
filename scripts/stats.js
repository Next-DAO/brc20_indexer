const fs = require("fs");
const _ = require("underscore");
const { MongoClient } = require("mongodb");
const { getValidInscriptions } = require("./valid.js");

require("dotenv").config();

const client = new MongoClient(process.env.DB_URI);

const stats = async (tick) => {
  const validInsctipitons = await getValidInscriptions(client, tick);
  const content = validInsctipitons.map((i) => ({
    validAmount: i.validAmount,
  }));
  const first = validInsctipitons[0];
  const last = validInsctipitons.slice(-1)[0];

  console.log(`Total valid $${tick} mint inscriptions: ${content.length}`);
  console.log(
    `First valid $${tick} mint inscription: ${first.id} (Inscription #${first.num})`
  );
  console.log(
    `Last valid $${tick} mint inscription: ${last.id} (inscription #${last.num})`
  );
  console.log(`Valid mint inscriptions range: [${first.num}, ${last.num}]`);

  const counts = _.countBy(content, "validAmount");
  const list = _.map(counts, (count, key) => ({
    validAmount: key,
    Count: count,
  }));
  const sorted = _.sortBy(list, "Count").reverse();

  console.log("Valid amount distribution:");
  console.table(sorted);

  process.exit();
};

const args = process.argv;
if (args.length <= 2) {
  throw new Error("brc-20 tick not specified!");
}

const tick = args[2];

stats(tick.trim().toLowerCase());
