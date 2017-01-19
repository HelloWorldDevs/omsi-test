var pageEditModule = (function(){
  var pageEdit = {};

  //ckeditor inline save plugin configuration.
  CKEDITOR.plugins.addExternal('inlinesave', '/ckeditor/inlinesave/', 'plugin.js' );
  CKEDITOR.disableAutoInline = true;
  CKEDITOR.config.inlinesave = {
  postUrl: 'http://revenant-api.dev/revenant_page/page_content',
  useJson: true,
  postData: {test: true},
  onSave: function(editor){
    console.log('save!', editor);
    return true;
  },
  onSuccess: function(editor, data) { console.log('save successful', editor, data); },
  onFailure: function(editor, status, request) { console.log('save failed', editor, status, request); },
  useJSON: true,
  useColorIcon: false
};

//inline editor added on text element click
  pageEdit.edit = function() {
    $('.text--edit').on('click', function() {
      console.log('click!')
      var dataCategory = $(this).attr('data-category');
      var el = document.querySelector('[data-category="'+ dataCategory +'"');
      if (!el.hasAttribute('id', dataCategory)) {
        el.setAttribute('id', dataCategory);
        CKEDITOR.inline(el, {
          bodyId: dataCategory,
          extraPlugins : 'inlinesave'
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
      if (element.nodeType == Node.TEXT_NODE && element.nodeValue.trim() != '' && element.parentNode.nodeName != 'SCRIPT' && element.parentNode.nodeName != 'NOSCRIPT'){
        var completePath = pageDataModule.getCompletePath(element);
        element.parentNode.className += ' text--edit';
        element.parentNode.setAttribute('data-category', completePath);
        element.parentNode.setAttribute('contenteditable','true');

        if(element.parentNode.nodeName === 'A'){
          element.parentNode.onclick = function(e){
            e.preventDefault();
          }
        }
      }
    }
    recurse(body);
  };


  pageEdit.init = function(){
    console.log('WORK!!!!');
    pageEdit.addEditClass();
    pageEdit.edit();
  };

  return {
    init : pageEdit.init
  }

})();
