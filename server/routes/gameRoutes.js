const express = require("express");
const router = express.Router();
const Game = require("../models/games");
const { Web3 } = require("web3");
const GameVoting = require("../contracts/GameVoting.json");

let web3;

const initWeb3 = async () => {
	try {
		// Khởi tạo Web3 và hợp đồng thông minh từ GameVoting.json
		web3 = new Web3("http://127.0.0.1:7545");
		const networkId = await web3.eth.net.getId();
		const deployedNetwork = GameVoting.networks[networkId];

		if (!deployedNetwork) {
			throw new Error("Contract network not found");
		}
		contract = new web3.eth.Contract(GameVoting.abi, deployedNetwork.address);

		// console.log(contract);
	} catch (error) {
		console.error("Failed to initialize Web3 or contract:", error.message);
		throw error; // Đảm bảo rằng lỗi được ném ra để có thể xử lý ở phía khác
	}
};

// Gọi hàm initWeb3 để khởi tạo trước khi xuất module
initWeb3().catch((error) => {
	console.error(
		"Failed to initialize Web3 or contract during startup:",
		error.message
	);
	process.exit(1); // Thoát quá trình chạy nếu không khởi tạo được Web3 hoặc contract
});

const checkContractInitialized = async (req, res, next) => {
	try {
		if (!contract) {
			throw new Error("Contract is not initialized");
		}
		// Nếu contract đã được khởi tạo, tiếp tục xử lý yêu cầu
		next();
	} catch (error) {
		console.error("Error in checkContractInitialized:", error);
		res.status(500).json({ message: error.message });
	}
};

// Sử dụng middleware kiểm tra contract cho tất cả các route
router.use(checkContractInitialized);

// GET all games
router.get("/", async (req, res) => {
	try {
		const games = await Game.find();
		res.json(games);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// GET one game by id
router.get("/:id", async (req, res) => {
	try {
		const game = await Game.findOne({ id: req.params.id });
		if (game == null) {
			return res.status(404).json({ message: "Cannot find game" });
		}
		res.json(game);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// POST create a new game
router.post("/", async (req, res) => {
	const { name, author, category, image } = req.body;
	const { address } = req.body;

	try {
		if (!contract) {
			throw new Error("Contract is not initialized");
		}

		const accounts = await web3.eth.getAccounts();
		const gasAmount = await contract.methods
			.addGame(name, category, author, image)
			.estimateGas();
		const result = await contract.methods
			.addGame(name, category, author, image)
			.send({ from: accounts[0], gas: gasAmount });

		const gameCount = await contract.methods.gameCount().call();

		const newGame = new Game({
			id: Number(gameCount), // Chuyển đổi từ bigint sang Number
			name,
			author,
			category,
			image,
			votes: 0,
		});

		const savedGame = await newGame.save();
		res.status(201).json(savedGame);
	} catch (err) {
		console.error("Error in POST /:", err);
		res.status(400).json({ message: err.message });
	}
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;  // Sửa 'gameId' thành 'id'
  try {
    const game = await Game.findOne({ id: Number(id) });
    if (!game) {
      return res.status(404).json({ message: "Không tìm thấy game" });
    }
    game.votes++;
    const updatedGame = await game.save();
    res.json(updatedGame);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a game
router.delete("/:id", async (req, res) => {
	try {
		const game = await Game.findOne({ id: req.params.id });
		if (game == null) {
			return res.status(404).json({ message: "Cannot find game" });
		}

		await game.remove();
		res.json({ message: "Deleted game" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

module.exports = router;
