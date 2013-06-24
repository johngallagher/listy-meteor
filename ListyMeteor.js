Products = new Meteor.Collection("products");
Lists = new Meteor.Collection("lists");

if (Meteor.isClient) {
  Meteor.startup(function () {
    var my_list_id = Lists.insert({description: "Default list", shop: 33});
    Session.set("my_list", my_list_id);
    Session.set("my_shop_id", 33);
    Session.set("edited_element", "");


    // if (Products.find({shop: 33}).count() == 0) {
    //   Products.insert({shop: 33, name: "Fender", price: 33.42, quantity: 1});
    // }
  });

  setEditedElement = function (elementName) {
    return Session.set("edited_element", elementName);
  };

  editedElementIs = function (elementName) {
    return Session.get("edited_element") == elementName;
  };

  function makeid(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  };

  toggleElement = function (elementName) {
    if(editedElementIs(elementName)) {
      Lists.update(Session.get("my_list"), {description: $('textarea').val(), shop: 33});      
      setEditedElement("");
    } else {
      setEditedElement(elementName);
    }
  };

  Handlebars.registerHelper('editedElementIs', editedElementIs);

  Handlebars.registerHelper('products', function() {
    return Products.find({shop: 33});
  });

  Template.list_form.listDescription = function () {
    return Lists.findOne({_id: Session.get("my_list")}).description;
    
  };

  Template.adminbar.events({
    'click a#editlist' : function () {
      // console.log("Here's the list box: " + this.find('div'));
      
      // Lists.update(Session.get("my_list"), {description: "My stuff"});      
      toggleElement("list");
    },
    'click a#editsidebar' : function () {
      toggleElement("sidebar");
    }
  });


}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Lists.find({shop: 33}).observe({
      changed: function (newDocument, oldDocument) {
        Products.remove({});
        Products.insert({shop: 33, name: newDocument.description});
        // console.log("List updated! Description is: " + newDocument.description);
      }
    });
  });
}
