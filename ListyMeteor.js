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
    user_id = randomString();

    Session.set("user", user_id);      
    Meteor.call('insertList', user_id);
    console.log("did insert list for user: " + user_id);

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

    console.log("here's user " + Session.get("user") + " list: ");
    console.log(list.text);
    return list.text;
  };

  Template.adminbar.events({
    'click a#editlist' : function () {
      toggleElement("list");
    },
    'click a#editsidebar' : function () {
      toggleElement("sidebar");
    }
  });

  Template.list_form.events({
    'keyup textarea#list1' : function (event) {
      Meteor.call('updateList', Session.get("user"), event.target.value);
    }
  })


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

  // Meteor.publish("products", function (userId) {
  //   return Products.find({userId: userId});
  // });

Meteor.startup(function () {
});

Meteor.methods({
  insertList: function (userId) {
    Lists.insert({userId: userId, text: 'Default list $4 here it is'});
  },
  updateList: function (userId, text) {
    Lists.update({userId: userId}, {text: text});
    Products.remove({userId: userId});

    matches = /([a-z A-Z]+) \$(\d+\.*\d*) +?([^#\+][a-z A-Z]+)/.exec(text)
    if (matches == null || matches.length < 4) { 
      return 
    }

    Products.insert({userId: userId, name: matches[1], price: parseFloat(matches[2], 10).toFixed(2), description: matches[3]});
  }
});


}
