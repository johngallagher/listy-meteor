Items to present

* Show List of Things for Sale
* Outline principles of Meteor
* Show the clone I've made in Meteor

Areas of Meteor that I've played with

Collections
* Data storage - Mongo DB
* Simulates database access from the client - Lists.insert({})
* Obvious security considerations - remove insecure and autopublish and the client can't insert randomly into the database.

Publish and Subscribe
* Allows serving different data to each client
* Makes things more secure too - the client only sees the data it needs
* Transparent API

Calling Methods on Server
* An early gotcha - inserting items into the database from the client wasn't working.
* When you want to update something, use Meteor.call

Events 
* Event driven architecture - reactive elements

  // List view
  Template.list_view.products = function () {
    return Products.find({});
  }

  The products template is rerendered whenever the Products collection changes

  Deps.autorun(function(){
    // Code in here is re-evaluated whenever a reactive element within the scope changes
  });

Users
* The simplest user accounts section to set up EVER.


Gotchas

* Meteor mongo paging view
* Only shows the first few lines! Use "it" to load the next page

* Took a while to get my head around Lists being for different collections on client and server
* Need to insert stuff on the server, not the client - use meteor.call

Deps.autorun(function(){ 
  Meteor.subscribe("this_users_lists", user_id);
});

without the autorun function it's not going to auto change the subscription.

update method needs $set to set only the fields we want to chnage otherwise it wipes out the other fields already set.

No model object. Look at https://github.com/tmeasday/meteor-models

When reload is hit, info in Session is nuked. You need to use amplify.store("") to store things in the local storage.

