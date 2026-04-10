from datetime import datetime
import logging
import mimetypes
from flask import Flask, request, jsonify
from flask_caching import Cache
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from werkzeug.utils import secure_filename
from cryptography.fernet import Fernet
import os
import requests
import base64
from dotenv import load_dotenv

load_dotenv()

from blochain_service import contract,w3

app = Flask(__name__)
CORS(app)

cache = Cache(app, config={'CACHE_TYPE': 'simple'})



fernet_key = os.getenv("FERNET_KEY")
mail_pwd=os.getenv("MAIL_PWD")
sqlalchemy_database_uri = os.getenv('SQLALCHEMY_DATABASE_URI')
mail_server = os.getenv('MAIL_SERVER')
mail_port = os.getenv('MAIL_PORT')
mail_username = os.getenv('MAIL_USERNAME')
mail_password = os.getenv('MAIL_PASSWORD')
mail_use_ssl = os.getenv('MAIL_USE_SSL')

# Initialize the Fernet cipher suite
cipher_suite = Fernet(fernet_key)

app.config['SQLALCHEMY_DATABASE_URI'] = sqlalchemy_database_uri
app.config['MAIL_SERVER']= mail_server
app.config['MAIL_PORT'] = mail_port
app.config['MAIL_USERNAME'] = mail_username
app.config['MAIL_PASSWORD'] = mail_password
app.config['MAIL_USE_SSL'] = mail_use_ssl

print("blochain connected ",w3.is_connected())

db = SQLAlchemy(app)

mail = Mail(app)

from sqlalchemy.orm import relationship


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password = db.Column(db.String(255), nullable=False)
    account_address = db.Column(db.String(255), nullable=True)
    files = relationship('File', backref='owner', cascade='all, delete-orphan')  # Cascade deletion added

    def __repr__(self):
        return f'<User {self.username}>'


class File(db.Model):
    id = db.Column(db.Integer, primary_key=True,index=True)
    filename = db.Column(db.String(255), nullable=False, index=True)
    size = db.Column(db.Integer, nullable=False)
    upload_time = db.Column(db.DateTime, default=datetime.utcnow)
    file_hash = db.Column(db.Text, index=True)
    file_content = db.Column(db.LargeBinary)
    file_type = db.Column(db.String(255))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False, index=True)
    access_controls = db.relationship('AccessControl', backref='file', cascade='all, delete-orphan')  # Cascade deletion added
    
    def __repr__(self):
        return f"File('{self.filename}', '{self.size}', '{self.upload_time}')"


class AccessControl(db.Model):
    __tablename__ = 'access_control'

    id = db.Column(db.Integer, primary_key=True)
    file_id = db.Column(db.Integer, db.ForeignKey('file.id',ondelete='CASCADE'))
    senderUserId = db.Column(db.Integer, db.ForeignKey('user.id'))
    recipientUserId = db.Column(db.Integer, db.ForeignKey('user.id'))
    access_level = db.Column(db.Enum('owner', 'read', 'write', 'download'))
    active = db.Column(db.Boolean)
    blockchain_access_id = db.Column(db.Integer, nullable=True) # ID from smart contract
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    

class BlockchainRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    file_id = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    transaction_hash = db.Column(db.String(255), nullable=False)
    from_address= db.Column(db.String(255), nullable=True)
    to_address= db.Column(db.String(255), nullable=True)
    block_number = db.Column(db.Integer, nullable=False)
    gas_used = db.Column(db.Integer, nullable=False)
    status = db.Column(db.Enum('Success', 'Failure'), nullable=False)
    balance_eth = db.Column(db.String(255), nullable=False)
    action=db.Column(db.String(255), nullable=True)
    miner=db.Column(db.String(255), nullable=True)

    def __repr__(self):
        return f'<BlockchainRecord file_id={self.file_id}, user_id={self.user_id}, tx_hash={self.transaction_hash}>'


@app.route('/api/upload', methods=['POST'])
def upload_file():
   
    db.create_all()
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']
    userId = request.form.get('userId')
    user_address = request.form.get('userAddress')
    
    if not userId:
        return jsonify({'error': 'userId is required'}), 400
    if not user_address:
        return jsonify({'error': 'userAddress is required (Connect MetaMask)'}), 400

    try:
        userId = int(userId)
        user_address = w3.to_checksum_address(user_address)
    except Exception as e:
        return jsonify({'error': f'Invalid userId or userAddress: {str(e)}'}), 400

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        filename = secure_filename(file.filename)

        # Read the uploaded file
        file_data = file.read()

    
# Get the MIME type of the file
        mime_type, _ = mimetypes.guess_type(filename)
        print(mime_type)
        # Encrypt the file data
        encrypted_data = cipher_suite.encrypt(file_data)


        # Upload the encrypted file to local IPFS node
        files = {
            'file': (filename, encrypted_data)
        }
        try:
            # Local IPFS node default API port is 5001
            response = requests.post('http://127.0.0.1:5001/api/v0/add', files=files)
            
            if response.status_code == 200:
                ipfs_data = response.json()
                ipfs_hash = ipfs_data.get('Hash')
                print(f"File uploaded to local IPFS: {ipfs_hash}")
                
                filedata = File(filename=filename, size=len(file_data), file_hash=ipfs_hash, user_id=userId, file_content=encrypted_data, file_type=mime_type)
                db.session.add(filedata)
                db.session.commit()
                
                return jsonify({
                    'message': 'File uploaded to local IPFS successfully', 
                    'ipfs_hash': ipfs_hash,
                    'file_id': filedata.id
                })
            else:
                return jsonify({'error': f'Failed to upload to local IPFS: {response.text}'}), 500
        except Exception as e:
            print(f"Error during file upload: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': f'Internal server error: {str(e)}'}), 500

    return jsonify({'error': 'Failed to upload and pin the file'})

@app.route('/api/record-transaction', methods=['POST'])
def record_transaction():
    try:
        db.create_all()
        data = request.json
        print(f"Recording transaction: {data}")
        
        userId = data.get('userId')
        ipfs_hash = data.get('ipfs_hash')
        tx_hash = data.get('tx_hash')
        user_address = data.get('userAddress')
        
        if not all([userId, ipfs_hash, tx_hash, user_address]):
            return jsonify({'error': 'Missing required transaction data'}), 400

        # Ensure correct types and formats
        userId = int(userId)
        user_address = w3.to_checksum_address(user_address)
        
        # Get transaction receipt using the hash
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Get balance and block data
        balance_wei = w3.eth.get_balance(user_address)
        balance_eth = str(w3.from_wei(balance_wei, 'ether'))
        block_data = w3.eth.get_block(tx_receipt.blockNumber)
        
        blockchain_record = BlockchainRecord(
            file_id=ipfs_hash, 
            user_id=userId, 
            transaction_hash=tx_hash,
            from_address=user_address, 
            to_address=user_address, 
            block_number=tx_receipt.blockNumber, 
            gas_used=tx_receipt.gasUsed, 
            status='Success', 
            balance_eth=balance_eth, 
            action="You uploaded a file", 
            miner=block_data.miner
        )
        
        db.session.add(blockchain_record)
        db.session.commit()
        print(f"Transaction recorded successfully for user {userId}")
        return jsonify({'message': 'Transaction recorded successfully'}), 200
    except Exception as e:
        print(f"Error recording transaction: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to record transaction: {str(e)}'}), 500

@app.route('/api/record-revoke-transaction-local', methods=['POST'])
def record_revoke_transaction_local():
    try:
        db.create_all()
        data = request.json
        userId = data.get('userId')
        fileId = data.get('fileId')
        recipientId = data.get('recipientId')
        
        access_control = AccessControl.query.filter_by(file_id=fileId, recipientUserId=recipientId, active=True).first()
        if access_control:
            access_control.active = False
            
            # Also create a BlockchainRecord for local revokes so they show in Recent Activities
            myfiledata = File.query.filter_by(id=fileId).first()
            recipient_user = User.query.filter_by(id=recipientId).first()
            
            if myfiledata and recipient_user:
                blockchain_record = BlockchainRecord(
                    file_id=myfiledata.file_hash, 
                    user_id=userId, 
                    transaction_hash=f"local_revoke_{fileId}_{recipientId}_{int(datetime.utcnow().timestamp())}",
                    from_address='Local', 
                    to_address='Local', 
                    block_number=0, 
                    gas_used=0, 
                    status='Success', 
                    balance_eth='0', 
                    action=f"You revoked access to {recipient_user.username}", 
                    miner='Local'
                )
                
                db.session.add(blockchain_record)
            
            db.session.commit()
            return jsonify({'message': 'Access revoked locally'}), 200
        return jsonify({'error': 'No active share found'}), 404
    except Exception as e:
        print(f"Error recording local revoke: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/getfiles/<string:user_id>', methods=['GET'])
@cache.cached(timeout=1)  # Cache results for 60 seconds
def get_files(user_id):
    files = File.query.filter_by(user_id=user_id).all()
    decrypted_files = []

    for file in files:
        if file.file_content:  # Check if encrypted data is available in the database
            encrypted_data = file.file_content
            file_type = file.file_type
        else:
            # Fetch encrypted file content from Pinata
            file_hash = file.file_hash
            # Use local IPFS gateway instead of Pinata
            file_response = requests.get(f'http://127.0.0.1:8080/ipfs/{file_hash}')
            if file_response.status_code == 200:
                encrypted_data = file_response.content
            else:
                continue

        # Decrypt the encrypted data
        decrypted_data = cipher_suite.decrypt(encrypted_data)
        decrypted_data = base64.b64encode(decrypted_data).decode('utf-8')

        decrypted_files.append({
            'name': file.filename, 
            'content': decrypted_data,
            'hash': file.file_hash,
            'file_type': file_type,
            'id': file.id,
        })

    if decrypted_files:
        return jsonify(data=decrypted_files)
    else:
        return jsonify({'error': 'No files found for the user'})

@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        db.create_all()
        data = request.json
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not all([username, email, password]):
            return jsonify({'success': False, 'message': 'All fields are required'}), 400

        # Check if user already exists
        existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
        if existing_user:
            if existing_user.username == username:
                return jsonify({'success': False, 'message': 'Username already exists'}), 400
            else:
                return jsonify({'success': False, 'message': 'Email already exists'}), 400

        new_user = User(username=username, email=email, password=password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({'success': True, 'message': 'User registered successfully'}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Signup error: {str(e)}")
        return jsonify({'success': False, 'message': f'Internal server error: {str(e)}'}), 500
   

@app.route('/api/login', methods=['POST'])
def login():
    db.create_all()
    data = request.json
    username = data.get('username')
    password = data.get('password')
    print(username)
    user = User.query.filter_by(username=username, password=password).first()
    print(user)
    if user:
        response = {
            "success": True,
            "message": "Login successful",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "account_address": user.account_address
            }
        }
        return jsonify(response), 200
    else:
        response = {
            "success": False,
            "error": "Invalid email or password"
        }
        return jsonify(response), 401

    
@app.route('/api/sharefile', methods=['POST'])
def share_file():
    data = request.json
    file_hash = data.get('file_hash')
    recipient_username = data.get('recipientUsername')
    sender_user_id = data.get('senderUserId')
    access_level = data.get('accessLevel')

    # Check if the file exists
    file = File.query.filter_by(file_hash=file_hash).first()
    if not file:
        return jsonify({'error': 'File not found'}), 404

    # Check if the recipient user exists
    recipient_user = User.query.filter_by(username=recipient_username).first()
    sender_user_name = User.query.filter_by(id=sender_user_id).first()

    if not recipient_user:
        return jsonify({'error': 'Recipient user not found'}), 404
    if not sender_user_name:
        return jsonify({'error': 'Sender user not found'}), 404

    user_blockchain_address = recipient_user.account_address
    if not user_blockchain_address:
        return jsonify({'error': 'Recipient user has not connected a MetaMask wallet yet'}), 400

    return jsonify({
        'success': True,
        'recipient_address': user_blockchain_address,
        'recipient_id': recipient_user.id,
        'file_id': file.id
    })

@app.route('/api/record-share-transaction', methods=['POST'])
def record_share_transaction():
    try:
        db.create_all()
        data = request.json
        print(f"Recording share transaction: {data}")
        
        userId = data.get('userId')
        file_hash = data.get('file_hash')
        tx_hash = data.get('tx_hash')
        sender_address = data.get('senderAddress')
        recipient_address = data.get('recipientAddress')
        recipient_id = data.get('recipientId')
        file_id = data.get('file_id')
        access_level = data.get('accessLevel')
        blockchain_access_id = data.get('blockchainAccessId')
        
        print(f"\n{'='*50}")
        print(f"BLOCKCHAIN ACCESS ID RECEIVED: {blockchain_access_id}")
        print(f"Type: {type(blockchain_access_id)}")
        print(f"All data keys: {list(data.keys())}")
        print(f"{'='*50}\n")
        
        if not all([userId, file_hash, tx_hash, sender_address, recipient_address, recipient_id, file_id, access_level]):
            return jsonify({'error': 'Missing required share transaction data'}), 400

        # Ensure correct types and formats (checksum addresses)
        userId = int(userId)
        recipient_id = int(recipient_id)
        file_id = int(file_id)
        blockchain_access_id = int(blockchain_access_id) if blockchain_access_id is not None else None
        sender_address = w3.to_checksum_address(sender_address)
        recipient_address = w3.to_checksum_address(recipient_address)
        
        # Get transaction receipt using the hash
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Get balance and block data
        balance_wei = w3.eth.get_balance(sender_address)
        balance_eth = str(w3.from_wei(balance_wei, 'ether'))
        block_data = w3.eth.get_block(tx_receipt.blockNumber)
        
        # Record in AccessControl
        access_control = AccessControl.query.filter_by(file_id=file_id, recipientUserId=recipient_id).first()
        if access_control:
            access_control.active = True
            access_control.access_level = access_level
            access_control.blockchain_access_id = blockchain_access_id
        else:
            access_control = AccessControl(
                file_id=file_id,
                recipientUserId=recipient_id,
                senderUserId=userId,
                access_level=access_level,
                active=True,
                blockchain_access_id=blockchain_access_id
            )
            db.session.add(access_control)

        # Record in BlockchainRecord
        recipient_user = User.query.filter_by(id=recipient_id).first()
        blockchain_record = BlockchainRecord(
            file_id=file_hash, 
            user_id=userId, 
            transaction_hash=tx_hash,
            from_address=sender_address, 
            to_address=recipient_address, 
            block_number=tx_receipt.blockNumber, 
            gas_used=tx_receipt.gasUsed, 
            status='Success', 
            balance_eth=balance_eth, 
            action=f"You shared a file to {recipient_user.username} with access level {access_level}", 
            miner=block_data.miner
        )
        
        db.session.add(blockchain_record)
        db.session.commit()
        print(f"Share transaction recorded successfully for user {userId} sharing with {recipient_id}")
        return jsonify({'message': 'Share transaction recorded successfully'}), 200
    except Exception as e:
        print(f"Error recording share transaction: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to record share transaction: {str(e)}'}), 500

@app.route('/api/getsharedfiles/<string:user_id>', methods=['GET'])
def get_shared_files(user_id):
    db.create_all()
    shared_files = AccessControl.query.filter_by(senderUserId=user_id, active=True).all()
    print(shared_files)
    shared_files_data = []

    for shared_file in shared_files:
        file = File.query.filter_by(id=shared_file.file_id).first()
        if file.file_content:  # Check if encrypted data is available in the database
            encrypted_data = file.file_content
            file_type = file.file_type
        else:
            # Fetch encrypted file content from Pinata
            file_hash = file.file_hash
            # Fetch encrypted file content from local IPFS gateway
            file_response = requests.get(f'http://127.0.0.1:8080/ipfs/{file_hash}')

            if file_response.status_code == 200:
                encrypted_data = file_response.content
            else:
                continue
       

        decrypted_data = cipher_suite.decrypt(encrypted_data)
        decrypted_data = base64.b64encode(decrypted_data).decode('utf-8')

        shared_files_data.append({
            'file_id': file.id,
            'filename': file.filename,
            'size': file.size,
            'upload_time': file.upload_time,
            'shared_time': shared_file.created_at,
            'owner': file.owner.username,
            'recipient_username': User.query.filter_by(id=shared_file.recipientUserId).first().username,
            'file_hash': file.file_hash,
            'file_type': file_type,
            'user_id': file.user_id,
            'access_level': shared_file.access_level,
            'content': decrypted_data
        })

    if shared_files_data:
        return jsonify(data=shared_files_data)
    else:
        return jsonify({'error': 'No shared files found for the user'})    

@app.route('/api/sharedwithme/<string:user_id>', methods=['GET'])

def shared_with_me(user_id):
    db.create_all()
    shared_files = AccessControl.query.filter_by(recipientUserId=user_id, active=True).all()
    print(shared_files)
    shared_files_data = []

    for shared_file in shared_files:
        file = File.query.filter_by(id=shared_file.file_id).first()
        hash=file.file_hash
        file_type=file.file_type

        if file.file_content:  # Check if encrypted data is available in the database
            encrypted_data = file.file_content
            file_type = file.file_type
        else:
            # Fetch encrypted file content from local IPFS gateway
            file_response = requests.get(f'http://127.0.0.1:8080/ipfs/{hash}')

            if file_response.status_code == 200:
                encrypted_data = file_response.content
            else:
                continue

        
        
        decrypted_data = cipher_suite.decrypt(encrypted_data)
        decrypted_data = base64.b64encode(decrypted_data).decode('utf-8')

        shared_files_data.append({
            'file_id': file.id,
            'filename': file.filename,
            'size': file.size,
            'upload_time': file.upload_time,
            'shared_time': shared_file.created_at,
            'owner': file.owner.username,
            'recipient_username': User.query.filter_by(id=shared_file.recipientUserId).first().username,
            'file_hash': file.file_hash,
            'file_type': file_type,
            'user_id': file.user_id,
            'access_level': shared_file.access_level,
            'content': decrypted_data
        })

    if shared_files_data:
        return jsonify(data=shared_files_data)
    else:
        return jsonify({'error': 'No shared files found for the user'})
    
@app.route('/api/revokeaccess', methods=['POST'])
def revoke_access():
    data = request.json
    file_id = data.get('file_id')
    recipient_username = data.get('recipient_username')
    recipientUser = User.query.filter_by(username=recipient_username).first()
    if not recipientUser:
        return jsonify({'error': 'Recipient user not found'}), 404
    
    recipientUserId = recipientUser.id

    access_control = AccessControl.query.filter_by(file_id=file_id, recipientUserId=recipientUserId, active=True).first()
    if not access_control:
        return jsonify({'error': 'No active access control found for this user and file'}), 404
    
    recipient_blockchain_address = recipientUser.account_address
    if not recipient_blockchain_address:
        return jsonify({'error': 'Recipient user has no blockchain address'}), 400

    return jsonify({
        'success': True,
        'recipient_id': recipientUserId,
        'recipient_address': recipient_blockchain_address,
        'blockchain_access_id': access_control.blockchain_access_id
    })

@app.route('/api/record-revoke-transaction', methods=['POST'])
def record_revoke_transaction():
    try:
        db.create_all()
        data = request.json
        
        userId = data.get('userId')
        file_id = data.get('fileId')
        tx_hash = data.get('tx_hash')
        sender_address = data.get('senderAddress')
        recipient_address = data.get('recipientAddress')
        recipient_id = data.get('recipientId')
        
        # Get transaction receipt using the hash
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Get balance and block data - Convert to checksum address first
        checksum_sender = w3.to_checksum_address(sender_address)
        balance_wei = w3.eth.get_balance(checksum_sender)
        balance_eth = str(w3.from_wei(balance_wei, 'ether'))
        block_data = w3.eth.get_block(tx_receipt.blockNumber)
        
        # Update AccessControl
        access_control = AccessControl.query.filter_by(file_id=file_id, recipientUserId=recipient_id, active=True).first()
        if access_control:
            access_control.active = False
        
        # Record in BlockchainRecord
        recipient_user = User.query.filter_by(id=recipient_id).first()
        myfiledata = File.query.filter_by(id=file_id).first()
        
        blockchain_record = BlockchainRecord(
            file_id=myfiledata.file_hash, 
            user_id=userId, 
            transaction_hash=tx_hash,
            from_address=sender_address, 
            to_address=recipient_address, 
            block_number=tx_receipt.blockNumber, 
            gas_used=tx_receipt.gasUsed, 
            status='Success', 
            balance_eth=balance_eth, 
            action=f"You revoked access to {recipient_user.username}", 
            miner=block_data.miner
        )
        
        db.session.add(blockchain_record)
        db.session.commit()
        return jsonify({'message': 'Revoke transaction recorded successfully'}), 200
    except Exception as e:
        print(f"Error recording revoke transaction: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to record revoke transaction: {str(e)}'}), 500

@app.route('/api/updateUserAddress', methods=['POST'])
def update_user_address():
    data = request.json
    user_id = data.get('userId')
    address = data.get('address')
    
    if not user_id or not address:
        return jsonify({'error': 'userId and address are required'}), 400
        
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    user.account_address = address
    db.session.commit()
    return jsonify({'success': True, 'message': 'Address updated successfully'}), 200

@app.route('/api/getUser', methods=['GET'])
def get_user():
    db.create_all()
   
    users = User.query.all()
    user_data = []

    for user in users:
        user_data.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'account_address': user.account_address
        })

    if user_data:
        return jsonify(data=user_data)
    else:
        return jsonify({'error': 'No users found'})

@app.route('/api/deletefile/<string:file_id>', methods=['DELETE'])
def delete_file(file_id):
    file = File.query.filter_by(id=file_id).first()
    if file:
        db.session.delete(file)
        db.session.commit()
        print("File deleted successfully")
        return "deleted successfully"
    return "File not found"

@app.route('/api/getBlockChainData/<string:user_id>', methods=['GET'])
def getBlockChainData(user_id):
    db.create_all()

    blockchain_records = BlockchainRecord.query.filter_by(user_id=user_id).all()
    blockchain_data = []

    for record in blockchain_records:
        blockchain_data.append({
            'file_id': record.file_id,
            'from_address': record.from_address,
            'to_address': record.to_address,
            'miner': record.miner,
            'timestamp': record.timestamp,
            'transaction_hash': record.transaction_hash,
            'block_number': record.block_number,
            'gas_used': record.gas_used,
            'status': record.status,
            'balance_eth': record.balance_eth,
            'action': record.action,
        })

    if blockchain_data:
        return jsonify(data=blockchain_data)
    else:
        return jsonify({'error': 'No blockchain records found'})
    

if __name__ == '__main__':
    with app.app_context():
        # Check if blockchain_access_id column exists
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        try:
            columns = [c['name'] for c in inspector.get_columns('access_control')]
            if 'blockchain_access_id' not in columns:
                print("Adding blockchain_access_id column to access_control table...")
                with db.engine.connect() as conn:
                    conn.execute(db.text('ALTER TABLE access_control ADD COLUMN blockchain_access_id INTEGER'))
                    conn.commit()
                print("Column added successfully.")
        except Exception:
            # Table might not exist yet
            pass
        
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
