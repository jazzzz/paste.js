// Generated by CoffeeScript 1.10.0

/* 
paste.js is an interface to read data ( text / image ) from clipboard in different browsers. It also contains several hacks.

https://github.com/layerssss/paste.js
 */

(function() {
  var $, Paste, createHiddenEditable, dataURLtoBlob;

  $ = window.jQuery;

  $.paste = function(pasteContainer) {
    var pm;
    if (typeof console !== "undefined" && console !== null) {
      console.log("DEPRECATED: This method is deprecated. Please use $.fn.pastableNonInputable() instead.");
    }
    pm = Paste.mountNonInputable(pasteContainer);
    return pm._container;
  };

  $.fn.pastableNonInputable = function() {
    var el, j, len;
    for (j = 0, len = this.length; j < len; j++) {
      el = this[j];
      Paste.mountNonInputable(el);
    }
    return this;
  };

  $.fn.pastableTextarea = function() {
    var el, j, len;
    for (j = 0, len = this.length; j < len; j++) {
      el = this[j];
      Paste.mountTextarea(el);
    }
    return this;
  };

  $.fn.pastableContenteditable = function() {
    var el, j, len;
    for (j = 0, len = this.length; j < len; j++) {
      el = this[j];
      Paste.mountContenteditable(el);
    }
    return this;
  };

  dataURLtoBlob = function(dataURL, sliceSize) {
    var b64Data, byteArray, byteArrays, byteCharacters, byteNumbers, contentType, i, m, offset, ref, slice;
    if (sliceSize == null) {
      sliceSize = 512;
    }
    if (!(m = dataURL.match(/^data\:([^\;]+)\;base64\,(.+)$/))) {
      return null;
    }
    ref = m, m = ref[0], contentType = ref[1], b64Data = ref[2];
    byteCharacters = atob(b64Data);
    byteArrays = [];
    offset = 0;
    while (offset < byteCharacters.length) {
      slice = byteCharacters.slice(offset, offset + sliceSize);
      byteNumbers = new Array(slice.length);
      i = 0;
      while (i < slice.length) {
        byteNumbers[i] = slice.charCodeAt(i);
        i++;
      }
      byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
      offset += sliceSize;
    }
    return new Blob(byteArrays, {
      type: contentType
    });
  };

  createHiddenEditable = function() {
    return $(document.createElement('div')).attr('contenteditable', true).attr('aria-hidden', true).attr('tabindex', -1).css({
      width: 1,
      height: 1,
      position: 'fixed',
      left: -100,
      overflow: 'hidden'
    });
  };

  Paste = (function() {
    Paste.prototype._target = null;

    Paste.prototype._container = null;

    Paste.mountNonInputable = function(nonInputable) {
      var paste;
      paste = new Paste(createHiddenEditable().appendTo(nonInputable), nonInputable);
      $(nonInputable).on('click', (function(_this) {
        return function() {
          return paste._container.focus();
        };
      })(this));
      paste._container.on('focus', (function(_this) {
        return function() {
          return $(nonInputable).addClass('pastable-focus');
        };
      })(this));
      return paste._container.on('blur', (function(_this) {
        return function() {
          return $(nonInputable).removeClass('pastable-focus');
        };
      })(this));
    };

    Paste.mountTextarea = function(textarea) {
      var ctlDown, paste;
      if (!navigator.userAgent.toLowerCase().match(/firefox|trident|edge/)) {
        return this.mountContenteditable(textarea);
      }
      paste = new Paste(createHiddenEditable().insertBefore(textarea), textarea);
      textarea.addEventListener('focus', (function() {
        return paste.eventPropagationStopper.apply(paste, arguments);
      }), false);
      textarea.addEventListener('blur', (function() {
        return paste.eventPropagationStopper.apply(paste, arguments);
      }), false);
      ctlDown = false;
      $(textarea).on('keyup', function(ev) {
        var ref;
        if ((ref = ev.keyCode) === 17 || ref === 224) {
          ctlDown = false;
        }
        return null;
      });
      $(textarea).on('keydown', function(ev) {
        var ref;
        if ((ref = ev.keyCode) === 17 || ref === 224) {
          ctlDown = true;
        }
        if ((ev.ctrlKey != null) && (ev.metaKey != null)) {
          ctlDown = ev.ctrlKey || ev.metaKey;
        }
        if (ctlDown && ev.keyCode === 86) {
          paste._textarea_focus_stolen = true;
          paste._container.focus();
          paste._paste_event_fired = false;
          setTimeout((function(_this) {
            return function() {
              if (!paste._paste_event_fired) {
                $(textarea).focus();
                return paste._textarea_focus_stolen = false;
              }
            };
          })(this), 1);
        }
        return null;
      });
      $(textarea).on('paste', (function(_this) {
        return function() {};
      })(this));
      $(textarea).on('focus', (function(_this) {
        return function() {
          return $(textarea).addClass('pastable-focus');
        };
      })(this));
      $(textarea).on('blur', (function(_this) {
        return function() {
          return $(textarea).removeClass('pastable-focus');
        };
      })(this));
      $(paste._target).on('_pasteCheckContainerDone', (function(_this) {
        return function() {
          $(textarea).focus();
          return paste._textarea_focus_stolen = false;
        };
      })(this));
      return $(paste._target).on('pasteText', (function(_this) {
        return function(ev, data) {
          var content, curEnd, curStart;
          curStart = $(textarea).prop('selectionStart');
          curEnd = $(textarea).prop('selectionEnd');
          content = $(textarea).val();
          $(textarea).val("" + content.slice(0, curStart) + data.text + content.slice(curEnd));
          $(textarea)[0].setSelectionRange(curStart + data.text.length, curStart + data.text.length);
          return $(textarea).trigger('change');
        };
      })(this));
    };

    Paste.prototype.eventPropagationStopper = function(ev) {
      if (this._textarea_focus_stolen) {
        ev.stopPropagation();
        ev.stopImmediatePropagation();
      }
      return null;
    };

    Paste.mountContenteditable = function(contenteditable) {
      var paste;
      paste = new Paste(contenteditable, contenteditable);
      $(contenteditable).on('focus', (function(_this) {
        return function() {
          return $(contenteditable).addClass('pastable-focus');
        };
      })(this));
      return $(contenteditable).on('blur', (function(_this) {
        return function() {
          return $(contenteditable).removeClass('pastable-focus');
        };
      })(this));
    };

    function Paste(_container, _target) {
      this._container = _container;
      this._target = _target;
      this._container = $(this._container);
      this._target = $(this._target).addClass('pastable');
      this._container.on('paste', (function(_this) {
        return function(ev) {
          var clipboardData, file, item, j, k, len, len1, reader, ref, ref1, ref2, ref3, text;
          _this._paste_event_fired = true;
          if (((ref = ev.originalEvent) != null ? ref.clipboardData : void 0) != null) {
            clipboardData = ev.originalEvent.clipboardData;
            if (clipboardData.items) {
              ref1 = clipboardData.items;
              for (j = 0, len = ref1.length; j < len; j++) {
                item = ref1[j];
                if (item.type.match(/^image\//)) {
                  reader = new FileReader();
                  reader.onload = function(event) {
                    return _this._handleImage(event.target.result);
                  };
                  reader.readAsDataURL(item.getAsFile());
                }
                if (item.type === 'text/plain') {
                  item.getAsString(function(string) {
                    return _this._target.trigger('pasteText', {
                      text: string
                    });
                  });
                }
              }
            } else {
              if (-1 !== Array.prototype.indexOf.call(clipboardData.types, 'text/plain')) {
                text = clipboardData.getData('Text');
                setTimeout(function() {
                  return _this._target.trigger('pasteText', {
                    text: text
                  });
                }, 1);
              }
              _this._checkImagesInContainer(function(src) {
                return _this._handleImage(src);
              });
            }
          }
          if (clipboardData = window.clipboardData) {
            if ((ref2 = (text = clipboardData.getData('Text'))) != null ? ref2.length : void 0) {
              setTimeout(function() {
                _this._target.trigger('pasteText', {
                  text: text
                });
                return _this._target.trigger('_pasteCheckContainerDone');
              }, 1);
            } else {
              ref3 = clipboardData.files;
              for (k = 0, len1 = ref3.length; k < len1; k++) {
                file = ref3[k];
                _this._handleImage(URL.createObjectURL(file));
              }
              _this._checkImagesInContainer(function(src) {});
            }
          }
          return null;
        };
      })(this));
    }

    Paste.prototype._handleImage = function(src) {
      var loader;
      if (src.match(/^webkit\-fake\-url\:\/\//)) {
        return this._target.trigger('pasteImageError', {
          message: "You are trying to paste an image in Safari, however we are unable to retieve its data."
        });
      }
      loader = new Image();
      loader.crossOrigin = "anonymous";
      loader.onload = (function(_this) {
        return function() {
          var blob, canvas, ctx, dataURL;
          canvas = document.createElement('canvas');
          canvas.width = loader.width;
          canvas.height = loader.height;
          ctx = canvas.getContext('2d');
          ctx.drawImage(loader, 0, 0, canvas.width, canvas.height);
          dataURL = null;
          try {
            dataURL = canvas.toDataURL('image/png');
            blob = dataURLtoBlob(dataURL);
          } catch (undefined) {}
          if (dataURL) {
            return _this._target.trigger('pasteImage', {
              blob: blob,
              dataURL: dataURL,
              width: loader.width,
              height: loader.height
            });
          }
        };
      })(this);
      loader.onerror = (function(_this) {
        return function() {
          return _this._target.trigger('pasteImageError', {
            message: "Failed to get image from: " + src,
            url: src
          });
        };
      })(this);
      return loader.src = src;
    };

    Paste.prototype._checkImagesInContainer = function(cb) {
      var img, j, len, ref, timespan;
      timespan = Math.floor(1000 * Math.random());
      ref = this._container.find('img');
      for (j = 0, len = ref.length; j < len; j++) {
        img = ref[j];
        img["_paste_marked_" + timespan] = true;
      }
      return setTimeout((function(_this) {
        return function() {
          var k, len1, ref1;
          ref1 = _this._container.find('img');
          for (k = 0, len1 = ref1.length; k < len1; k++) {
            img = ref1[k];
            if (!img["_paste_marked_" + timespan]) {
              cb(img.src);
            }
            $(img).remove();
          }
          return _this._target.trigger('_pasteCheckContainerDone');
        };
      })(this), 1);
    };

    return Paste;

  })();

}).call(this);
