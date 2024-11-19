import { model, Schema } from "mongoose";

const NewsSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: false },
  url: { type: String, required: true, unique: true },
  status: { type: String, required: true },
  imageUrl: { type: String, required: false },
});

export const NewsModel = model("News", NewsSchema);
