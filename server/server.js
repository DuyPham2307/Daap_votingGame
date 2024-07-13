const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const gameRoutes = require("./routes/gameRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// CORS middleware
app.use(cors({ origin: 'http://localhost:3000' }));

// Middleware để xử lý JSON
app.use(bodyParser.json());

// Middleware để thiết lập header CORS
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});

// Kết nối đến MongoDB Atlas
const uri =
	"mongodb+srv://duyphamthcshl:2307Duy@cluster0.88sr350.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Connected to MongoDB Atlas");
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
