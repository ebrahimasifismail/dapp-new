App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: async function() {
    // Load pets.
    // $.getJSON('../pets.json', function(data) {
    //   var petsRow = $('#petsRow');
    //   var petTemplate = $('#petTemplate');

    //   for (i = 0; i < data.length; i ++) {
    //     petTemplate.find('.panel-title').text(data[i].name);
    //     petTemplate.find('img').attr('src', data[i].picture);
    //     petTemplate.find('.pet-breed').text(data[i].breed);
    //     petTemplate.find('.pet-age').text(data[i].age);
    //     petTemplate.find('.pet-location').text(data[i].location);
    //     petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

    //     petsRow.append(petTemplate.html());
    //   }
    // });

    return App.initWeb3();
  },

  initWeb3: async function() {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        await window.ethereum.enable();
      }catch (error) {
        console.error("User denied account access")
      }
    }
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;

    }
    else {
      App.web3Provider = new Web3.provider.HttpProvider('http://localhost:7545');
      web3 = new web3(App.web3Provider);
    }
    
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Store.json", function(store){
      App.contracts.Store = TruffleContract(store);
      App.contracts.Store.setProvider(App.web3Provider);
      App.contracts.Store.deployed().then(function(store){
        console.log("Store Contract Address: ", store.address);
      });
      
    }).done(function(){
      $.getJSON("IceToken.json", function(iceToken){
        App.contracts.IceToken = TruffleContract(iceToken);
        App.contracts.IceToken.setProvider(App.web3Provider);
        App.contracts.IceToken.deployed().then(function(iceToken){
          console.log("Ice Token Address: ", iceToken.address);
        });
        App.listenForEvents();
        return App.render();
      })
    })
  },
  getToken: function() {
    toSent = $('#numberOfTokens').val();
    App.contracts.IceToken.deployed().then(function(instance){
      IceTokenInstance = instance;

      return IceTokenInstance.transfer(App.account, toSent)

    }).then(function(i){
      console.log(i.receipt)
    })
  },
  render: function() {
    var StoreInstance;
    var loader = $("#loader");
    var content = $("#content");


    loader.show();
    content.hide();

    web3.eth.getCoinbase(function (err, account){
      if(err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    App.contracts.Store.deployed().then(function(instance) {
      StoreInstance = instance;
      return StoreInstance.productCount();

    }).then(function(productCount){
      var productResults = $("#candidatesResults");
      productResults.empty();

      var productSelect = $('#candidatesSelect');
      productSelect.empty();

      for (var i = 1; i<= productCount; i++) {
        StoreInstance.products(i).then(function(product){
          var id = product[0];
          var name = product[1];
          var price = product[2];
          var stock = product[3];

          var productTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + price + "</td><td>"+ stock +"</td></tr>"
          productResults.append(productTemplate);

          var productOption = "<option value='" + id + "' >" + name + "</ option>"
          productSelect.append(productOption);
        });
      }
      
      loader.hide()
      content.show()

    }).catch(function(error) {
      console.warn(error);
    });
  },
  castVote: function() {
    var productId = $('#candidatesSelect').val();
    App.contracts.Store.deployed().then(function(instance){
      return instance.products(productId)
    }).then(function(price){
      var amount = price[2]["c"][0]
      App.contracts.IceToken.deployed().then(function(instance){
        IceTokenInstance = instance
        return instance.balanceOf(App.account)
      }).then(function(balance){
        if(balance["c"][0] > amount){
          IceTokenInstance.transfer("0x4f4bBe3994479DA5375f806465A3A3475f6753AD", amount)
        }
        else{
          alert("No Sufficient ICE balance");
        }
      })
    })

    
    App.contracts.Store.deployed().then(function(instance){
      return instance.buy(productId, {from: App.account})
    }).then(function(result){
      App.contracts
    }).then(function(result){
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err){
      console.error(err);
    });
  },
  listenForEvents: function() {
    App.contracts.Store.deployed().then(function(instance) {
      instance.boughtEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
