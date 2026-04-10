// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileSharing {
    struct AccessRecord {
        address sender;
        address recipient;
        string fileHash;
        bool shared;
        bool revoked;
        uint256 timestamp;
    }

    struct FileUpload {
        address uploader;
        string fileHash;
        string fileName;
        uint256 fileSize;
        bool uploaded;
        uint256 timestamp;
    }

    mapping(uint => AccessRecord) public accessRecords;
    mapping(uint => FileUpload) public fileUploads;
    uint public accessRecordsCount;
    uint public fileUploadsCount;

    event FileShared(uint indexed id, address indexed sender, address indexed recipient, string fileHash, uint256 timestamp);
    event AccessRevoked(uint indexed id, address indexed sender, address indexed recipient, string fileHash);
    event FileUploaded(uint indexed id, address indexed uploader, string fileHash, string fileName, uint256 fileSize, uint256 timestamp);

    function shareFile(address _recipient, string memory _fileHash) external {
        // Perform validations if needed
        accessRecords[accessRecordsCount] = AccessRecord(msg.sender, _recipient, _fileHash, true, false, block.timestamp);
        accessRecordsCount++;
        emit FileShared(accessRecordsCount - 1, msg.sender, _recipient, _fileHash, block.timestamp);
    }

    function revokeAccess(uint _id) external {
        AccessRecord storage accessRecord = accessRecords[_id];
        require(accessRecord.sender == msg.sender, "You can only revoke your own access.");
        require(accessRecord.revoked == false, "Access already revoked.");
        
        accessRecord.revoked = true;
        emit AccessRevoked(_id, accessRecord.sender, accessRecord.recipient, accessRecord.fileHash);
    }

    // Revoke access by recipient and file hash (for shares without stored ID)
    function revokeAccessByHash(address _recipient, string memory _fileHash) external {
        for (uint i = 0; i < accessRecordsCount; i++) {
            AccessRecord storage record = accessRecords[i];
            if (record.sender == msg.sender && 
                record.recipient == _recipient && 
                keccak256(bytes(record.fileHash)) == keccak256(bytes(_fileHash)) &&
                record.shared == true && 
                record.revoked == false) {
                
                record.revoked = true;
                emit AccessRevoked(i, msg.sender, _recipient, _fileHash);
                return;
            }
        }
        revert("No active access found to revoke.");
    }

    function uploadFile(string memory _fileHash, string memory _fileName, uint256 _fileSize) external {
        // Perform validations if needed
        fileUploads[fileUploadsCount] = FileUpload(msg.sender, _fileHash, _fileName, _fileSize, true, block.timestamp);
        fileUploadsCount++;
        emit FileUploaded(fileUploadsCount - 1, msg.sender, _fileHash, _fileName, _fileSize, block.timestamp);
    }

    // Check if user has active access to a file
    function hasActiveAccess(address _user, string memory _fileHash) public view returns (bool) {
        for (uint i = 0; i < accessRecordsCount; i++) {
            AccessRecord storage record = accessRecords[i];
            if (record.recipient == _user && 
                keccak256(bytes(record.fileHash)) == keccak256(bytes(_fileHash)) && 
                record.shared == true && 
                record.revoked == false) {
                return true;
            }
        }
        return false;
    }

    // Get all uploads by a specific user
    function getUserUploads(address _user) public view returns (uint[] memory) {
        uint[] memory userUploadIds = new uint[](fileUploadsCount);
        uint count = 0;
        
        for (uint i = 0; i < fileUploadsCount; i++) {
            if (fileUploads[i].uploader == _user) {
                userUploadIds[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint[] memory result = new uint[](count);
        for (uint i = 0; i < count; i++) {
            result[i] = userUploadIds[i];
        }
        return result;
    }

    // Get all files shared with a user
    function getUserSharedFiles(address _user) public view returns (uint[] memory) {
        uint[] memory sharedIds = new uint[](accessRecordsCount);
        uint count = 0;
        
        for (uint i = 0; i < accessRecordsCount; i++) {
            if (accessRecords[i].recipient == _user && 
                accessRecords[i].shared == true && 
                accessRecords[i].revoked == false) {
                sharedIds[count] = i;
                count++;
            }
        }
        
        uint[] memory result = new uint[](count);
        for (uint i = 0; i < count; i++) {
            result[i] = sharedIds[i];
        }
        return result;
    }
}
