import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Only POST requests allowed" });
  }

  const { fullname, email, company, status } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid or missing email" });
  }

  const contact = {
    name: fullname?.trim() || "Not provided",
    email: email.toLowerCase().trim(),
    company: company?.trim() || null,
    status: status?.trim() || "lead",
    created_at: new Date()
  };

  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("Client");
    const collection = db.collection("contacts");
    const result = await collection.insertOne(contact);

    res.status(200).json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
}
