var pageModule = (function($){
  var page = {};

  page.getText = function(e) {
    var text = e.parentNode.textContent;
    return text;
  };

  page.getElementByXpath = function(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  };

  page.getXPath = function(element) {
      var xpath = '';
      //  loop walks up dom tree for all nodes
      for (; element && element.nodeType == 1; element = element.parentNode) {
          // gets the element node index for each element
          var id = $(element.parentNode).children(element.tagName).index(element) + 1;
          // if greateer than one puts in brackets
          id > 1 ? (id = '[' + id + ']') : (id = '');
          // prepends to the element tagname and id to the xpath
          xpath = '/' + element.tagName.toLowerCase() + id + xpath;
      }
      return xpath;
  };

  //method for constructing revenant content item data model.
  page.getCompletePath = function(e) {
      var url = window.location.hostname + window.location.pathname;
      var xpath = page.getXPath(e.parentNode);
      var title = document.title;
      var oldText = e.parentElement.innerHTML;
      var completePath = {
          url: url,
          xpath: xpath,
          title: title,
          oldText: oldText
      };
      return completePath;
  }

  //helper function for posting to rev-api, creates page and default content item.
  page.createRevenantPage = function(page) {
      console.log('current revenant', page);
      $.ajax({
          type: 'POST',
          url: 'http://revenant-api.dev/revenant_page/page',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/hal+json'
          },
          data: JSON.stringify(page),
          success: function(data) {
              console.log('success', data)
          },
          error: function (err) {
              console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
          }
      })
  }

  ///check for revenant content for current page, appends all content and invokes pageController callback.
  page.revenantContentCheck = function(callback) {
      const currentPage = window.location.hostname + window.location.pathname;
      $.ajax({
          method: 'GET',
          url:'http://revenant-api.dev/rev-content/?url=' + currentPage,
          success: function(data) {
              console.log('success again!', data);

              //if no revenant nodes are sent, send current revenant data to be created as revenant revenant entity reference
              if (!data.length) {
                  var currentPage = {};
                  currentPage.title = window.location.hostname + window.location.pathname;
                  currentPage.url = currentPage;
                  page.createRevenantPage(page);
              }

              // if data is received replace all corresponding text nodes with new text using saved xpath.
              else {
                  data.forEach(function(item) {
                    //excludes default content item.
                      if (item.field_xpath.includes('default')) {
                          return
                      }
                      var editedNode = page.getElementByXpath(item.field_xpath);
                      editedNode.innerHTML = item.field_new_content;
                  })
              }
              callback();
          },
          error: function (err) {
              console.log("AJAX error in request: " + err);
          }
      })
  }

    //initializes check for content and passes in pageController as callback
  page.init = function(callback) {
    page.revenantContentCheck(callback)
  };

  return {
    getCompletePath : page.getCompletePath,
    init : page.init,
  }
})(jQuery);
