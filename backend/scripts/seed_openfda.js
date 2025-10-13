import mongoose from "mongoose";
import axios from "axios";
import Drug from "../models/Drug.js";
import Supplier from "../models/Supplier.js";
import dotenv from "dotenv";
dotenv.config();

const OPENFDA_BASE = "https://api.fda.gov/drug/label.json";
const MONGO = process.env.MONGO_URI;

async function main() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("Connected to Mongo");

  // Optional: upsert a generic supplier
  const supplier = await Supplier.findOneAndUpdate(
    { name: "OpenFDA-Provider" },
    { name: "OpenFDA-Provider", status: "APPROVED" },
    { upsert: true, new: true }
  );

  // run several queries with different offsets
  const limit = 50; // per openFDA request (max 100)
  const pages = 5;   // total records ~ limit * pages
  for (let p=0; p<pages; p++){
    const skip = p * limit;
    const q = `${OPENFDA_BASE}?search=purpose:antibiotic&limit=${limit}&skip=${skip}`;
    try {
      const r = await axios.get(q);
      const results = r.data.results || [];
      for (const item of results) {
        const name = item.openfda && item.openfda.brand_name ? item.openfda.brand_name[0] : (item.id || "Unknown");
        const manufacturer = item.openfda && item.openfda.manufacturer_name ? item.openfda.manufacturer_name[0] : "Unknown";
        // create/drug doc
        await Drug.create({
          name,
          manufacturer,
          supplier: supplier._id,
          batchNumber: `OFD-${item.id || Date.now()}`,
          price: Math.round(Math.random() * 100),
          expiryDate: new Date(Date.now() + 365*24*3600*1000 * 1.5) // dummy
        });
      }
    } catch (err) {
      console.error("openFDA fetch error", err.message);
      // wait a bit then continue
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log("Seeding finished");
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
