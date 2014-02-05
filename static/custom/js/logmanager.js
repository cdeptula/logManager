/********************************** Project namespace *******************************************/
var sparkl = {};
(function(myself){

  myself.changeLocation = function (newLocation, bookmarks, isNew, tabName){
  if(!newLocation){ return; }
    var hash = (bookmarks && !_.isEmpty(bookmarks) ) ? '#' + generateHashValue( "bookmark" , { impl: "client" , params: bookmarks } ) : "";
    if (isNew){
      top.mantle_openTab(tabName,tabName, newLocation + hash);
      } else {
        window.location = newLocation + hash;
    }
  }

  function generateHashValue (key, value) {
    var obj = Dashboards.getHashValue(),json;
    if (arguments.length == 1) {
      obj = key;
    } else {
      obj[key] = value;
    }
    json = JSON.stringify(obj);
    return json;
  }

    myself.runEndpointAsLink = function ( pluginId, endpoint, opts )
    {
        var hiddenIFrameID = 'hiddenDownloader';
        var iframe = document.getElementById(hiddenIFrameID);
        if(iframe === null)
        {
            iframe = document.createElement('iframe');
            iframe.id = hiddenIFrameID;
            iframe.style.displaye = 'none';
            document.body.appendChild(iframe);
        }
        url = Dashboards.getWebAppPath() + '/plugin/' + pluginId + '/api/' + endpoint + '?' + decodeURIComponent($.param(opts));
        iframe.src=url;
    }

  myself.runEndpoint = function ( pluginId, endpoint, opts){

    if ( !pluginId && !endpoint){
      Dashboards.log('PluginId or endpointName not defined.');
      return false
    }

    var _opts = {
      success: function (){
        Dashboards.log( pluginId + ': ' + endpoint + ' ran successfully.')
      },
      error: function (){
        Dashboards.log( pluginId + ': error running ' + endpoint + '.')
      },
      params: {},
      systemParams: {},
      type: 'POST',
      dataType: 'json'
    }
    var opts = $.extend( {}, _opts, opts);
    var url = Dashboards.getWebAppPath() + '/plugin/' + pluginId + '/api/' + endpoint;

    function successHandler  (json){
      if ( json && json.result == false){
        opts.error.apply(this, arguments);
      } else {
        opts.success.apply( this, arguments );
      }
    }

    function errorHandler  (){
      opts.error.apply(this, arguments);
    }
    if ( endpoint != 'renderer/refresh' ) { //XXX - do this better
      var ajaxOpts = {
        url: url,
        async: true,
        type: opts.type,
        dataType: opts.dataType,
        success: successHandler,
        error: errorHandler,
        data: {}
      }
    } else {
      var ajaxOpts = {
        url: url,
        async: true,
        type: 'GET',
        dataType: opts.dataType,
        success: successHandler,
        error: errorHandler,
        data: {}
      }
    }

    _.each( opts.params , function ( value , key){
      ajaxOpts.data['param' + key] = value;
    });
    _.each( opts.systemParams , function ( value , key){
      ajaxOpts.data[key] = value;
    });

    $.ajax(ajaxOpts)
  }

  myself.getEndpointCaller = function( pluginId, endpoint, opts ){
    var myself = this;
    return function (callback, errorCallback, params){
      var _opts = $.extend({}, opts);
      _opts.params = params || _opts.params;
      _opts.success = callback || _opts.success;
      _opts.error = errorCallback || _opts.error;
      myself.runEndpoint(pluginId, endpoint, _opts);
    }
  };


  myself.publishToServer = function (callback){
    $.ajax({
      url: Dashboards.getWebAppPath() + '/plugin/sparkl/api/reloadPlugins',
      type:'POST',
      data: {
        'publish': 'now',
        'class': 'org.pentaho.platform.plugin.services.pluginmgr.PluginAdapter'
      },                
      success: callback
    });
  }

  myself.addCallWrapper = function ( caller , callback){
    return function (json) { 
      caller( callback ); 
    };
  };
  myself.addRefreshWrapper = function (pluginId, callback){
    if( pluginId != 'pentaho-cdf-dd' ) {//XXX - do this better
     var caller = this.getEndpointCaller( pluginId, 'refresh' , { dataType:'text'});
  } else {
     var caller = this.getEndpointCaller( pluginId, 'renderer/refresh' , { dataType:'text'});
  }
    return this.addCallWrapper( caller, callback );
  }
  myself.addPublishWrapper = function (callback){
    // HACK: This call is only here because cpk is acting weird after a publish. Remove when bug 
    // on cpk is found!!!
    var cb = function (){
      $.ajax({
        url: Dashboards.getWebAppPath() + '/plugin/sparkl/api/getpluginmetadata',
        type: 'GET',
        async: true,
        success: callback,
        error: callback
      });
    };
    return this.addCallWrapper( this.publishToServer, cb );
  };





})(sparkl);

/************************************  AddIns ************************************/


;(function (){

  var actionButtonsOpts = {
    name: "actionButtons",
    label: "Action Buttons",
    defaults: {
      buttons:[
        {
          cssClass: "viewButton",
          title: "View",
          tooltip: "View",
            action: function(v, st) {
              Dashboards.log(v);
            }
        }
      ]
    },

    init: function(){
        $.fn.dataTableExt.oSort[this.name+'-asc'] = $.fn.dataTableExt.oSort['string-asc'];
        $.fn.dataTableExt.oSort[this.name+'-desc'] = $.fn.dataTableExt.oSort['string-desc'];
    },
    
    implementation: function(tgt, st, opt){
      var $buttonContainer = $('<div/>').addClass('buttonContainer')
        .addClass('numButtons-' + opt.buttons.length);
      _.each(opt.buttons, function(el,idx){
        var $button = $("<button/>").addClass(el.cssClass||"").text(el.title||"").attr('title', el.tooltip||"");
        $button.click(function(){
          if (el.action) {
            el.action(st.value, st);
          }
        });
        $buttonContainer.append($button);
      });
      $(tgt).empty().append($buttonContainer);

    }

    };
    Dashboards.registerAddIn("Table", "colType", new AddIn(actionButtonsOpts));
  
  
/* edit data of table  */
  var editable = {
  name: "editable",
  label: "Editable",
  defaults: {
    action: function (v, st) {
      Dashboards.log(v);
    }
  },
  init: function(){
    
    // Register this for datatables sort
    var myself = this;
    $.fn.dataTableExt.oSort[this.name+'-asc'] = function(a,b){
    return myself.sort(a,b)
    };
    $.fn.dataTableExt.oSort[this.name+'-desc'] = function(a,b){
    return myself.sort(b,a)
    };   
  }, 
  sort: function(a,b){
    return this.sumStrArray(a) - this.sumStrArray(b);
  }, 

  implementation: function (tgt, st, opt) {
    var t = $(tgt);
    var value = st.value;
    var text = $("<input/>").attr({value:value, type:'text', class:'editBox'})
    .keyup(function(event){
      if (event.keyCode == 13) {
        opt.action( $(this).val(), st );
      }
      /*var idx = this.parentNode.parentNode.rowIndex;
      metadataParam[idx-1][1] = $(this).val();*/
      var obj = this.parentNode.parentNode.children[0].textContent;
      metadataParam[obj.toString()] = $(this).val();
    });
    
    t.empty();
    t.append(text);
  }
  };
  Dashboards.registerAddIn("Table", "colType", new AddIn(editable));
  
})();

$(document).ready(function() {
  $('.chzn-results li').click(function() {
    $(this).closest('.chzn-results').find('.result-relected').removeClass('result-selected');
  });
  $("#cpkSiteMapObj").hide();
  $("#cpkText").hide();
  $("#cpkVersion").hide();
  $("#cpkLogo").hide();
  $("#cpkHeader").hide();
}); 
