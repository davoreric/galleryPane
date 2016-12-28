(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'swipejs', './scroll-slider'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('jquery'), require('swipejs'), require('./scroll-slider'));
    } else {
        root.GalleryPane = factory(root.jQuery, root.Swipe);
    }

}(this, function($, Swipe) {

    var instanceCounter = 0,
        $window = $(this),
        $document = $(this.document);

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

    function Gallery() {

        this.initialize.apply(this, arguments);

    }

    Gallery.defaults = {

        elementClassName: 'gpElement',
        headerClassName: 'gpHeader',
        closeBtnClassName: 'gpCloseBtn',
        pagesClassName: 'gpPages',
        brandingClassName: 'gpBrand',
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

        brandingText: 'Gallery pane',
        toggleThumbsBtnText: 'Toggle thumbs',
        toggleSocialLinksBtnText: 'Toggle social links',
        closeBtnText: 'Close gallery',
        sourceLabelText: 'Source',
        authorLabelText: 'Author',

        appendTarget: 'body',

        items: [],
        canShowAdvertising: function() { return false; },
        thumbsLength: 0,
        position: 0,
        continuous: false,
        slideSpeed: 300,
        navigateWithKeys: true,
        closeOnEscapeKey: true,
        updateUrl: true,
        toggleSocialLinks: false,

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
            this.counter = 1;

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

            this.swipe = new Swipe(this.$swipeEl.get(0), {
                startSlide: this.position,
                speed: this.options.slideSpeed,
                continuous: this.options.continuous,
                callback: function(index, elem) {

                    this.position = index;
                    this.setPosition();

                }.bind(this)
            });

            this.updateDom().setImageDimensions().callbackOnShow(this.options.items[this.position]);

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

            this.setEvent(this.$el, 'click', 'toggleThumbsBtnClassName', this.toggleThumbnails);
            this.setEvent(this.$el, 'click', 'arrowNextClassName', this.next);
            this.setEvent(this.$el, 'click', 'arrowPrevClassName', this.prev);
            this.setEvent(this.$el, 'click', 'closeBtnClassName', this.close);
            this.setEvent($window, 'resize', null, this.setImageDimensions);

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

                this.setEvent(this.$el, 'click', 'toggleSocialLinksBtnClassName', this.toggleSocialLinks);

            }

            this.options.updateUrl && this.setEvent($window, 'popstate', null, this.close);

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

        setImageDimensions: function() {

            this.$itemImages.css('max-height', this.$swipeEl.height() + 'px');

            return this;

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

            if (this.options.canShowAdvertising(this.counter)) {

                this.$advertisingElement = $('<div class="' + this.options.elementClassName + 'Advertising">' + this.options.getAdvertisingTemplate(this.counter) + '</div>').appendTo(this.$el);

                this.$el.addClass('advertisingActive');

                this.options.advertisingCallback(this.counter, this.$advertisingElement.children());

            } else if (position) {

                var newPosition = this.normalizePosition(position),
                    item = this.options.items[newPosition];

                if (this.$advertisingElement) {

                    this.$advertisingElement.remove();
                    this.$el.removeClass('advertisingActive');

                }

                if (newPosition !== this.position) {

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

            } else {

                var currentItem = this.options.items[this.position];

                if (this.$advertisingElement) {

                    this.$advertisingElement.remove();
                    this.$el.removeClass('advertisingActive');

                }

                this.updateDom();
                this.loadImage(this.position, true);

                this.options.updateUrl && this.updateUrl({
                    url: currentItem.url,
                    title: currentItem.title
                });

                this.options.afterPositionChange && this.options.afterPositionChange(this);

                this.callbackOnShow(currentItem);

            }

            this.counter++;

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

                this.startHistoryState = {
                    url: window.location.href,
                    title: document.title
                };

                history.pushState({}, data.title, data.url);

            } else {

                history.replaceState({}, data.title, data.url);

            }

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
                                '<div class="' + data.brandingClassName + '">' + data.brandingText + '</div>' +
                                '<p class="' + data.pagesClassName + '"></p>' +
                                '<button type="button" title="' + data.toggleThumbsBtnText + '" class="' + data.toggleThumbsBtnClassName + '">' + data.toggleThumbsBtnText + '</button>' +
                                '<button type="button" title="' + data.closeBtnText + '" class="' + data.closeBtnClassName + '">' + data.closeBtnText + '</button>' +
                            '</div>' +
                            '<div class="' + data.itemsWrapClassName + '">' +
                                '<ul>' +
                                    joinText(data.items, function(item, index) {
                                        return self.slideItem(data, item, index);
                                    }) +
                                '</ul>' +
                            '</div>' +
                        '</div>';
            },
            slideItem: function(data, item, index) {

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
                                    '<strong class="gpCaption">' + item.title + '</strong>' +
                                    ((item.source || item.author) ? '<strong class="gpCopy">' + ((item.source) ? data.sourceLabelText + ': ' + item.source : '') + ((item.source && item.author) ? ' / ' : '') + ((item.author) ? data.authorLabelText + ': ' + item.author : '') + '</strong>' : '') +
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
