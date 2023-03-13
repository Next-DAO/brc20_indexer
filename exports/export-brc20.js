const fs = require("fs");
const { MongoClient } = require("mongodb");

require("dotenv").config();

const client = new MongoClient(process.env.DB_URI);

const getValidInscriptions = async (tick) => {
  const database = client.db("ordinals");
  const inscriptions = database.collection("inscriptions");

  const deployInsciptions = await inscriptions
    .find({ brc20: true, "content.tick": tick, "content.op": "deploy" })
    .sort({ num: 1 })
    .limit(1);
  const deployments = await deployInsciptions.toArray();
  const deployment = deployments[0];

  const maxSupply = parseInt(deployment.content.max, 10);

  const cursor = await inscriptions
    .find({
      brc20: true,
      num: { $gt: deployment.num },
      "content.tick": tick,
      "content.op": "mint",
      "content.amount": { $lte: parseInt(deployment.content.lim, 10) },
    })
    .collation({ locale: "en", strength: 2 })
    .sort({ num: 1 });
  const data = await cursor.toArray();

  let currentSupply = 0;
  const validInsctipitons = [];

  for (const item of data) {
    let validAmount = item.content.amount;

    currentSupply += validAmount;

    // stop when supply exceeded limit for the first time
    // but keep the last inscription as valid
    if (currentSupply >= maxSupply) {
      validAmount = maxSupply - (currentSupply - validAmount);
      currentSupply = maxSupply;

      console.log(
        `$${tick} supply at inscription #${item.num}: ${currentSupply}/${maxSupply}`
      );
      validInsctipitons.push({
        ...item,
        currentSupply,
        validAmount,
      });
      break;
    }

    console.log(
      `$${tick} supply at inscription #${item.num}: ${currentSupply}/${maxSupply}`
    );
    validInsctipitons.push({ ...item, currentSupply, validAmount });
  }
  return validInsctipitons;
};

const exportBRC20 = async (tick) => {
  const validInsctipitons = await getValidInscriptions(tick);
  const exportData = validInsctipitons.map((item) => ({
    inscriptionID: item.id,
    inscriptionNumber: item.num,
    currentSupply: item.currentSupply,
    created: item.metadata.created,
    genesisHeight: item.metadata.genesis_height,
    validAmount: item.validAmount,
  }));

  fs.writeFileSync(
    `./exports/${tick}.json`,
    JSON.stringify(exportData, null, 4)
  );

  process.exit();
};

const args = process.argv;
if (args.length <= 2) {
  throw new Error("brc-20 tick not specified!");
}

const tick = args[2];

exportBRC20(tick.trim().toLowerCase());
