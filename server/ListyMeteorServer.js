Lists = new Meteor.Collection("lists");
Products = new Meteor.Collection("products");
  Deps.autorun(function(){ 
    Meteor.publish("this_users_lists", function (user_Id) {
      return Lists.find({userId: user_Id});
    });
    Meteor.publish("this_users_products", function (user_Id) {
      return Products.find({userId: user_Id});
    });
  });

  Meteor.startup(function () {
  });

  function toCurrency (price) {
    return parseFloat(price, 10).toFixed(2);
  };

  Meteor.methods({
    insertDefaultList: function (userId) {
      defaultText = 'Default list £4 here it is';
      Lists.insert({userId: userId, text: defaultText});
      Products.insert({userId: userId, name: "Default list", price: toCurrency(4), description: "here it is"});
    },
    updateUserOfList: function (old_user_id, new_user_id) {
      Lists.update({userId: old_user_id}, {$set: {userId: new_user_id}});      
      Products.update({userId: old_user_id}, {$set: {userId: new_user_id}}, { multi: true });
    },
    updateList: function (userId, text) {
      Lists.update({userId: userId}, {$set: {text: text}});

      productLines = text.split("\n");
      products = Products.find({userId: userId}).fetch();

      var productCount = products.length;
      var productIndex = 0;

      for (var index = 0; index < productLines.length; ++index) {
        productLine = productLines[index]
        productAttributes = /([a-z A-Z]+) \£(\d+\.*\d*)( *([a-z A-Z!,.:-]+))*/.exec(productLine)

        if (productAttributes && productAttributes.length >= 5) {
          name = productAttributes[1];
          price = toCurrency(productAttributes[2]);
          description = "";
          if (productAttributes[4]) { description = productAttributes[4] };

          if (products[productIndex]) {
            Products.update({_id: products[productIndex]._id}, {$set: { name: name, price: price, description: description }});
          } else {
            Products.insert({userId: userId, name: name, price: price, description: description });            
          }
          productIndex++;
        }
      }

      if (productIndex > productCount) { return };
      // Remove remaining products
      for (var index = productIndex; index < productCount; ++index) {
        Products.remove({_id: products[index]._id});
      }
    }
  });