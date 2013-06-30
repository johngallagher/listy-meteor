// Lists = new Meteor.Collection("lists");
// Products = new Meteor.Collection("products");

// function randomString() {
//   var text = "";
//   var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

//   for( var i=0; i < 5; i++ )
//     text += possible.charAt(Math.floor(Math.random() * possible.length));

//   return text;
// }

// if (Meteor.isClient) {
//   Meteor.startup(function () {
//     Deps.autorun(function(){
//       console.log("rerunning autorun");

//       // Read the users
//       user_id           = amplify.store("user");      
//       logged_in_user_id = Meteor.userId();
//       current_user_id   = user_id;

//       console.log("stored user is:");
//       console.log(user_id);

//       console.log("logged in user is:");
//       console.log(logged_in_user_id);
      
//       never_visited         = !user_id  && !logged_in_user_id;
//       visited_logged_in     = user_id   && logged_in_user_id;

//       if (never_visited) {
//         user_id = randomString();
//         amplify.store("user", user_id);
//         Meteor.call('insertDefaultList', user_id);

//       } else if (visited_logged_in) {
//         Meteor.call('updateUserOfList', user_id, logged_in_user_id);
//         amplify.store("user", logged_in_user_id);
//         current_user_id = logged_in_user_id;
//       }

//       Meteor.subscribe("this_users_lists", current_user_id);
//       Meteor.subscribe("this_users_products", current_user_id);
//     });

//     Session.set("edited_element", "");
//   });


//   setEditedElement = function (elementName) {
//     return Session.set("edited_element", elementName);
//   };

//   editedElementIs = function (elementName) {
//     return Session.get("edited_element") == elementName;
//   };

//   toggleElement = function (elementName) {
//     if(editedElementIs(elementName)) {
//       setEditedElement("");
//     } else {
//       setEditedElement(elementName);
//     }
//   };

//   // Edited element
//   Handlebars.registerHelper('editedElementIs', editedElementIs);


//   // List view
//   Template.list_view.products = function () {
//     return Products.find({});
//   }

//   // List form
//   Template.list_form.listDescription = function () {
//     // Sometimes the list isn't found because it hasn't been inserted yet
//     list = Lists.findOne({});
//     if (!list) { return "" };

//     return list.text;
//   };

//   Template.list_form.events({
//     'keyup textarea#list1' : function (event) {
//       Meteor.call('updateList', amplify.store("user"), event.target.value);
//     }
//   });

//   // Admin bar
//   Template.adminbar.events({
//     'click a#editlist' : function () {
//       // toggleElement("list");
//     },
//     'click a#editsidebar' : function () {
//       toggleElement("sidebar");
//     }
//   });

//   // Product
//   Template.product.expanded = function () {
//     return Session.equals("expanded", this._id) ? "expanded" : '';
//   };

//   Template.product.events({
//     "click .item_name": function (event) {
//       // Collapse if we've clicked on the item that's currently expanded
//       if (Session.get("expanded") == this._id) {
//         Session.set("expanded", "");
//         return;
//       } 

//       Session.set("expanded", this._id);
//     }
//   });
// }

// if (Meteor.isServer) {
//   Deps.autorun(function(){ 
//     Meteor.publish("this_users_lists", function (user_Id) {
//       return Lists.find({userId: user_Id});
//     });
//     Meteor.publish("this_users_products", function (user_Id) {
//       return Products.find({userId: user_Id});
//     });
//   });

//   Meteor.startup(function () {
//   });

//   function toCurrency (price) {
//     return parseFloat(price, 10).toFixed(2);
//   };

//   Meteor.methods({
//     insertDefaultList: function (userId) {
//       defaultText = 'Default list £4 here it is';
//       Lists.insert({userId: userId, text: defaultText});
//       Products.insert({userId: userId, name: "Default list", price: toCurrency(4), description: "here it is"});
//     },
//     updateUserOfList: function (old_user_id, new_user_id) {
//       Lists.update({userId: old_user_id}, {$set: {userId: new_user_id}});      
//       Products.update({userId: old_user_id}, {$set: {userId: new_user_id}}, { multi: true });
//     },
//     updateList: function (userId, text) {
//       Lists.update({userId: userId}, {$set: {text: text}});

//       productLines = text.split("\n");
//       products = Products.find({userId: userId}).fetch();

//       var productCount = products.length;
//       var productIndex = 0;

//       for (var index = 0; index < productLines.length; ++index) {
//         productLine = productLines[index]
//         productAttributes = /([a-z A-Z]+) \£(\d+\.*\d*)( *([a-z A-Z!,.:-]+))*/.exec(productLine)

//         if (productAttributes && productAttributes.length >= 5) {
//           name = productAttributes[1];
//           price = toCurrency(productAttributes[2]);
//           description = "";
//           if (productAttributes[4]) { description = productAttributes[4] };

//           if (products[productIndex]) {
//             Products.update({_id: products[productIndex]._id}, {$set: { name: name, price: price, description: description }});
//           } else {
//             Products.insert({userId: userId, name: name, price: price, description: description });            
//           }
//           productIndex++;
//         }
//       }

//       if (productIndex > productCount) { return };
//       // Remove remaining products
//       for (var index = productIndex; index < productCount; ++index) {
//         Products.remove({_id: products[index]._id});
//       }
//     }
//   });
// }

