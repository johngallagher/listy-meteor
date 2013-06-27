Products = new Meteor.Collection("products");
Lists = new Meteor.Collection("lists");

if (Meteor.isClient) {
  Meteor.startup(function () {
    var my_list_id = Lists.insert({description: "Default list"});
    Session.set("my_list", my_list_id);      
    
    // var observed = Lists.find({_id: my_list_id}).observe({
    //   changed: function (newDocument, oldDocument) {
    //     Products.insert({list: newDocument._id, name: newDocument.description});
    //   }
    // });

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
      Meteor.call('updateList', Session.get("my_list"), $('textarea').val());
      // Products.find({list: Session.get("my_list")}).forEach(function (product) {
      //   Products.remove(product._id);
      // }); 
      // Products.insert({list: Session.get("my_list"), name: $('textarea').val()});

      // Lists.update(Session.get("my_list"), {description: $('textarea').val()});

      setEditedElement("");
    } else {
      setEditedElement(elementName);
    }
  };

  Handlebars.registerHelper('editedElementIs', editedElementIs);

  Handlebars.registerHelper('products', function() {
    return Products.find({list: Session.get("my_list")});
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
  });

  Meteor.methods({
    updateList: function (listId, listText) {
      matches = /([a-z A-Z]+) \$(\d+\.*\d*) +?([^#\+][a-z A-Z]+)/.exec(listText)
      Products.remove({list: listId});
      Products.insert({list: listId, name: matches[1], price: parseFloat(matches[2], 10).toFixed(2), description: matches[3]});      
      Lists.update(listId, {description: listText});
    }
  });
}
