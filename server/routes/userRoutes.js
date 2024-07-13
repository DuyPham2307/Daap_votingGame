const express = require("express");
const router = express.Router();
const User = require("../models/users"); // Chỉnh sửa đường dẫn đến model User

const ganacheAccounts = [
	"0xBc407838a1AC91579e9Ad304d49E895e3CA049e1",
	"0xd1e640600186De2d1362dceA821323FFbFd3c667",
	"0x8F8de8fc1dB2aC98d4a1a540B7bA858120aE7E3C",
	"0x4C41f5526D3235456bb0806487928D299194E71C",
	"0x627AC9faa836a352C607115a9D8Bc9339FE8261e",
	"0xFc4cEaC049Cb54C96Bae0CB80A55A9730BD5AAD8",
	"0xd794c35A43baE9438bf811d262F401cB54669f8B",
	"0x0d3D1AA8B07A6E0D7a8d4ACa68E3ECC5CC9add96",
	"0x8E3Fb2F13dF660D26C81d638dCd82aBf23E082ee",
	"0xF24612b520E3F5b8Ef7e33B7cDA5a4B42b930607",
];

async function getAvailableGanacheAccount() {
	const users = await User.find();
	console.log(users);
	const usedAddresses = users.map((user) => user.ethAccount);
	return ganacheAccounts
		? ganacheAccounts.find((account) => !usedAddresses.includes(account))
		: null;
}

// GET all users
router.get("/", async (req, res) => {
	try {
		const users = await User.find();
		res.json(users);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// GET one user by id
router.get("/:googleId", async (req, res) => {
	try {
		const googleId = req.params.googleId;
		let user = await User.findOne({ googleId });
		if (user == null) {
			return res.status(404).json({ message: "Cannot find user" });
		}
		res.json(user);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// POST create a new user
router.post("/", async (req, res) => {
	const { googleId, name, email, picture } = req.body;

	try {
		let user = await User.findOne({ googleId });

		if (!user) {
			const availableAccount = await getAvailableGanacheAccount();
			if (!availableAccount) {
				return res.status(500).send("No available Ganache accounts");
			}
			// Nếu người dùng chưa tồn tại, tạo mới
			user = new User({
				googleId,
				name,
				email,
				picture,
				ethAccount: availableAccount,
			});
			await user.save();
		}

		res.status(201).json(user);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// PATCH update a user
router.patch("/:googleId", async (req, res) => {
	try {
		const googleId = req.params.googleId;
		let user = await User.findOne({ googleId });
		if (user == null) {
			return res.status(404).json({ message: "Cannot find user" });
		}

		if (req.body.name != null) {
			user.name = req.body.name;
		}
		if (req.body.email != null) {
			user.email = req.body.email;
		}
		if (req.body.picture != null) {
			user.picture = req.body.picture;
		}

		const updatedUser = await user.save();
		res.json(updatedUser);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// DELETE a user
router.delete("/:googleId", async (req, res) => {
	try {
		const googleId = req.params.googleId;
		let user = await User.findOne({ googleId });
		if (user == null) {
			return res.status(404).json({ message: "Cannot find user" });
		}

		await user.remove();
		res.json({ message: "Deleted user" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

module.exports = router;
