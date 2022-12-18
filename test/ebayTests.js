const Ebay = artifacts.require("Ebay");

const {expectRevert} = require('@openzeppelin/test-helpers');

contract ("Ebay", (accounts) => {
    let ebay;

    beforeEach(async () => {
        ebay = await Ebay.deployed();
        console.log(ebay.address);
    });


    const auction = {
        name: "auction1",
        description: "selling item1",
        min: 10
    }

    const[seller,buyer1,buyer2] = [accounts[0],accounts[1],accounts[2]]

    it ("should create an auction", async() => {
        let auctions;
        await ebay.createAuction(auction.name, auction.description,auction.min);
        auctions = await ebay.getAuctions();

        assert (auctions.length === 1);
        assert (auctions[0].name === auction.name);
        assert (auctions[0].description === auction.description);
        assert (parseInt(auctions[0].min) === auction.min);
    });

    it ("should not create an offer if auction does not exist", async() => {
        await expectRevert(ebay.createOffer(1, {from: buyer1, value: auction.min + 10}), 
            "Auction does not exist"
        );
    });

    it ("should not create an offer if auction does not exist", async() => {
        await ebay.createAuction(auction.name, auction.description,auction.min);
        await expectRevert(
            ebay.createOffer(1, {from: buyer1, value: auction.min - 2}),
            "msg.value must be greater than the minimum and the best offer"
        )  
    });

    it ("should create an auction", async() => {
        let auctions;
        await ebay.createAuction(auction.name, auction.description,auction.min);
        await ebay.createOffer(1, {from: buyer1, value:auction.min+2});

        const userOffers = await ebay.getUserAuctions(buyer1);
        assert(userOffers.length === 1);
        assert(parseInt(userOffers[0].id) === 1);
        assert(parseInt(userOffers[0].id) === 1);
        assert(userOffers[0].buyer === buyer1);
        assert(parseInt(userOffers[0].price) === auction.min+2);
    });

    it ("should not transact if auction does not exist", async() => {
        await expectRevert(ebay.transaction(1), "Auction does not exist");
    });

    it ("should do transaction", async() => {
        const bestPrice = web3.utils.toBN(auction.min+10);
        await ebay.createAuction(auction.name,auction.description,auction.min);
        await ebay.createOffer(1,{from:buyer1, value:auction.min})
        await ebay.createOffer(1,{from:buyer2, value:bestPrice});
        const balanceBefore = web3.utils.toBN(await web3.eth.getbalance(seller));
        console.log(await web3.eth.getbalance(seller));

        await ebay.transaction(1,{from:accounts[3]});
        const balanceAfter = web3.utils.toBN(await web3.eth.getbalance(seller));
        console.log(await web3.eth.getbalance(seller));

        assert(balanceAfter.sub(balanceBefore).eq(bestPrice));
    });





    });

    // it("Accounts printing", async() =>{

    // });
    
    // it("Accounts printing", async() =>{

    // });

