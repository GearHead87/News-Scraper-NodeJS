import cron from "node-cron";
import { setTimeout } from "timers/promises";
import { collectAllNewsUrls, collectNewsDetails } from "./index";
import { connectToMongoDB } from "../db";

// cron.schedule("*/10 * * * *", () => {
// collectAllNewsUrls();
// });

// cron.schedule("*/2 * * * * *", () => {
const collectAllDetails = async () => {
  await connectToMongoDB("mongodb://localhost:27017/news-scraper");
  while (true) {
    await collectNewsDetails();
    await setTimeout(1000);
  }
};
collectAllDetails();
// });
