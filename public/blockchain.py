from web3 import Web3
import json

# Connect to Ethereum Sepolia
infura_url = "https://sepolia.infura.io/v3/55f98e7edb5d4c2aab0b6ce4c08d73c7"
w3 = Web3(Web3.HTTPProvider(infura_url))

# Your deployed contract address
contract_address = "0x06F6a2cBeA929AB4B86e7900f0e0bBE8D0bC600F"

# Load ABI
with open("abi.json") as f:
    abi = json.load(f)

# Connect to contract
contract = w3.eth.contract(address=contract_address, abi=abi)