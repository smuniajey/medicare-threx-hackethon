from web3 import Web3
import json

infura_url = "https://sepolia.infura.io/v3/55f98e7edb5d4c2aab0b6ce4c08d73c7"
w3 = Web3(Web3.HTTPProvider(infura_url))

print("Connected:", w3.is_connected())

contract_address = "0x06F6a2cBeA929AB4B86e7900f0e0bBE8D0bC600F"
contract_address = Web3.to_checksum_address(contract_address)

with open("abi.json") as f:
    abi = json.load(f)

contract = w3.eth.contract(address=contract_address, abi=abi)

print("Contract connected successfully")