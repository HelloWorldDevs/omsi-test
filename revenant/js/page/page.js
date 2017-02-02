var pageDataModule = (function($){
  var pageData = {};

  pageData.getText = function(e) {
    var text = e.parentNode.textContent;
    return text;
  };

  pageData.getElementByXpath = function(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  };

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

    function getPathTo(element) {
        if (element.id!=='')
            return 'id("'+element.id+'")';
        if (element===document.body)
            return element.tagName;
        var ix= 0;
        var siblings= element.parentNode.childNodes;
        for (var i= 0; i<siblings.length; i++) {
            var sibling= siblings[i];
            if (sibling===element)
                return getPathTo(element.parentNode)+'/'+element.tagName+'['+(ix+1)+']';
            if (sibling.nodeType===1 && sibling.tagName===element.tagName)
                ix++;
        }
    }

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

    //helper function for posting to rev-api, creates page and default content item.
    pageData.createRevenantPage = function(page) {
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

    ///check for revenant revenant content items for current revenant.
    pageData.revenantContentCheck = function(callback) {
        const currentPage = window.location.hostname + window.location.pathname;
        $.ajax({
            method: 'GET',
            url:'http://revenant-api.dev/rev-content/?url=' + currentPage,
            success: function(data) {
                console.log('success again!', data);

                //if no revenant nodes are sent, send current revenant data to be created as revenant revenant entity reference
                if (!data.length) {
                    var page = {};
                    page.title = window.location.hostname + window.location.pathname;
                    page.url = currentPage;
                    pageData.createRevenantPage(page);
                }

                // check all content items and replace revenant text with text from DB
                else {
                    data.forEach(function(item) {
                        if (item.field_xpath.includes('default')) {
                            return
                        }
                        var editedNode = pageData.getElementByXpath(item.field_xpath);
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
  pageData.init = function(callback) {
    pageData.revenantContentCheck(callback)
  };

  return {
    getCompletePath : pageData.getCompletePath,
    init : pageData.init,
  }
})(jQuery);
