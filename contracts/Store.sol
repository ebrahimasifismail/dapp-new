pragma solidity ^0.5.0;

contract Store {
    event boughtEvent(uint indexed _productId);

    struct Product {
        uint id;
        string name;
        uint price;
        uint stock;
    }

    mapping(uint => Product) public products;

    mapping(address => Product) public buyers;

    uint public productCount;

    constructor () public {
        addProduct("Product 1", 10);
        addProduct("Product 2", 20);
    }

    function addProduct (string memory _name, uint _stock) private {
        productCount ++;
        products[productCount] = Product(productCount, _name, 100, _stock);

    }
    function buy (uint _productId) public payable {

        require (products[_productId].stock > 0, "");

        buyers[msg.sender] = products[_productId];
        products[_productId].stock --;

        emit boughtEvent(_productId);


    }
}