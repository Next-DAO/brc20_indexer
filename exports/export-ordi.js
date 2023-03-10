const fs = require("fs");
const _ = require("underscore");
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
    .sort({ num: 1 });
  const data = await cursor.toArray();

  let currentSupply = 0;
  const validInsctipitons = [];

  for (const item of data) {
    currentSupply += item.content.amount;
    if (currentSupply > maxSupply) {
      break;
    }
    console.log(
      `$${tick} supply at inscription #${item.num}: ${currentSupply}/${maxSupply}`
    );
    validInsctipitons.push({ ...item, currentSupply: currentSupply });
  }
  return validInsctipitons;
};

const exportOrdi = async () => {
  const validInsctipitons = await getValidInscriptions("ordi");
  const exportData = validInsctipitons.map((item) => ({
    inscriptionID: item.id,
    inscriptionNumber: item.num,
    currentSupply: item.currentSupply,
    created: item.metadata.created,
    genesisHeight: item.metadata.genesis_height,
    content: item.content,
  }));

  fs.writeFileSync("./ordi.json", JSON.stringify(exportData, null, 4));

  process.exit();
};

exportOrdi();
