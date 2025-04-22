// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ProductRegistry {
    struct Product {
        uint id;
        address seller;
        string sellerEmail;
        string name;
        string description;
        string productType;
        uint price;
        uint count;
        string[] imageHashes;
        string[] features;
        bool isAvailable;
    }

    uint public productCount;
    mapping(uint => Product) public products;
    mapping(address => uint[]) public userProductIds;

    event ProductListed(
        uint indexed productId,
        address indexed seller,
        string name,
        string productType,
        uint price
    );

    event ProductAvailabilityUpdated(uint indexed productId, bool isAvailable);
    event ProductCountUpdated(uint indexed productId, uint newCount);

    /// @notice Add a new product
    function addProduct(
        string memory _name,
        string memory _description,
        string memory _productType,
        uint _price,
        uint _count,
        string[] memory _imageHashes,
        string[] memory _features,
        string memory _sellerEmail
    ) public {
        require(_price > 0, "Price must be greater than zero");

        productCount++;
        products[productCount] = Product({
            id: productCount,
            seller: msg.sender,
            sellerEmail: _sellerEmail,
            name: _name,
            description: _description,
            productType: _productType,
            price: _price,
            count: _count,
            imageHashes: _imageHashes,
            features: _features,
            isAvailable: true
        });

        userProductIds[msg.sender].push(productCount);

        emit ProductListed(
            productCount,
            msg.sender,
            _name,
            _productType,
            _price
        );
    }

    function updateProductStatus(uint _productId, bool _isAvailable) public {
        Product storage product = products[_productId];
        require(product.seller == msg.sender, "Not authorized");
        product.isAvailable = _isAvailable;

        emit ProductAvailabilityUpdated(_productId, _isAvailable);
    }

    function updateProductCount(uint _productId, uint _newCount) public {
        Product storage product = products[_productId];
        require(product.seller == msg.sender, "Not authorized");
        product.count = _newCount;

        emit ProductCountUpdated(_productId, _newCount);
    }

    function getProduct(uint _productId) public view returns (Product memory) {
        return products[_productId];
    }

    function getMyProducts() public view returns (Product[] memory) {
        uint[] memory ids = userProductIds[msg.sender];
        Product[] memory myProducts = new Product[](ids.length);

        for (uint i = 0; i < ids.length; i++) {
            myProducts[i] = products[ids[i]];
        }
        return myProducts;
    }

    function getProductsByKeyword(string memory _keyword) public view returns (Product[] memory) {
        uint matchCount = 0;

        for (uint i = 1; i <= productCount; i++) {
            if (_contains(_keyword, products[i].description)) {
                matchCount++;
            }
        }

        Product[] memory results = new Product[](matchCount);
        uint idx = 0;
        for (uint i = 1; i <= productCount; i++) {
            if (_contains(_keyword, products[i].description)) {
                results[idx] = products[i];
                idx++;
            }
        }

        return results;
    }

    function getProductsBySellerEmail(string memory _email) public view returns (Product[] memory) {
        uint matchCount = 0;

        for (uint i = 1; i <= productCount; i++) {
            if (_compareStrings(products[i].sellerEmail, _email)) {
                matchCount++;
            }
        }

        Product[] memory results = new Product[](matchCount);
        uint idx = 0;

        for (uint i = 1; i <= productCount; i++) {
            if (_compareStrings(products[i].sellerEmail, _email)) {
                results[idx] = products[i];
                idx++;
            }
        }

        return results;
    }

    function getSellerEmailByProductId(uint _productId) public view returns (string memory) {
        require(_productId > 0 && _productId <= productCount, "Invalid product ID");
        return products[_productId].sellerEmail;
    }

    function getSellerAddressByProductId(uint _productId) public view returns (address) {
        require(_productId > 0 && _productId <= productCount, "Invalid product ID");
        return products[_productId].seller;
    }

    /// @notice Get all products that have a given feature
    function getProductsByFeature(string memory _feature) public view returns (Product[] memory) {
        uint matchCount = 0;

        for (uint i = 1; i <= productCount; i++) {
            if (_arrayContains(products[i].features, _feature)) {
                matchCount++;
            }
        }

        Product[] memory results = new Product[](matchCount);
        uint idx = 0;

        for (uint i = 1; i <= productCount; i++) {
            if (_arrayContains(products[i].features, _feature)) {
                results[idx] = products[i];
                idx++;
            }
        }

        return results;
    }

    /// @notice Get all products of a given product type
    function getProductsByType(string memory _productType) public view returns (Product[] memory) {
        uint matchCount = 0;

        for (uint i = 1; i <= productCount; i++) {
            if (_compareStrings(products[i].productType, _productType)) {
                matchCount++;
            }
        }

        Product[] memory results = new Product[](matchCount);
        uint idx = 0;

        for (uint i = 1; i <= productCount; i++) {
            if (_compareStrings(products[i].productType, _productType)) {
                results[idx] = products[i];
                idx++;
            }
        }

        return results;
    }

    // INTERNAL HELPERS

    function _compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }

    function _contains(string memory what, string memory where) internal pure returns (bool) {
        bytes memory whatBytes = bytes(what);
        bytes memory whereBytes = bytes(where);

        if (whereBytes.length < whatBytes.length) {
            return false;
        }

        for (uint i = 0; i <= whereBytes.length - whatBytes.length; i++) {
            bool found = true;
            for (uint j = 0; j < whatBytes.length; j++) {
                if (whereBytes[i + j] != whatBytes[j]) {
                    found = false;
                    break;
                }
            }
            if (found) {
                return true;
            }
        }

        return false;
    }

    function _arrayContains(string[] memory arr, string memory target) internal pure returns (bool) {
        for (uint i = 0; i < arr.length; i++) {
            if (_compareStrings(arr[i], target)) {
                return true;
            }
        }
        return false;
    }
}
