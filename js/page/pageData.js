var pageDataModule = (function(){
  var pageData = {};
  pageData.all = []

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

  pageData.getCompletePath = function(e){
      var url = window.location.href;
      var xpath = pageData.getXPath(e.parentNode);
      var title = encodeURIComponent(document.title.trim());
      var completePath = url + ']][[' + xpath + ']][[' + title;
      return completePath;
  }

  pageData.getText = function(e){
    var text = e.parentNode.textContent;
    return text;
  };

  pageData.getElementByXpath = function(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  };

//for returned text, resolves ckeditor inline character entitity issues when reloading new text.
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

  pageData.init = function(){

    pageData.dataJsonWrite();

    var root = 'https://jsonplaceholder.typicode.com';

    $.ajax({
      url:'http://revenant-api.bfdig.com/content',
      method: 'GET'
    }).then(function(data) {
      console.log(data);
    });

    // $.ajax({
    //   type: 'POST',
    //   url: 'http://revenant-api.bfdig.com/entity/node',
    //   crossDomain: true,
    //   cors: true,
    //   xhrFields: {
    //     withCredentials: true
    //   },
    //   headers: {
    //        'Accept': 'application/json',
    //        'Content-Type': 'application/hal+json',
    //        'Authorization': 'Basic Og== '
    //    },
    //    body: JSON.stringify({
    //        "_links": {
    //          "type": {
    //            "href":"http://revenant-api.bfdig.com/rest/type/node/revenant_page"
    //          }
    //        },
    //        "type":[{"target_id":"revenant_page"}],
    //        "title":[{"value":'Page'}],
    //        "field_page_url":[{"value":'url'}],
    //        "field_page_node":[
    //          {"field_xpath":"xpath"},
    //          {"field_old_text":"old text"},
    //          {"field_new_text":"new text"}
    //        ]
    //    }),
    //    success: function() {
    //      console.log('success')
    //    },
    //    error: function (err) {
    //     console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
    // }
    // })
  };

  return {
    getCompletePath : pageData.getCompletePath,
    init : pageData.init
  }
})();
