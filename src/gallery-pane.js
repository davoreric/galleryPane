(function(factory) {

    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'swipejs', './scroll-slider'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('jquery'), require('swipejs'), require('./scroll-slider'));
    } else {
        window.GalleryPane = factory(window.jQuery, window.Swipe);
    }

}(function($, Swipe) {

    var instanceCounter = 0,
        $window = $(window),
        $document = $(window.document);

    function selectorFromClass(classes) {

        return '.' + classes.replace(/\s/g, '.');

    }

    function joinText(items, callback) {

        var text = '';

        $.each(items, function(i, item) {
            text += callback(item, i);
        });

        return text;
    }

    function truncateString(string, limit) {

        return (string.length > limit) ? string.substr(0, limit - 1) + '&hellip;' : string;

    }

    function Gallery() {

        this.initialize.apply(this, arguments);

    }

    Gallery.defaults = {

        elementClassName: 'gpElement',
        headerClassName: 'gpHeader',
        closeBtnClassName: 'gpCloseBtn',
        pagesClassName: 'gpPages',
        brandingClassName: 'gpBrand',
        brandingUrl: null,
        itemsWrapClassName: 'gpItems',
        itemClassName: 'gpItem',
        videoItemClassName: 'gpVideoItem',
        htmlItemClassName: 'gpHtmlItem',
        itemImageClassName: 'gpItemImage',

        toggleThumbsBtnClassName: 'gpToggleThumbsBtn',
        thumbsWrapClassName: 'gpThumbs',
        thumbsScrollerClassName: 'gpThumbsScroller',
        thumbClassName: 'gpThumb',
        thumbsOpenedClassName: 'gpThumbsActive',
        thumbActiveClassName: 'gpThumbActive',
        arrowsClassName: 'gpArrows',
        arrowNextClassName: 'gpArrow gpArrowNext',
        arrowPrevClassName: 'gpArrow gpArrowPrev',
        arrowDisabledClassName: 'gpArrowDisabled',

        socialLinksClassName: 'gpSocial',
        toggleSocialLinksBtnClassName: 'gpToggleSocialBtn',
        toggleSocialLinksWrapClassName: 'gpWrapSocialLinks',
        socialLinksOpenedClassName: 'gpSocialActive',
        hasSocialLinksClassName: 'gpHasSocialLinks',

        infoWrapClassName: 'gpInfoWrap',
        infoToggleClassName: 'gpInfoToggle',
        infoToggleButtonText: 'Show image info',
        infoOpenedClassName: 'gpInfoActive',

        brandingText: 'Gallery pane',
        toggleThumbsBtnText: 'Toggle thumbs',
        toggleSocialLinksBtnText: 'Toggle social links',
        closeBtnText: 'Close gallery',
        sourceLabelText: 'Source',
        authorLabelText: 'Author',
        showImageInfoLabel: 'Show more',
        hideImageInfoLabel: 'Close',
        shortTextLength: 100,

        appendTarget: 'body',

        items: [],
        thumbsLength: 0,
        position: 0,
        continuous: false,
        slideSpeed: 300,
        navigateWithKeys: true,
        closeOnEscapeKey: true,
        updateUrl: true,
        toggleSocialLinks: false,

        shouldShowAdvertising: function(positionChangeCounter) {
            return false;
        },
        advertisingTemplate: function() {},
        whenAdvertisingElementReady: function($bannerElement) {},
        advertisingCloseText: 'Skip advertising',
        advertisingCloseClassName: 'gpAdvertisingClose',

        shouldShowSidebarAd: function() {
            return false;
        },
        sidebarAdTemplate: function() {},
        popupAdTemplate: function() {},

        afterRender: null,
        afterPositionChange: null,

        scrollSlider: {
            arrowWrapClass: 'gpScrollSliderArrows',
            arrowNextClass: 'gpScrollSliderArrowNext',
            arrowPrevClass: 'gpScrollSliderArrowPrev',
            arrowDisabledClass: 'gpScrollSliderArrowDisabled',
            hasArrowsClass: 'gpScrollSliderHasArrows',
            touchClass: 'gpScrollSliderTouch'
        }

    };

    $.extend(Gallery.prototype, {

        initialize: function(options) {

            this.options = $.extend(true, {}, Gallery.defaults, options);
            this.position = this.options.position;
            this.ens = '.GalleryPane' + (++instanceCounter);
            this.positionChangeCounter = 0;
            this.advertisingActive = false;

            this.options.thumbsLength = this.options.items.length;
            this.options.items.filter(function(item, index) {
                if (typeof item.smallImage === 'undefined') {
                    this.options.thumbsLength--;
                }
            }.bind(this));

            this.render();

            this.loadImage(this.position, true);
            this.setupEvents();

            this.options.updateUrl && this.updateUrl({
                url: this.options.items[this.position].url,
                title: this.options.items[this.position].title
            });

        },

        render: function() {

            this.$el = $(this.templates.main(this.options));

            if (this.options.shouldShowSidebarAd()) {

                this.$el.addClass('hasSidebarBanner');
                this.$sidebarElement = $('<div class="sideBanner"></div>').appendTo(this.$el);
                this.$sideBanner = $(this.options.sidebarAdTemplate()).appendTo(this.$sidebarElement);

            }

            if (typeof this.options.popupAdTemplate(this) !== 'undefined') {

                this.$popupAdBanner = $(this.options.popupAdTemplate()).appendTo(this.$el.find('.gpItems'));

            }

            if (this.options.items.length > 1) {
                this.$arrowsCont = $(this.templates.arrows(this.options)).appendTo(this.$el);
                this.$arrowNext = this.$arrowsCont.find(selectorFromClass(this.options.arrowNextClassName));
                this.$arrowPrev = this.$arrowsCont.find(selectorFromClass(this.options.arrowPrevClassName));
            }

            this.$swipeEl = this.$el.find(selectorFromClass(this.options.itemsWrapClassName));
            this.$itemImages = this.$el.find(selectorFromClass(this.options.itemImageClassName));
            this.$pagination = this.$el.find(selectorFromClass(this.options.pagesClassName));
            this.$socialLinks = $('<div>').addClass(this.options.socialLinksClassName).appendTo(this.$el);

            this.$el.appendTo(this.options.appendTarget);

            if (this.options.shouldShowSidebarAd()) {

                this.options.whenAdvertisingElementReady(this.$sideBanner, this);

            }

            if (typeof this.options.popupAdTemplate(this) !== 'undefined') {

                this.options.whenAdvertisingElementReady(this.$popupAdBanner, this);

            }

            this.swipe = new Swipe(this.$swipeEl.get(0), {
                startSlide: this.position,
                speed: this.options.slideSpeed,
                continuous: this.options.continuous,
                callback: function(index, elem) {
                    this.setPosition(index);
                }.bind(this)
            });

            this.updateDom().callbackOnShow(this.options.items[this.position]);

            this.options.afterRender && this.options.afterRender(this);

        },

        setEvent: function($el, eventNames, className, callback) {

            var eventNamespace = this.ens,
                namespacedEvents = eventNames.replace(/\w\b/g, function(match) {
                    return match + eventNamespace;
                });

            $el.on(namespacedEvents, className && selectorFromClass(this.options[className]), $.proxy(callback, this));

            return this;

        },

        setupEvents: function() {

            this.setEvent(this.$el, 'click', 'toggleThumbsBtnClassName', function() {
                this.toggleThumbnails();
            });
            this.setEvent(this.$el, 'click', 'arrowNextClassName', function() {
                this.next();
            });
            this.setEvent(this.$el, 'click', 'arrowPrevClassName', function() {
                this.prev();
            });
            this.setEvent(this.$el, 'click', 'closeBtnClassName', function() {
                this.close();
            });
            this.setEvent(this.$el, 'click', 'infoToggleClassName', function() {
                this.toggleInfo();
            });
            this.setEvent(this.$el, 'click', 'thumbClassName', function(e) {

                this.setPosition($(e.currentTarget).data('index'));

            });

            this.setEvent($document, 'keyup', null, function(e) {

                this.options.closeOnEscapeKey && e.keyCode === 27 && this.close();

                if (this.options.navigateWithKeys && this.options.items.length > 1) {
                    (e.keyCode === 39 || e.keyCode === 68) && this.next();
                    (e.keyCode === 37 || e.keyCode === 65) && this.prev();
                }

            });

            if (this.options.toggleSocialLinks) {

                this.setEvent(this.$el, 'click', 'toggleSocialLinksBtnClassName', function() {
                    this.toggleSocialLinks();
                });

            }

            this.options.updateUrl && this.setEvent($window, 'popstate', null, function() {

                this.close();

            });

            this.setEvent(this.$el, 'click', 'infoWrapClassName', function(e) {

                this.$el.find('.gpInfoWrap').hasClass('expanded') ? this.hideInfoText() : this.showInfoText();

            });

            this.setEvent(this.$el, 'click', 'itemClassName', function(e) {

                this.$el.hasClass('fullScreenMode') ? this.exitFullScreenMode() : this.enterFullScreenMode();

            });

        },

        enterFullScreenMode: function() {

            this.$el.addClass('fullScreenMode');

        },

        exitFullScreenMode: function() {

            this.$el.removeClass('fullScreenMode');

        },

        showInfoText: function() {

            this.$el.find('.gpInfoWrap').addClass('expanded');
            this.$el.find('.toggleImageInfo').html(this.options.hideImageInfoLabel);

        },

        hideInfoText: function() {

            this.$el.find('.gpInfoWrap').removeClass('expanded');
            this.$el.find('.toggleImageInfo').html(this.options.showImageInfoLabel);

        },

        normalizePosition: function(position) {

            if (position >= this.options.items.length) {
                return this.options.continuous ? 0 : this.position;
            } else if (position < 0) {
                return this.options.continuous ? this.options.items.length - 1 : this.position;
            } else {
                return position;
            }

        },

        loadImage: function(position, loadAdjecent) {

            var self = this,
                image = new Image(),
                normalizedPosition = this.normalizePosition(position),
                url = this.options.items[normalizedPosition].largeImage;

            if (url) {

                this.$itemImages.filter('[data-index="' + normalizedPosition + '"]').attr('src', url);

                if (loadAdjecent) {
                    image.onload = function() {
                        self.loadImage(position + 1).loadImage(position - 1);
                    };
                }

                image.src = url;

            }

            return this;

        },

        setPosition: function(position) {

            var newPosition = this.normalizePosition(position),
                item = this.options.items[newPosition];

            if (newPosition !== this.position) {

                if (this.advertisingActive) {

                    this.removeAdvertising();

                } else {

                    this.positionChangeCounter++;

                    if (this.options.shouldShowAdvertising(this.positionChangeCounter)) {

                        this.$advertisingElement = $('<div class="' + this.options.elementClassName + 'Advertising" />').appendTo(this.$el);
                        this.$bannerElement = $(this.options.advertisingTemplate(this)).appendTo(this.$advertisingElement);

                        $('<button class="' + this.options.advertisingCloseClassName + '">' + this.options.advertisingCloseText + '</button>')
                            .prependTo(this.$advertisingElement)
                            .on('click', function() {
                                this.removeAdvertising();
                            }.bind(this));

                        this.advertisingActive = true;
                        this.$el.addClass('advertisingActive');
                        this.options.whenAdvertisingElementReady(this.$bannerElement, this);

                    } else if (this.$advertisingElement) {

                        this.removeAdvertising();

                    }

                    this.position = newPosition;

                    this.swipe.slide(newPosition);
                    this.updateDom();
                    this.loadImage(newPosition, true);

                    this.options.updateUrl && this.updateUrl({
                        url: item.url,
                        title: item.title
                    });

                    this.options.afterPositionChange && this.options.afterPositionChange(this);

                    this.callbackOnShow(item);

                }

            }

        },

        removeAdvertising: function() {

            this.advertisingActive = false;
            this.$advertisingElement.remove();
            this.$el.removeClass('advertisingActive');

        },

        callbackOnShow: function(item) {

            if (typeof item.onFirstShowCallback !== 'undefined') {
                item.onFirstShowCallback(this);
                delete item.onFirstShowCallback;
            }

            item.onShowCallback && item.onShowCallback(this);

        },

        updateUrl: function(data) {

            if (!this.startHistoryState) {

                if (this.options.startHistoryState) {

                    this.startHistoryState = this.options.startHistoryState;

                } else {

                    this.startHistoryState = {
                        url: window.location.href,
                        title: document.title
                    };

                }

            }

            history.replaceState({}, data.title, data.url);
            data.title && (document.title = data.title);

        },

        updateDom: function() {

            var options = this.options,
                item = options.items[this.position],
                currentPage = this.position + 1;

            // thumbs
            if (this.thumbsSlider) {

                this.thumbsSlider.scrollTo(this.position);
                this.$thumbs.removeClass(this.options.thumbActiveClassName)
                            .filter('[data-index="' + this.position + '"]')
                            .addClass(options.thumbActiveClassName);
            }

            // arrows
            if (!this.options.continuous && this.$arrowsCont) {
                this.$arrowNext.toggleClass(this.options.arrowDisabledClassName, this.position === this.options.items.length - 1);
                this.$arrowPrev.toggleClass(this.options.arrowDisabledClassName, this.position === 0);
            }

            // pagination
            if (typeof item.smallImage !== 'undefined') {
                this.options.items.filter(function(item, index) {
                    if (index < this.position && typeof item.smallImage === 'undefined') {
                        currentPage--;
                    }
                }.bind(this));
                this.$pagination.text(currentPage + '/' + options.thumbsLength);
            }

            // social links
            if (item.socialLinks && item.socialLinks.length > 0) {
                this.$el.addClass(options.hasSocialLinksClassName);
                this.$socialLinks.html(this.templates.socialLinks(item.socialLinks, this.options));
            } else {
                this.$el.removeClass(options.hasSocialLinksClassName);
            }

            return this;

        },

        next: function() {

            this.setPosition(this.position + 1);

        },

        prev: function() {

            this.setPosition(this.position - 1);

        },

        toggleSocialLinks: function() {

            this.$el.toggleClass(this.options.socialLinksOpenedClassName);

        },

        toggleInfo: function() {

            this.$el.toggleClass(this.options.infoOpenedClassName);

        },

        toggleThumbnails: function() {

            this.$el.hasClass(this.options.thumbsOpenedClassName) ? this.hideThumbNails() : this.showThumbnails();

        },

        showThumbnails: function() {

            this.$el.addClass(this.options.thumbsOpenedClassName);

            if (!this.thumbsSlider) {

                this.thumbsSlider = new $.ScrollSlider($(this.templates.thumbs(this.options)).appendTo(this.$el), this.options.scrollSlider);

                this.$thumbs = this.thumbsSlider.$el.find(selectorFromClass(this.options.thumbClassName));

                if (typeof this.options.items[this.position].smallImage !== 'undefined') {

                    this.$thumbs.filter('[data-index="' + this.position + '"]').addClass(this.options.thumbActiveClassName);

                }

            }

            this.thumbsSlider.scrollTo(this.position);

        },

        hideThumbNails: function() {

            this.$el.removeClass(this.options.thumbsOpenedClassName);

        },

        close: function() {

            if (this.options.updateUrl && this.startHistoryState) {
                this.updateUrl(this.startHistoryState);
            }

            $window.off(this.ens);
            $document.off(this.ens);
            this.swipe.kill();
            this.scrollSlider && this.scrollSlider.destroy();
            this.$el.remove();

        },

        templates: {
            main: function(data) {

                var self = this;

                return '<div class="' + data.elementClassName + '">' +
                            '<div class="' + data.headerClassName + '">' +
                                ((data.brandingUrl !== null) ? '<a href="' + data.brandingUrl + '" class="' + data.brandingClassName + '">' + data.brandingText + '</a>' : '<div class="' + data.brandingClassName + '">' + data.brandingText + '</div>') +
                                '<p class="' + data.pagesClassName + '"></p>' +
                                '<button type="button" title="' + data.toggleThumbsBtnText + '" class="' + data.toggleThumbsBtnClassName + '">' + data.toggleThumbsBtnText + '</button>' +
                                '<button type="button" title="' + data.closeBtnText + '" class="' + data.closeBtnClassName + '">' + data.closeBtnText + '</button>' +
                            '</div>' +
                            '<div class="gpContent">' +
                                '<div class="' + data.itemsWrapClassName + '">' +
                                    '<ul>' +
                                        joinText(data.items, function(item, index) {
                                            return self.slideItem(data, item, index);
                                        }) +
                                    '</ul>' +
                                '</div>' +
                                '<a class="' + data.infoToggleClassName + '">' + data.infoToggleButtonText + '</a>' +
                            '</div>' +
                        '</div>';
            },
            slideItem: function(data, item, index) {

                var shortText;
                var shouldShowShortText;

                if (typeof item.text === 'undefined' || item.text === null) {

                    shortText = '';
                    shouldShowShortText = false;

                } else {

                    shortText = truncateString(item.text, data.shortTextLength);
                    shouldShowShortText = item.text.length > shortText.length;

                }

                if (item.videoUrl) {
                    return '<li>' +
                                '<div class="' + data.itemClassName + '">' +
                                    '<div class="' + data.videoItemClassName + '">' +
                                        '<iframe frameborder="0" allowfullscreen src="' + item.videoUrl + '"></iframe>' +
                                    '</div>' +
                                '</div>' +
                            '</li>';
                } else if (item.html) {
                    return '<li>' +
                                '<div class="' + data.itemClassName + '">' +
                                    '<div class="' + data.htmlItemClassName + '">' + item.html + '</div>' +
                                '</div>' +
                            '</li>';
                } else {
                    return '<li>' +
                                '<div class="' + data.itemClassName + '">' +
                                    '<img class="' + data.itemImageClassName + '" data-index="' + index + '" data-src="' + item.largeImage + '" alt="' + item.title + '" />' +
                                '</div>' +
                                '<div class="' + data.infoWrapClassName + '">' +
                                    '<strong class="gpCaption">' + item.title + '</strong>' +
                                    ((typeof item.text === 'undefined' || item.text === null) ? '' : ('<div class="gpShortText">' + shortText + '</div>')) +
                                    ((typeof item.text === 'undefined' || item.text === null) ? '' : ('<div class="gpText">' + item.text + '</div>')) +
                                    ((item.source || item.author) ? '<strong class="gpCopy">' + ((item.source) ? data.sourceLabelText + ': ' + item.source : '') + ((item.source && item.author) ? ' / ' : '') + ((item.author) ? data.authorLabelText + ': ' + item.author : '') + '</strong>' : '') +
                                    ((typeof item.text === 'undefined' || item.text === null || shouldShowShortText === false) ? '' : ('<strong class="toggleImageInfo">' + data.showImageInfoLabel + '</strong>')) +
                                '</div>' +
                            '</li>';

                }

            },
            thumbs: function(data) {
                return '<div class="' + data.thumbsWrapClassName + '">' +
                            '<div class="' + data.thumbsScrollerClassName + '">' +
                                '<ul>' +
                                    joinText(data.items, function(item, index) {
                                        if (typeof item.smallImage !== 'undefined') {
                                            return '<li>' +
                                                    '<div class="' + data.thumbClassName + '" data-index="' + index + '">' +
                                                        '<img src="' + item.smallImage + '" alt="' + item.title + '" />' +
                                                    '</div>' +
                                                '</li>';
                                        } else {
                                            return '';
                                        }
                                    }) +
                                '</ul>' +
                            '</div>' +
                        '</div>';
            },
            arrows: function(data) {
                return '<div class="' + data.arrowsClassName + '">' +
                            '<button type="button" class="' + data.arrowNextClassName + '"></button>' +
                            '<button type="button" class="' + data.arrowPrevClassName + '"></button>' +
                        '</div>';
            },
            socialLinks: function(items, data) {

                var template = joinText(items, function(item) {
                    return '<a href="' + item.url + '" class="' + item.className + '" title="' + item.title + '">' + item.title + '</a>';
                });

                if (data.toggleSocialLinks) {
                    return '<button type="button" class="' + data.toggleSocialLinksBtnClassName + '">' + data.toggleSocialLinksBtnText + '</button><div class="' + data.toggleSocialLinksWrapClassName + '">' + template + '<div>';
                } else {
                    return template;
                }

            }
        }

    });

    return Gallery;

}));
