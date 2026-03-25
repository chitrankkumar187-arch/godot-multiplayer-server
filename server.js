const WebSocket = require("ws");
const { MongoClient } = require("mongodb");

const server = new WebSocket.Server({ port: 10000 });

const uri = "mongodb+srv://dbchitrankrp:krgdcukOENV8AEo5.@godotgame.iv80xeb.mongodb.net/?appName=GodotGame"; // 🔥 paste here

const client = new MongoClient(uri);

let db, accounts;

async function connectDB() {
	await client.connect();
	db = client.db("GodotGame");
	accounts = db.collection("accounts");

	console.log("🔥 Connected to MongoDB");
}

connectDB();

let clients = [];

console.log("🚀 Server started on port 10000");

server.on("connection", (ws) => {
	console.log("🟢 Client connected");

	clients.push(ws);

	ws.on("message", async (message) => {
		let msg = message.toString();
		let data;

		try {
			data = JSON.parse(msg);
		} catch {
			return;
		}

		// =====================
		// 🔐 SIGNUP
		// =====================
		if (data.type === "signup") {
			let user = await accounts.findOne({ username: data.username });

			if (user) {
				ws.send(JSON.stringify({
					type: "signup_failed"
				}));
				return;
			}

			await accounts.insertOne({
				username: data.username,
				password: data.password,
				gc: 100
			});

			ws.send(JSON.stringify({
				type: "signup_success"
			}));

			console.log("✅ Signup:", data.username);
			return;
		}

		// =====================
		// 🔑 LOGIN
		// =====================
		if (data.type === "login") {
			let user = await accounts.findOne({ username: data.username });

			if (!user || user.password !== data.password) {
				ws.send(JSON.stringify({
					type: "login_failed"
				}));
				return;
			}

			ws.send(JSON.stringify({
				type: "login_success",
				gc: user.gc
			}));

			console.log("🔓 Login:", data.username);
			return;
		}

		// =====================
		// 🌍 GAME DATA
		// =====================
		clients.forEach((c) => {
			if (c.readyState === WebSocket.OPEN) {
				c.send(msg);
			}
		});
	});

	ws.on("close", () => {
		clients = clients.filter(c => c !== ws);
		console.log("🔴 Client disconnected");
	});
});			data = JSON.parse(msg);
		} catch {
			return;
		}

		let db = loadDB();

		// =========================
		// 🔐 SIGNUP SYSTEM
		// =========================
		if (data.type === "signup") {
			if (db[data.username]) {
				ws.send(JSON.stringify({
					type: "signup_failed",
					reason: "User already exists"
				}));
				return;
			}

			db[data.username] = {
				password: data.password,
				gc: 100 // 🎁 starter coins
			};

			saveDB(db);

			ws.send(JSON.stringify({
				type: "signup_success"
			}));

			console.log("✅ New account:", data.username);
			return;
		}

		// =========================
		// 🔑 LOGIN SYSTEM
		// =========================
		if (data.type === "login") {
			if (!db[data.username]) {
				ws.send(JSON.stringify({
					type: "login_failed"
				}));
				return;
			}

			if (db[data.username].password !== data.password) {
				ws.send(JSON.stringify({
					type: "login_failed"
				}));
				return;
			}

			ws.send(JSON.stringify({
				type: "login_success",
				gc: db[data.username].gc
			}));

			console.log("🔓 Login:", data.username);
			return;
		}

		// =========================
		// 🌍 NORMAL GAME DATA
		// =========================
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
});			return;
		}

		// 💬 CHAT → BROADCAST
		if (data.type === "chat") {
			clients.forEach((client) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(msg);
				}
			});
			return;
		}

		// 🎮 PLAYER DATA → BROADCAST
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
