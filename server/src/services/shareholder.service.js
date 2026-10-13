
import Counter from "../models/Counter.js";

export async function generateShareholderCode() {
  const counter = await Counter.findOneAndUpdate(
    { _id: "shareholder" },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );

  return `SH-${String(counter.sequence).padStart(5, "0")}`;
}
