// Generated by CoffeeScript 1.6.3
(function() {
  var Router, count, currentTab, decodeMagnet, switchTab;

  currentTab = "search-tab";

  count = 0;

  switchTab = function(tab) {
    return $("#" + currentTab).fadeOut(function() {
      $("#" + tab).removeClass("hidden").fadeIn();
      return currentTab = tab;
    });
  };

  decodeMagnet = function(uri) {
    var data, params, result;
    result = {};
    data = uri.split("magnet:?")[1];
    if (!data || data.length === 0) {
      return result;
    }
    params = data.split("&");
    params.forEach(function(param) {
      var key, keyval, old, val;
      keyval = param.split("=");
      key = keyval[0];
      val = keyval[1];
      if (keyval.length !== 2) {
        throw new Error("Invalid magnet URI");
      }
      if (key === "tr") {
        val = decodeURIComponent(val);
      }
      if (result[key]) {
        if (Array.isArray(result[key])) {
          return result[key].push(val);
        } else {
          old = result[key];
          return result[key] = [old, val];
        }
      } else {
        return result[key] = val;
      }
    });
    return result;
  };

  Router = Backbone.Router.extend({
    routes: {
      "search": "search",
      "search/*query": "search",
      "publish": "publish",
      "faq": "faq",
      "about": "about",
      "*default": "search"
    },
    search: function(query) {
      console.log(query);
      if (currentTab !== "search-tab") {
        switchTab("search-tab");
      }
      if (query == null) {
        if ($("#searchResultsBody").is(":visible")) {
          return $("#searchResultsBody").fadeOut(function() {
            return $("#searchBody").fadeIn();
          });
        }
      } else {
        $("#searchQuery").val(query);
        $("#innerSearchQuery").val(query);
        count = 0;
        $("#searchResults").empty();
        socket.get("/feathercoin/search?query=" + query);
        return $("#searchBody").fadeOut(function() {
          return $("#searchResultsBody").removeClass("hidden").fadeIn();
        });
      }
    },
    publish: function() {
      return switchTab("publish-tab");
    },
    faq: function() {
      return switchTab("faq-tab");
    },
    about: function() {
      return switchTab("about-tab");
    }
  });

  $(document).ready(function() {
    var prepopulate, router;
    count = 0;
    router = new Router();
    Backbone.history.start();
    socket.on("connect", function() {
      return socket.on("searchResult", function(result) {
        var html;
        result.count = count++;
        html = window.JST["assets/linker/templates/searchResult.html"](result);
        return $("#searchResults").append(html);
      });
    });
    $("#publishButton").click(function(event) {
      var formData, key, sendMe, value;
      event.preventDefault();
      formData = $("#publishForm").serializeArray();
      console.log(JSON.stringify(formData));
      sendMe = {};
      for (key in formData) {
        value = formData[key];
        if (value.value) {
          sendMe[value.name] = value.value;
        }
      }
      return socket.put("/feathercoin/publish", sendMe, function(message) {
        var html;
        html = window.JST["assets/linker/templates/publishResults.html"](message);
        $(html).dialog({
          width: 500,
          title: "Ready To Publish",
          show: "fadeIn",
          modal: true,
          closeText: "Ok",
          buttons: [
            {
              text: "Ok",
              click: function() {
                return $(this).dialog("close");
              }
            }
          ]
        });
        return socket.on(message.sendAddress, function(result) {
          html = window.JST["assets/linker/templates/publishSuccess.html"](result);
          return $(html).dialog({
            width: 850,
            title: "Successfully Published",
            show: "fadeIn",
            modal: true,
            closeText: "Ok",
            buttons: [
              {
                text: "Ok",
                click: function() {
                  return $(this).dialog("close");
                }
              }
            ]
          });
        });
      });
    });
    prepopulate = function() {
      var r;
      $("#payloadInline").off("change");
      r = parseMagnet($("#payloadInline").val());
      $("#name").val(decodeURI(r["dn"]).replace(/\+/g, ' '));
      $("#payloadInline").val("magnet:?xt=" + r["xt"] + "&dn=" + r["dn"]);
      return $("#payloadInline").on("change", prepopulate);
    };
    $("#payloadInline").on("change", prepopulate);
    $("#searchForm").submit(function(event) {
      window.location = "#search/" + $("#searchQuery").val();
      event.preventDefault();
      return false;
    });
    $("#searchButton").click(function(event) {
      count = 0;
      window.location = "#search/" + $("#searchQuery").val();
      event.preventDefault();
      return false;
    });
    return $("#innerSearchButton").click(function(event) {
      count = 0;
      window.location = "#search/" + $("#innerSearchQuery").val();
      event.preventDefault();
      return false;
    });
  });

}).call(this);