var pageEditModule = (function(){
  var pageEdit = {};

  //ckeditor inline save plugin configuration.
  CKEDITOR.plugins.addExternal('inlinesave', '/revenant/ckeditor/inlinesave/', 'plugin.js' );
  CKEDITOR.disableAutoInline = true;


//inline editor added on text element click
  pageEdit.edit = function() {
    $('.text--edit').on('click', function() {
      var dataCategory = $(this).attr('data-category');
      var data = $(this).data('complete-path');
      console.log('data here!', data);
      var el = document.querySelector('[data-category="'+ dataCategory +'"');
      if (!el.hasAttribute('id', data.xpath)) {
        el.setAttribute('id', data.xpath);
        CKEDITOR.config.inlinesave = {
          postUrl: 'http://revenant-api.dev/revenant_page/page_content',
          postData: {data: data},
          useJson: true,
          onSave: function(editor) {
            console.log('save success!', editor);
            return true;
          },
          onSuccess: function(editor, data) { console.log('save successful', editor, data); },
          onFailure: function(editor, status, request) { console.log('save failed', editor, status, request); },
          useJSON: true,
          useColorIcon: false
        };
        CKEDITOR.inline(el, {
          bodyId: data,
          title : 'test title',
          extraPlugins : 'inlinesave',
          allowedContent: true,
        });
      }
    });
  };

// adds edit class to all text nodes
  pageEdit.addEditClass = function(){
    var body = document.getElementsByTagName('body')[0];
    function recurse(element){
      if (element.childNodes.length > 0){
          for (var i = 0; i < element.childNodes.length; i++)
              recurse(element.childNodes[i]);
      }
      if (element.nodeType == Node.TEXT_NODE && element.nodeValue.trim() != '' && element.parentNode.nodeName != 'SCRIPT' && element.parentNode.nodeName != 'NOSCRIPT') {
        var completePath = pageDataModule.getCompletePath(element);
        element.parentNode.className += ' text--edit';
        element.parentNode.setAttribute('data-category', completePath.xpath);
        $('[data-category="' + completePath.xpath + '"]').data('complete-path', completePath);
        element.parentNode.setAttribute('contenteditable','true');
        if(element.parentNode.nodeName === 'A'){
          element.parentNode.onclick = function(e) {
            e.preventDefault();
          }
        }
      }
    }
    recurse(body);
  };

    pageEdit.appendLogin = function() {
        (function() {
            templateModule.getCompiledTemplate('login')
                .then(function(html){
                $('body').prepend(html);
                $('.rev_login_reveal').on('click', function() {
                  $('.rev_login__contaier').toggleClass('show');
                })
            });
        }())
    };

  pageEdit.init = function() {
    pageEdit.addEditClass();
    pageEdit.edit();
      pageEdit.appendLogin();
  };

  return {
    init : pageEdit.init
  }

})();
