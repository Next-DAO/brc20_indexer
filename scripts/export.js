const fs = require("fs");
const { MongoClient } = require("mongodb");
const { getValidInscriptions } = require("./valid.js");

require("dotenv").config();

const client = new MongoClient(process.env.DB_URI);

const exportBRC20 = async (tick) => {
  const validInsctipitons = await getValidInscriptions(client, tick);
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
