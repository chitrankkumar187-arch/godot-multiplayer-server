const WebSocket = require("ws");
const fs = require("fs");

const server = new WebSocket.Server({ port: 10000 });

let clients = [];

// 📂 DATABASE FILE
const DB_FILE = "accounts.json";

// 🔥 LOAD DATABASE
function loadDB() {
	if (!fs.existsSync(DB_FILE)) {
		fs.writeFileSync(DB_FILE, JSON.stringify({}));
	}
	return JSON.parse(fs.readFileSync(DB_FILE));
}

// 💾 SAVE DATABASE
function saveDB(db) {
	fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

console.log("🚀 Server started on port 10000");

server.on("connection", (ws) => {
	console.log("🟢 New client connected");

	clients.push(ws);

	ws.on("message", (message) => {
		let msg = message.toString();
		console.log("📩 Received:", msg);

		let data;
		try {
			data = JSON.parse(msg);
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
