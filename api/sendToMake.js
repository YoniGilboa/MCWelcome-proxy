export default async function handler(req, res) {
  try {
    const userData = req.body;

    // no credits in Make right now, using webhook.site url instead, just to see that userData is sent and arrived properly
    //const response = await fetch("https://hook.eu2.make.com/35i403axct5gyl2xskvrpjmjflby8rg3", {
    const response = await fetch("https://webhook.site/b7286379-6a76-41a7-b449-4fa0e5fb89fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });

    res.status(200).json({ ok: true, status: response.status });
  } catch (err) {
    console.error("❌ Error sending to Make:", err);
    res.status(500).json({ error: err.message });
  }
}
