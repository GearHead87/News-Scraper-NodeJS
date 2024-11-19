import axios from "axios";
import { JSDOM } from "jsdom";
import { setTimeout } from "timers/promises";
import { saveNews } from "./save-news";
import { NewsModel } from "../models/news";
import { connectToMongoDB } from "../db";

const collectNewsUrls = async (url: string) => {
  try {
    const { data } = await axios.get(url);

    const dom = new JSDOM(data);

    const titleElements = dom.window.document.querySelectorAll(
      '[data-testid="card-headline"]'
    );

    const linkElements = dom.window.document.querySelectorAll(
      'a:has([data-testid="card-headline"])'
    );

    const titles = Array.from(titleElements).map((element) => {
      return element.textContent;
    });

    const links = Array.from(linkElements).map((element) => {
      return element.getAttribute("href");
    });

    const articles: { url: string | null; title: string | null }[] = [];

    for (let i = 0; i < titles.length; i++) {
      const obj = {
        url: links[i],
        title: titles[i],
        content: "",
        status: "pending",
        imageUrl: "",
      };

      articles.push(obj);
    }

    return articles;
  } catch (error) {
    console.error(error);
  }
};

export const scrapeNewsDetails = async (url: string) => {
  try {
    const { data } = await axios.get(url);

    const dom = new JSDOM(data);

    const textElements = dom.window.document.querySelectorAll(
      '[data-component="text-block"] p'
    );

    const content = Array.from(textElements).map((element) => {
      return element.textContent;
    });

    const imageElement = dom.window.document.querySelectorAll(
      '[data-testid="hero-image"] img:last-of-type'
    );

    const imageUrl = imageElement[0]
      .getAttribute("srcset")
      ?.split(",")[0]
      .split(" ")[0];
    // console.log(content.join("\n"));
    return {
      content: content.join("\n"),
      imageUrl,
      url: url,
    };
  } catch (error) {
    throw error;
  }
};

// scrapeNewsDetails("https://www.bbc.com/news/articles/c7487y7x0vwo");

export const collectNewsDetails = async () => {
  // await connectToMongoDB("mongodb://localhost:27017/news-scraper");

  const pendignNews = await NewsModel.findOne({ status: "pending" });

  if (!pendignNews) {
    console.log("No pending news found");
    return;
  }

  console.log(pendignNews);
  try {
    let targetUrl = pendignNews.url;

    if (pendignNews.url.startsWith("/")) {
      targetUrl = `https://www.bbc.com${pendignNews.url}`;
      // pendignNews.url = `https://www.bbc.com${pendignNews.url}`;
    }

    const details = await scrapeNewsDetails(targetUrl);

    console.log("Details", details);

    if (!details) {
      console.log("No details found");
      return;
    }

    const updatedModel = await NewsModel.findOneAndUpdate(
      { url: pendignNews.url },
      {
        content: details.content,
        imageUrl: details.imageUrl,
        status: "done",
      },
      {
        new: true,
      }
    );

    console.log(updatedModel);
  } catch (error) {
    console.error(error);
    console.log("failed");

    const updatedModel = await NewsModel.findOneAndUpdate(
      { url: pendignNews.url },
      {
        status: "failed",
      },
      {
        new: true,
      }
    );
  }
};

// collectNewsDetails();
const URLS = [
  "https://www.bbc.com/news",
  "https://www.bbc.com/future-planet",
  "https://www.bbc.com/arts",
  "https://www.bbc.com/business",
];

export const collectAllNewsUrls = async () => {
  for (const url of URLS) {
    let articles: any = await collectNewsUrls(url);
    await saveNews(articles);
    await setTimeout(1000);
  }
};
