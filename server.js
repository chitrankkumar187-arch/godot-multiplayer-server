const WebSocket = require("ws");
const http = require("http");
const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://dbchitrankrp:krgdcukOENV8AEo5@godotgame.iv80xeb.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

let db, accounts;

async function connectDB() {
	try {
		await client.connect();
		db = client.db("GodotGame");
		accounts = db.collection("accounts");
		console.log("🔥 MongoDB Connected");
	} catch (err) {
		console.log("❌ DB Error:", err);
	}
}
connectDB();

// ✅ REQUIRED FOR RENDER
const PORT = process.env.PORT || 10000;

const httpServer = http.createServer((req, res) => {
	res.writeHead(200);
	res.end("Server running");
});

httpServer.listen(PORT, "0.0.0.0", () => {
	console.log("🚀 HTTP running on", PORT);
});

const wss = new WebSocket.Server({ server: httpServer });

let clients = [];

wss.on("connection", (ws) => {
	console.log("🟢 Client connected");
	clients.push(ws);

	ws.on("message", async (message) => {
		let data;

		try {
			data = JSON.parse(message.toString());
		} catch {
			console.log("❌ Bad JSON");
			return;
		}

		// 🔐 SIGNUP
		if (data.type === "signup") {
			let user = await accounts.findOne({ username: data.username });

			if (user) {
				ws.send(JSON.stringify({ type: "signup_failed" }));
				return;
			}

			await accounts.insertOne({
				username: data.username,
				password: data.password,
				gc: 100,
				characters: {}
			});

			ws.send(JSON.stringify({ type: "signup_success" }));
			return;
		}

		// 🔑 LOGIN
		if (data.type === "login") {
			let user = await accounts.findOne({ username: data.username });

			if (!user || user.password !== data.password) {
				ws.send(JSON.stringify({ type: "login_failed" }));
				return;
			}

			ws.send(JSON.stringify({
				type: "login_success",
				gc: user.gc
			}));
			return;
		}

		// 💾 SAVE CHARACTER
		if (data.type === "save_character") {
			await accounts.updateOne(
				{ username: data.username },
				{
					$set: {
						[`characters.${data.server}.${data.slot}`]: {
							name: data.name,
							gender: data.gender
						}
					}
				},
				{ upsert: true }
			);

			ws.send(JSON.stringify({ type: "save_success" }));
			return;
		}

		// 📂 LOAD CHARACTERS
		if (data.type === "load_characters") {
			let user = await accounts.findOne({ username: data.username });

			ws.send(JSON.stringify({
				type: "characters_data",
				characters: user?.characters || {}
			}));
			return;
		}

		// 💬 CHAT
		if (data.type === "chat") {
			clients.forEach(c => {
				if (c.readyState === WebSocket.OPEN) {
					c.send(JSON.stringify(data));
				}
			});
			return;
		}

		// 🎮 PLAYER SYNC
		if (data.id && typeof data.x === "number") {
			clients.forEach(c => {
				if (c.readyState === WebSocket.OPEN) {
					c.send(JSON.stringify(data));
				}
			});
		}
	});

	ws.on("close", () => {
		console.log("🔴 Client disconnected");
		clients = clients.filter(c => c !== ws);
	});

	ws.on("error", (err) => {
		console.log("⚠️ Socket error:", err.message);
	});
});
