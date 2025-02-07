// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract RoomManager is Initializable {
    struct Room {
        string name;
        address[] admins;
        mapping(address => bool) bannedUsers;
    }

    struct RoomResponse {
        string name;
        address[] admins;
    }

    struct Question {
        address author;
        string content;
        uint256 upvoteCount;
        uint256 downvoteCount;
        uint createDate;
        bool isRead;
        mapping(address => bool) upvotes;
        mapping(address => bool) downvotes;
    }

    struct QuestionResponse {
        address author;
        string content;
        uint createDate;
        uint256 upvoteCount;
        uint256 downvoteCount;
        bool isRead;
        bool isUpvoted;
        bool isDownvoted;
    }

    mapping(bytes32 => Room) public rooms;
    mapping(bytes32 => Question[]) public roomQuestions;

    event RoomCreated(bytes32 indexed roomId, string name, address admin);
    event AdminAdded(bytes32 indexed roomId, address newAdmin);
    event RoomNameUpdated(bytes32 indexed roomId, address admin, string name);
    event UserBanned(bytes32 indexed roomId, address user);
    event UserUnbanned(bytes32 indexed roomId, address user);
    event QuestionAdded(bytes32 indexed roomId, uint256 indexed questionId, address author, string content);
    event QuestionVoted(bytes32 indexed roomId, uint256 indexed questionId, address voter, bool isUpvote, uint256 upvoteCount, uint256 downvoteCount);
    event QuestionEdited(bytes32 indexed roomId, uint256 indexed questionId, address author, string content);
    event QuestionDeleted(bytes32 indexed roomId, uint256 indexed questionId, address author);
    event QuestionStatusChanged(bytes32 indexed roomId, uint256 indexed questionId, bool isRead);

    function initialize() public initializer {}

    function getRoom(bytes32 _roomId) external view returns (RoomResponse memory) {
        RoomResponse memory response;

        response.name = rooms[_roomId].name;
        response.admins = rooms[_roomId].admins;

        return response;
    }

    function createRoom(string memory _name) external returns (bytes32) {
        bytes32 roomId = keccak256(abi.encodePacked(_name, msg.sender, block.timestamp));
        Room storage newRoom = rooms[roomId];
        newRoom.name = _name;
        newRoom.admins.push(msg.sender);

        emit RoomCreated(roomId, _name, msg.sender);
        return roomId;
    }

    function isAdmin(bytes32 _roomId, address _user) public view returns (bool) {
        for (uint256 i = 0; i < rooms[_roomId].admins.length; i++) {
            if (rooms[_roomId].admins[i] == _user) {
                return true;
            }
        }
        return false;
    }

    modifier onlyAdmin(bytes32 _roomId) {
        require(isAdmin(_roomId, msg.sender), "Only admin can perform this action");
        _;
    }

    modifier notBanned(bytes32 _roomId) {
        require(!rooms[_roomId].bannedUsers[msg.sender], "User is banned from this room");
        _;
    }

    function addAdmin(bytes32 _roomId, address _newAdmin) external onlyAdmin(_roomId) {
        require(_newAdmin != address(0), "Invalid admin address");
        require(!isAdmin(_roomId, _newAdmin), "Address is already an admin");

        rooms[_roomId].admins.push(_newAdmin);
        emit AdminAdded(_roomId, _newAdmin);
    }

    function updateRoomName(bytes32 _roomId, string memory _name) external onlyAdmin(_roomId) {
        // Convert the string to bytes to measure its length
        require(bytes(_name).length < 200, "Name too long");

        rooms[_roomId].name = _name;
        emit RoomNameUpdated(_roomId, msg.sender, _name);
    }

    function banUser(bytes32 _roomId, address _user) external onlyAdmin(_roomId) {
        require(!isAdmin(_roomId, _user), "Cannot ban admin");
        rooms[_roomId].bannedUsers[_user] = true;
        emit UserBanned(_roomId, _user);
    }

    function unbanUser(bytes32 _roomId, address _user) external onlyAdmin(_roomId) {
        rooms[_roomId].bannedUsers[_user] = false;
        emit UserUnbanned(_roomId, _user);
    }

    function isBanned(bytes32 _roomId, address _user) external view returns (bool) {
        return rooms[_roomId].bannedUsers[_user];
    }

    // Question Management Functions

    function addQuestion(bytes32 _roomId, string memory _content) external notBanned(_roomId) {
        uint256 questionId = roomQuestions[_roomId].length;
        Question storage newQuestion = roomQuestions[_roomId].push();
        newQuestion.author = msg.sender;
        newQuestion.content = _content;
        newQuestion.createDate = block.timestamp;
        newQuestion.upvoteCount = 0;
        newQuestion.downvoteCount = 0;
        newQuestion.isRead = false;

        emit QuestionAdded(_roomId, questionId, msg.sender, _content);
    }

    function editQuestion(bytes32 _roomId, uint256 _questionId, string memory _content) external notBanned(_roomId) {
        require(_questionId < roomQuestions[_roomId].length, "Invalid question ID");
        Question storage question = roomQuestions[_roomId][_questionId];
        bool _isAdmin = isAdmin(_roomId, msg.sender);
        require(_isAdmin || question.author == msg.sender, "Questions can only be edited by the author or admins");
        require(_isAdmin || !question.isRead, "Unable to edit a closed question");

        question.content = _content;

        emit QuestionEdited(_roomId, _questionId, msg.sender, _content);
    }

    function deleteQuestion(bytes32 _roomId, uint256 _questionId) external notBanned(_roomId) {
        require(_questionId < roomQuestions[_roomId].length, "Invalid question ID");
        Question storage question = roomQuestions[_roomId][_questionId];
        bool _isAdmin = isAdmin(_roomId, msg.sender);
        require(_isAdmin || question.author == msg.sender, "Questions can only be deleted by the author or admins");
        require(_isAdmin || !question.isRead, "Unable to delete a closed question");

        question.content = "!!!DELETED!!!";

        emit QuestionDeleted(_roomId, _questionId, msg.sender);
    }

    function voteQuestion(bytes32 _roomId, uint256 _questionId, bool _isUpvote) external notBanned(_roomId) {
        require(_questionId < roomQuestions[_roomId].length, "Invalid question ID");
        Question storage question = roomQuestions[_roomId][_questionId];
        require(!question.isRead, "Unable to vote for a closed question");

        if (_isUpvote) {
            // Upvote clicked
            if (question.upvotes[msg.sender]) {
                // User previously upvoted
                question.upvotes[msg.sender] = false;
                question.upvoteCount--;
            } else if (question.downvotes[msg.sender]) {
                // User previously downvoted
                question.upvotes[msg.sender] = true;
                question.upvoteCount++;
                question.downvotes[msg.sender] = false;
                question.downvoteCount--;
            } else {
                // Fresh upvote
                question.upvotes[msg.sender] = true;
                question.upvoteCount++;
            }
        } else {
            // Downvote clicked
            if (question.downvotes[msg.sender]) {
                // User previously downvoted
                question.downvotes[msg.sender] = false;
                question.downvoteCount--;
            } else if (question.upvotes[msg.sender]) {
                // User previously upvoted
                question.downvotes[msg.sender] = true;
                question.downvoteCount++;
                question.upvotes[msg.sender] = false;
                question.upvoteCount--;
            } else {
                // Fresh downvote
                question.downvotes[msg.sender] = true;
                question.downvoteCount++;
            }
        }

        emit QuestionVoted(_roomId, _questionId, msg.sender, _isUpvote, question.upvoteCount, question.downvoteCount);
    }

    function toggleQuestionStatus(bytes32 _roomId, uint256 _questionId) external onlyAdmin(_roomId) {
        require(_questionId < roomQuestions[_roomId].length, "Invalid question ID");
        Question storage question = roomQuestions[_roomId][_questionId];
        question.isRead = !question.isRead;
        emit QuestionStatusChanged(_roomId, _questionId, question.isRead);
    }

    function getQuestionCount(bytes32 _roomId) external view returns (uint256) {
        return roomQuestions[_roomId].length;
    }

    function getAllQuestions(bytes32 _roomId, address _user) external view returns (QuestionResponse[] memory) {
        QuestionResponse[] memory response = new QuestionResponse[](roomQuestions[_roomId].length);

        for (uint256 i = 0; i < roomQuestions[_roomId].length; i++) {
            QuestionResponse memory qr;

            qr.author = roomQuestions[_roomId][i].author;
            qr.content = roomQuestions[_roomId][i].content;
            qr.createDate = roomQuestions[_roomId][i].createDate;
            qr.upvoteCount = roomQuestions[_roomId][i].upvoteCount;
            qr.downvoteCount = roomQuestions[_roomId][i].downvoteCount;
            qr.isRead = roomQuestions[_roomId][i].isRead;
            qr.isUpvoted = roomQuestions[_roomId][i].upvotes[_user];
            qr.isDownvoted = roomQuestions[_roomId][i].downvotes[_user];
            response[i] = qr;
        }

        return response;
    }
}
