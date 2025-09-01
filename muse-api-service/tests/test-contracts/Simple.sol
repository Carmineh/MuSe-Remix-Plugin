// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Simple {
    uint public value = 0;

    function increment() public {
        value += 1;
    }

    function decrement() public {
        value -= 1;
    }
}
