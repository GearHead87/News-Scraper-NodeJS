import { connectToMongoDB } from "../db";
import { NewsModel } from "../models/news";

export async function saveNews(
  data: {
    title: string;
    content: string;
    url: string;
    status: string;
    imageUrl: string;
  }[]
) {
  const connection = await connectToMongoDB(process.env.DATABASE_URL as string);

  const existingDbNews = await NewsModel.find({});

  //check if the news already exists in the database
  const newData = data.filter((news) => {
    return !existingDbNews.find((dbNews) => dbNews.url === news.url);
  });
  console.log(newData);

  // remove news which contains /news/live or /video in url
  const filteredData = newData.filter((news) => {
    return !news.url.includes("/news/live") && !news.url.includes("/video");
  });

  try {
    await NewsModel.insertMany(filteredData);
  } catch (error) {
    console.log(error);
  }

  console.log("Data saved successfully");
}

// saveNews("data");
