const WebSocket = require("ws");
const { MongoClient } = require("mongodb");

// 🔥 YOUR MONGODB URI
const uri = "mongodb+srv://dbchitrankrp:krgdcukOENV8AEo5@godotgame.iv80xeb.mongodb.net/?appName=GodotGame";

const client = new MongoClient(uri);

let db, accounts;

async function connectDB() {
	try {
		await client.connect();
		db = client.db("GodotGame");
		accounts = db.collection("accounts");

		console.log("🔥 Connected to MongoDB");
	} catch (err) {
		console.log("❌ DB Error:", err);
	}
}

connectDB();

// 🌐 SERVER PORT
const PORT = process.env.PORT || 10000;
const server = new WebSocket.Server({ port: PORT });

let clients = [];

console.log("🚀 Server started");

// 🔌 CONNECTION
server.on("connection", (ws) => {
	console.log("🟢 Client connected");

	clients.push(ws);

	ws.on("message", async (message) => {
		let msg = message.toString();
		let data;

		try {
			data = JSON.parse(msg);
		} catch (err) {
			console.log("❌ Invalid JSON");
			return;
		}

		// 🔐 SIGNUP
		if (data.type === "signup") {
			try {
				let user = await accounts.findOne({ username: data.username });

				if (user) {
					ws.send(JSON.stringify({ type: "signup_failed" }));
					return;
				}

				await accounts.insertOne({
					username: data.username,
					password: data.password,
					gc: 100,
					characters: {} // 🔥 IMPORTANT
				});

				ws.send(JSON.stringify({ type: "signup_success" }));
				console.log("✅ Signup:", data.username);

			} catch (err) {
				console.log("❌ Signup error:", err);
			}
			return;
		}

		// 🔑 LOGIN
		if (data.type === "login") {
			try {
				let user = await accounts.findOne({ username: data.username });

				if (!user || user.password !== data.password) {
					ws.send(JSON.stringify({ type: "login_failed" }));
					return;
				}

				ws.send(JSON.stringify({
					type: "login_success",
					gc: user.gc
				}));

				console.log("🔓 Login:", data.username);

			} catch (err) {
				console.log("❌ Login error:", err);
			}
			return;
		}

		// 💾 SAVE CHARACTER
		if (data.type === "save_character") {
			try {
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
				console.log("💾 Character saved:", data.username);

			} catch (err) {
				console.log("❌ Save character error:", err);
			}
			return;
		}

		// 📂 LOAD CHARACTERS
		if (data.type === "load_characters") {
			try {
				let user = await accounts.findOne({ username: data.username });

				if (!user || !user.characters) {
					ws.send(JSON.stringify({
						type: "characters_data",
						characters: {}
					}));
					return;
				}

				ws.send(JSON.stringify({
					type: "characters_data",
					characters: user.characters
				}));

				console.log("📂 Sent characters:", data.username);

			} catch (err) {
				console.log("❌ Load characters error:", err);
			}
			return;
		}

		// 🌍 GAME + CHAT (BROADCAST)
		clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(msg);
			}
		});
	});

	ws.on("close", () => {
		console.log("🔴 Client disconnected");
		clients = clients.filter(c => c !== ws);
	});
});				});

				ws.send(JSON.stringify({ type: "signup_success" }));
				console.log("✅ Signup:", data.username);

			} catch (err) {
				console.log("❌ Signup error:", err);
			}
			return;
		}

		// 🔑 LOGIN
		if (data.type === "login") {
			try {
				let user = await accounts.findOne({ username: data.username });

				if (!user || user.password !== data.password) {
					ws.send(JSON.stringify({ type: "login_failed" }));
					return;
				}

				ws.send(JSON.stringify({
					type: "login_success",
					gc: user.gc
				}));

				console.log("🔓 Login:", data.username);

			} catch (err) {
				console.log("❌ Login error:", err);
			}
			return;
		}

		// 🌍 GAME DATA
		clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(msg);
			}
		});
	});

	ws.on("close", () => {
		console.log("🔴 Client disconnected");
		clients = clients.filter(c => c !== ws);
	});
});
