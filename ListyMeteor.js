
if (Meteor.isClient) {
  Meteor.startup(function () {
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

  Handlebars.registerHelper('editedElementIs', function (elementName) {
    return editedElementIs(elementName);
  });

  Template.adminbar.events({
    'click a#editlist' : function () {
      toggleElement("list");
    },
    'click a#editsidebar' : function () {
      toggleElement("sidebar");
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
// code to run on server at startup
});
}
