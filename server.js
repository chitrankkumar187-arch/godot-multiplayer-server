const WebSocket = require("ws");
const { MongoClient } = require("mongodb");

// 🔥 YOUR MONGODB URI (PASTE YOURS HERE)
const uri = "mongodb+srv://dbchitrankrp:krgdcukOENV8AEo5.@godotgame.iv80xeb.mongodb.net/?appName=GodotGame";

const client = new MongoClient(uri);

let db, accounts;

// 🔥 CONNECT TO DATABASE
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

// 🔥 WEBSOCKET SERVER
const server = new WebSocket.Server({ port: 10000 });

let clients = [];

console.log("🚀 Server started on port 10000");

server.on("connection", (ws) => {
	console.log("🟢 Client connected");

	clients.push(ws);

	ws.on("message", async (message) => {
		let msg = message.toString();
		let data;

		// ✅ FIXED TRY CATCH
		try {
			data = JSON.parse(msg);
		} catch (err) {
			console.log("❌ Invalid JSON");
			return;
		}

		// =====================
		// 🔐 SIGNUP
		// =====================
		if (data.type === "signup") {
			try {
				let user = await accounts.findOne({ username: data.username });

				if (user) {
					ws.send(JSON.stringify({
						type: "signup_failed",
						reason: "User exists"
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
			} catch (err) {
				console.log("❌ Signup error:", err);
			}
			return;
		}

		// =====================
		// 🔑 LOGIN
		// =====================
		if (data.type === "login") {
			try {
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
			} catch (err) {
				console.log("❌ Login error:", err);
			}
			return;
		}

		// =====================
		// 🌍 GAME DATA (movement/chat)
		// =====================
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
});		} catch {
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
