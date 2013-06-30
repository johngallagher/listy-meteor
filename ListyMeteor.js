Lists = new Meteor.Collection("lists");
Products = new Meteor.Collection("products");

function randomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 5; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

if (Meteor.isClient) {
  Meteor.startup(function () {
    user_id = amplify.store("user");
    console.log("heres the current user id: ");
    console.log(user_id);

    if (!user_id) {
      user_id = randomString();

      amplify.store("user", user_id);      
      Meteor.call('insertDefaultList', user_id);
      console.log("did insert list for user: " + user_id);
    };

    Deps.autorun(function(){ 
      Meteor.subscribe("this_users_lists", user_id);
      console.log("did subscribe to list for user " + user_id);

      Meteor.subscribe("this_users_products", user_id);
      console.log("did subscribe to products for user " + user_id);
    });

    Session.set("edited_element", "");
  });

  setEditedElement = function (elementName) {
    return Session.set("edited_element", elementName);
  };

  editedElementIs = function (elementName) {
    return Session.get("edited_element") == elementName;
  };

  toggleElement = function (elementName) {
    if(editedElementIs(elementName)) {
      setEditedElement("");
    } else {
      setEditedElement(elementName);
    }
  };

  Handlebars.registerHelper('editedElementIs', editedElementIs);

  Handlebars.registerHelper('products', function() {
    return Products.find({});
  });

  Template.list_form.listDescription = function () {
    list = Lists.findOne({});
    if (!list) { return "" };

    return list.text;
  };

  Template.list_form.events({
    'keyup textarea#list1' : function (event) {
      Meteor.call('updateList', amplify.store("user"), event.target.value);
    }
  });

  Template.adminbar.events({
    'click a#editlist' : function () {
      // toggleElement("list");
    },
    'click a#editsidebar' : function () {
      toggleElement("sidebar");
    }
  });

  Template.product.expanded = function () {
    return Session.equals("expanded", this._id) ? "expanded" : '';
  };

  Template.product.events({
    "click .item_name": function (event) {
      if (Session.get("expanded") == this._id) {
        Session.set("expanded", "");
        return;
      } 

      Session.set("expanded", this._id);
    }
  });
}

if (Meteor.isServer) {
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

  Meteor.methods({
    insertDefaultList: function (userId) {
      defaultText = 'Default list £4 here it is';
      Lists.insert({userId: userId, text: defaultText});
      Products.insert({userId: userId, name: "Default list", price: parseFloat(4, 10).toFixed(2), description: "here it is"});
    },
    updateList: function (userId, text) {
      Lists.update({userId: userId}, {$set: {text: text}});

      textLines = text.split("\n");
      products = Products.find({userId: userId}).fetch();

      var productCount = products.length;
      var productIndex = 0;
      
      for (var index = 0; index < textLines.length; ++index) {
        line = textLines[index];
        matches = /([a-z A-Z]+) \£(\d+\.*\d*)( *([a-z A-Z!,.:-]+))*/.exec(line)

        if (matches && matches.length >= 5) {
          description = "";

          if (matches[4]) { description = matches[4] };

          if (products[productIndex]) {
            Products.update({_id: products[productIndex]._id}, {$set: { name: matches[1], price: parseFloat(matches[2], 10).toFixed(2), description: description }});
          } else {
            Products.insert({userId: userId, name: matches[1], price: parseFloat(matches[2], 10).toFixed(2), description: description });            
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
}

