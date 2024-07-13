const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
	id: { type: Number, required: true, unique: true }, // sử dụng _id kiểu Number để đồng bộ với id từ blockchain
	name: { type: String, required: true },
	author: { type: String, required: true },
	category: { type: String, required: true },
	image: { type: String, required: false },
	votes: { type: Number, default: 0 },
});

module.exports = mongoose.model("Game", gameSchema);
