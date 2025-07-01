require("dotenv").config();
const { Client, GatewayIntentBits, Partials } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

client.on("ready", () => {
  console.log(`🟢 Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const input = message.content.trim().toUpperCase();

  if (!/^\/speshy\s+[1-9X_]{6}$/.test(input)) return;

  const code = input.split(" ")[1].split("").map((c) =>
    c === "X" || c === "_" ? null : c
  );

  const known = new Set(code.filter(Boolean));
  const pool = [..."123456789"].filter((d) => !known.has(d));
  const unknownIndices = code
    .map((val, idx) => (val ? null : idx))
    .filter((x) => x !== null);

  const results = [];

  function fillAndPush(permutation) {
    const filled = [...code];
    unknownIndices.forEach((idx, i) => {
      filled[idx] = permutation[i];
    });
    results.push(filled.join(""));
  }

  function permute(arr, path = []) {
    if (path.length === unknownIndices.length) {
      fillAndPush(path);
      return;
    }
    for (let i = 0; i < arr.length; i++) {
      permute(
        [...arr.slice(0, i), ...arr.slice(i + 1)],
        [...path, arr[i]]
      );
    }
  }

  permute(pool);

  const reply =
    results.length > 0
      ? `Found ${results.length} possible codes:\n` +
        results.slice(0, 50).join("\n") +
        (results.length > 50 ? "\n... (truncated)" : "")
      : "No valid codes found.";

  message.reply(reply);
});

client.login(process.env.DISCORD_TOKEN);
