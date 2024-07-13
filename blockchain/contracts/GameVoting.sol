// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GameVoting {
    struct Game {
        uint id;
        string name;
        string category;
        string author;
        string imageUrl;
        uint voteCount;
    }

    uint public gameCount;
    mapping(uint => Game) public games;
    mapping(address => mapping(uint => bool)) public votes; // Store whether a user has voted for a game
    mapping(address => mapping(uint => uint)) public voteTimes; // Store the timestamp of each vote by user

    mapping(address => uint) public lastVoteTime; // Store the last voting time for each user
    mapping(address => uint) public voteCountInPeriod; // Store the number of votes by each user within the limited time period

    event GameAdded(uint gameId, string name, string category, string author, string imageUrl);
    event Voted(uint gameId, address voter);

    uint constant VOTING_PERIOD = 10 minutes;
    uint constant MAX_VOTES_PER_PERIOD = 5;

    function addGame(string memory _name, string memory _category, string memory _author, string memory _imageUrl) public {
        gameCount++;
        games[gameCount] = Game(gameCount, _name, _category, _author, _imageUrl, 0);
        emit GameAdded(gameCount, _name, _category, _author, _imageUrl);
    }

    function vote(uint _gameId) public {
        require(_gameId > 0 && _gameId <= gameCount, "Game does not exist.");
        require(!votes[msg.sender][_gameId], "You have already voted for this game.");

        if (block.timestamp > lastVoteTime[msg.sender] + VOTING_PERIOD) {
            lastVoteTime[msg.sender] = block.timestamp;
            voteCountInPeriod[msg.sender] = 0;
        }

        require(voteCountInPeriod[msg.sender] < MAX_VOTES_PER_PERIOD, "You have reached the maximum number of votes allowed in this period.");

        games[_gameId].voteCount++;
        votes[msg.sender][_gameId] = true;
        voteTimes[msg.sender][_gameId] = block.timestamp; // Store the vote timestamp
        voteCountInPeriod[msg.sender]++;
        emit Voted(_gameId, msg.sender);
    }

    function getGame(uint _gameId) public view returns (uint, string memory, string memory, string memory, string memory, uint) {
        require(_gameId > 0 && _gameId <= gameCount, "Game does not exist.");

        Game memory game = games[_gameId];
        return (game.id, game.name, game.category, game.author, game.imageUrl, game.voteCount);
    }

    function getAllGames() public view returns (Game[] memory) {
        Game[] memory allGames = new Game[](gameCount);
        for (uint i = 1; i <= gameCount; i++) {
            allGames[i - 1] = games[i];
        }
        return allGames;
    }
}
