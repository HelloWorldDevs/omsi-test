var pageDataModule = (function(){
  var pageData = {};
  pageData.all = [];

  pageData.getXPath = function(element) {
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

  pageData.getCompletePath = function(e) {
      var url = window.location.hostname + window.location.pathname;
      var xpath = pageData.getXPath(e.parentNode);
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

  pageData.getText = function(e){
    var text = e.parentNode.textContent;
    return text;
  };

  pageData.getElementByXpath = function(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  };

//for returned text, resolves ckeditor inline character entity issues when reloading new text.
  pageData.decodeEntities = (function() {
    // this prevents any overhead from creating the object each time
    var element = document.createElement('div');
    function decodeHTMLEntities (str) {
      if(str && typeof str === 'string') {
        // strip script/html tags
        str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
        str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
        element.innerHTML = str;
        str = element.textContent;
        element.textContent = '';
      }
      return str;
    }
    return decodeHTMLEntities;
  })();

//checks data.json and updates elements on page with saved text different from older text
  pageData.dataJsonSend = function(data){
    $.ajax({
      type: 'POST',
      url : 'http://rev.bfdig.com/data',
      dataType: 'jsonp',
      contentType : 'application/json',
      data: JSON.stringify(data)
    }).then(function(data){
      if(data.length > 0){
        // console.log(data)
        data.forEach(function(item){
          var el = pageData.getElementByXpath(item.xpath);
          var decodedText = pageData.decodeEntities(item.newText);
          el.textContent = decodedText;
        })
      }
    })
  }

//sends initial oldText and Complete path data to data.json file and for sending data to check against dataJson
  pageData.dataJsonWrite = function(){
    var body = document.getElementsByTagName('body')[0];
    function recurse(element){
      if (element.childNodes.length > 0){
          for (var i = 0; i < element.childNodes.length; i++)
              recurse(element.childNodes[i]);
      }
      if (element.nodeType == Node.TEXT_NODE && element.nodeValue.trim() != '' && element.parentNode.nodeName != 'SCRIPT' && element.parentNode.nodeName != 'NOSCRIPT'){
          var completePath = pageData.getCompletePath(element);
          var oldText = pageData.getText(element);
          pageData.all.push({
            completePath : completePath,
            oldText : oldText
          })
      }
    }
    recurse(body);
    pageData.dataJsonSend(pageData.all);
  };

  pageData.init = function() {
    pageData.dataJsonWrite();



    //BETTER SOLUTION
    // create a D8 callback that handles everything, creates page and entity all in opn php callback
    //if page doesn't exist only create the page reference.

    $(function () {

    /// USER LOGIN REST REQUEST FORMAT
    //   var data = {
    //         "name": "",
    //         "pass": "",
    //       }
    //
    //   $.ajax({
    //     url: "http://revenant-api.dev/user/login?_format=json",
    //     type: "POST",
    //     contentType: "application/json",
    //     data: JSON.stringify(data)
    //   })
    //       .error(function(error){console.log('login error', error)})
    //       .done(function (response, status, xhr) {
    //     console.log('login response', response);



      //Oauth POST
        data = {
          "grant_type": "password",
          "client_id": "", //with the the client’s ID
          "client_secret": "", //with the client’s secret
          "username": "", //with the user’s username
          "password": "",  //with the user’s password
        }
        $.ajax({
          url: "http://revenant-api.dev/oauth/token",
          method: "POST",
          data: data,
        }).error(function(error){console.log('oauth error', error)})
              .done(function (response, status, xhr) {
            console.log('oauth response', response);
          });

      });


  ///check for revenant page content items for current page.
    function revenantContentCheck() {
      const currentPage = window.location.hostname + window.location.pathname;
      $.ajax({
        method: 'GET',
        url:'http://revenant-api.dev/rev-content/?url=' + currentPage,
        success: function(data) {
          console.log('success again!', data);

          //if no page nodes are sent, send current page data to be created as revenant page entity reference
          if (!data.length) {
            var page = {};
            page.title = window.location.hostname + window.location.pathname;
            page.url = currentPage;
            createRevenantPage(page);
          }

          // check all content items and replace page text with text from DB
          else {
            data.forEach(function(item) {
              if (item.field_xpath.includes('default')) {
                return
              }
              var editedNode = pageData.getElementByXpath(item.field_xpath);
              editedNode.innerHTML = item.field_new_content;
            })
          }
        },
        error: function (err) {
          console.log("AJAX error in request: " + err);
        }
      })
    }


    ///revenant page create
    function createRevenantPage(page) {
      console.log('current page', page);
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

    revenantContentCheck()


  };

  return {
    getCompletePath : pageData.getCompletePath,
    init : pageData.init,
  }
})();
