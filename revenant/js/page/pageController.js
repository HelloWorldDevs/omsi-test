var pageControllerModule = (function($){
  var pageController = {};

  //ckeditor inline save plugin configuration.
  CKEDITOR.plugins.addExternal('inlinesave', '/revenant/ckeditor/inlinesave/', 'plugin.js' );
  CKEDITOR.disableAutoInline = true;


//inline editor added on text element click
  pageController.edit = function() {
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
  pageController.addEditClass = function(){
    var body = document.getElementsByTagName('body')[0];
    function recurseAdd(element){
      if (element.childNodes.length > 0){
          for (var i = 0; i < element.childNodes.length; i++)
              recurseAdd(element.childNodes[i]);
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
    recurseAdd(body);
  };

    pageController.removeEditClass = function(){
        var body = document.getElementsByTagName('body')[0];
        function recurseRemove(element){
            if (element.childNodes.length > 0){
                for (var i = 0; i < element.childNodes.length; i++)
                    recurseRemove(element.childNodes[i]);
            }
            if (element.nodeType == Node.TEXT_NODE && element.nodeValue.trim() != '' && element.parentNode.nodeName != 'SCRIPT' && element.parentNode.nodeName != 'NOSCRIPT') {
                var completePath = pageDataModule.getCompletePath(element);
                element.parentNode.classList.remove("text--edit");
                $('[data-category="' + completePath.xpath + '"]').removeData('complete-path');
                element.parentNode.removeAttribute('data-category');
                element.parentNode.removeAttribute('contenteditable');
                if(element.parentNode.nodeName === 'A'){
                    element.parentNode.onclick = null;
                }
            }
        }
        recurseRemove(body);
    };


    pageController.appendLogin = function() {
        (function() {
            templateModule.getCompiledTemplate('login')
                .then(function(html){
                $('body').prepend(html);
                $('.rev_login_reveal').on('click', function() {
                  $('.rev_login__contaier').toggleClass('show');
                    pageController.loginAuthenticate();
                })
            });
        }())
    };

    pageController.appendControlPanel = function() {
            templateModule.getCompiledTemplate('user_control_panel')
                .then(function(html){
                    var rev_auth = JSON.parse(sessionStorage.getItem('rev_auth'));
                    $('body').prepend(html(rev_auth));
                    $('.rev_logout').on('click', function() {
                        $('.rev_user_control_panel').fadeOut();
                        pageController.removeEditClass();
                        sessionStorage.clear();
                        pageController.init();
                    })
                });
    };

    pageController.loginAuthenticate = function() {
      $('.rev_login__form').on('submit', function(e) {
        var username = $(this).find('input[title="username"]').val();
        var password = $(this).find('input[title="password"]').val();
        console.log(username, password);
          e.preventDefault();
          //Oauth POST
            data = {
              "grant_type": "password",
              "client_id": ,
              "client_secret": password,
              "username": username,
              "password": password,
            }
            $.ajax({
              url: "http://revenant-api.dev/oauth/token",
              method: "POST",
              data: data,
            })
              .error(function(error){
              console.log('oauth error', error)
            })
              .done(function (response, status, xhr) {
                console.log('oauth response', response);
                  sessionStorage.setItem( 'rev_auth', JSON.stringify({
                    "username": username,
                    "access_token":response.access_token,
                    "refresh_token": response.refresh_token
                  }));
                  $('.rev_login').fadeOut().remove();
                  pageController.addEditClass();
                  pageController.edit();
                  pageController.appendControlPanel();
              });
      })
    };

  pageController.init = function() {
    if (!sessionStorage.getItem('rev_auth')) {
        pageController.appendLogin();
    } else {
        pageController.addEditClass();
        pageController.edit();
        pageController.appendControlPanel();
    }
  };

  return {
    init : pageController.init
  }

})(jQuery);
