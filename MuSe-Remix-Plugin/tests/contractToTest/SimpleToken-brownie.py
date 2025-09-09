import pytest
from brownie import SimpleToken, accounts, reverts

# Constants
NAME = "Simple Token"
SYMBOL = "SIM"
DECIMALS = 18
INITIAL_SUPPLY = 1000 * 10**DECIMALS

@pytest.fixture
def token():
    # Deploy SimpleToken with the first account as the owner
    return SimpleToken.deploy(NAME, SYMBOL, DECIMALS, INITIAL_SUPPLY, {'from': accounts[0]})

def test_transfer_between_accounts(token):
    # Define accounts and amount to transfer
    owner = accounts[0]
    recipient = accounts[1]
    transfer_amount = 100 * 10**DECIMALS

    # Get initial balances
    initial_owner_balance = token.balanceOf(owner)
    initial_recipient_balance = token.balanceOf(recipient)

    # Transfer tokens from owner to recipient and check for event
    tx = token.transfer(recipient, transfer_amount, {'from': owner})

    # Verify that the Transfer event was emitted with correct parameters
    assert tx.events['Transfer']['from'] == owner
    assert tx.events['Transfer']['to'] == recipient
    assert tx.events['Transfer']['value'] == transfer_amount

    # Check final balances
    final_owner_balance = token.balanceOf(owner)
    final_recipient_balance = token.balanceOf(recipient)

    assert final_owner_balance == initial_owner_balance - transfer_amount
    assert final_recipient_balance == initial_recipient_balance + transfer_amount

def test_transfer_insufficient_balance(token):
    # Define accounts
    owner = accounts[0]
    recipient = accounts[1]
    third_account = accounts[2]

    # Try to send more tokens than the sender has
    excessive_amount = INITIAL_SUPPLY + 1

    # This should be rejected
    with reverts("Insufficient balance"):
        token.transfer(recipient, excessive_amount, {'from': owner})

    # Also try with an account that has 0 balance
    with reverts("Insufficient balance"):
        token.transfer(owner, 1, {'from': third_account})

def test_transfer_to_zero_address(token):
    # Define amount to transfer
    transfer_amount = 10 * 10**DECIMALS

    # Attempt to transfer to zero address
    with reverts("Cannot transfer to zero address"):
        token.transfer("0x0000000000000000000000000000000000000000", transfer_amount, {'from': accounts[0]})