Lists = new Meteor.Collection("lists");
Products = new Meteor.Collection("products");

function randomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 5; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

Meteor.startup(function () {
  Deps.autorun(function(){
    console.log("rerunning autorun");

      // Read the users
      user_id           = amplify.store("user");      
      logged_in_user_id = Meteor.userId();
      current_user_id   = user_id;

      console.log("stored user is:");
      console.log(user_id);

      console.log("logged in user is:");
      console.log(logged_in_user_id);
      
      never_visited         = !user_id  && !logged_in_user_id;
      visited_logged_in     = user_id   && logged_in_user_id;

      if (never_visited) {
        user_id = randomString();
        amplify.store("user", user_id);
        Meteor.call('insertDefaultList', user_id);

      } else if (visited_logged_in) {
        Meteor.call('updateUserOfList', user_id, logged_in_user_id);
        amplify.store("user", logged_in_user_id);
        current_user_id = logged_in_user_id;
      }

      Meteor.subscribe("this_users_lists", current_user_id);
      Meteor.subscribe("this_users_products", current_user_id);
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

  // Edited element
  Handlebars.registerHelper('editedElementIs', editedElementIs);


  // List view
  Template.list_view.products = function () {
    return Products.find({});
  }

  // List form
  Template.list_form.listDescription = function () {
    // Sometimes the list isn't found because it hasn't been inserted yet
    list = Lists.findOne({});
    if (!list) { return "" };

    return list.text;
  };

  Template.list_form.events({
    'keyup textarea#list1' : function (event) {
      Meteor.call('updateList', amplify.store("user"), event.target.value);
    }
  });

  // Admin bar
  Template.adminbar.events({
    'click a#editlist' : function () {
      // toggleElement("list");
    },
    'click a#editsidebar' : function () {
      toggleElement("sidebar");
    }
  });

  // Product
  Template.product.expanded = function () {
    return Session.equals("expanded", this._id) ? "expanded" : '';
  };

  Template.product.events({
    "click .item_name": function (event) {
      // Collapse if we've clicked on the item that's currently expanded
      if (Session.get("expanded") == this._id) {
        Session.set("expanded", "");
        return;
      } 

      Session.set("expanded", this._id);
    }
  });