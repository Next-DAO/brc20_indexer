const axios = require("axios");
const { MongoClient } = require("mongodb");

require("dotenv").config();

const client = new MongoClient(process.env.DB_URI);
const ORD_URL = "https://turbo.ordinalswallet.com";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchInscriptions = async (offset) => {
  console.log(`Fethcing inscription list with offset: ${offset}...`);
  const res = await axios.get(`${ORD_URL}/inscriptions`, {
    params: {
      offset,
    },
  });
  return res.data;
};

const indexList = async () => {
  let offset = 0;

  while (true) {
    const data = await fetchInscriptions(offset);
    if (data.length == 0) {
      break;
    }
    offset += data.length;

    try {
      const database = client.db("ordinals");
      const inscriptions = database.collection("inscriptions");
      const result = await inscriptions.insertMany(data, { ordered: false });
    } catch (e) {
      if (e.name !== "MongoBulkWriteError") {
        await client.close();
        throw e;
      }
    }
  }

  await client.close();
  process.exit();
};

indexList();
