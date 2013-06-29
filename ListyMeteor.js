Products = new Meteor.Collection("products");
Lists = new Meteor.Collection("lists");

if (Meteor.isClient) {
  Meteor.startup(function () {
    if (!Session.get("my_list")) {
      var my_list_id = Lists.insert({description: "Default list"});
      Session.set("my_list", my_list_id);      
    }
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
    return Products.find({list: Session.get("my_list")});
  });

  Template.list_form.listDescription = function () {
    if (!Session.get("my_list")) {
      var my_list_id = Lists.insert({description: "Default list"});
      Session.set("my_list", my_list_id);
      return "Default list";
    } else {
      list = Lists.findOne({_id: Session.get("my_list")})
      if (list) {
        return list.description;
      } else {
        console.log("can't find session " + Session.get("my_list"));
        console.log(Lists.find({}));
        return "";
      }
    }
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

  Template.list_form.events({
    'keyup textarea#list1' : function (event) {
      // console.log(event.target);
      Meteor.call('updateList', Session.get("my_list"), event.target.value);
    }
  })


}

if (Meteor.isServer) {
  Meteor.startup(function () {
  });

  Meteor.methods({

    updateList: function (listId, listText) {
      Lists.update(listId, {description: listText});
      Products.remove({list: listId});

      matches = /([a-z A-Z]+) \$(\d+\.*\d*) +?([^#\+][a-z A-Z]+)/.exec(listText)
      if (matches == null || matches.length < 4) { return }

      Products.insert({list: listId, name: matches[1], price: parseFloat(matches[2], 10).toFixed(2), description: matches[3]});      
    }
  });
}
