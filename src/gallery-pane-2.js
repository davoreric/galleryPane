(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'swipejs'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('jquery', 'swipejs'));
    } else {
        root.GalleryPane = factory(jQuery, window.Swipe);
    }

}(this, function($, Swipe) {

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

    function Gallery() {

        this.initialize.apply(this, arguments);

    }

    $.extend(Gallery.prototype, {

        initialize: function(options) {

            this.options = $.extend({}, Gallery.defaults, options);
            this.position = this.options.position;
            this.ens = '.GalleryPane' + (++instanceCounter);

            this.render();

            this.loadImage(this.position, true);
            this.setupEvents();

        },

        render: function() {

            this.$el = $(this.templates.main(this.options));

            if (this.options.items.length) {
                $(this.templates.arrows(this.options)).appendTo(this.$el);
            }

            this.$swipeEl = this.$el.find(selectorFromClass(this.options.itemsWrapClassName));
            this.$itemImages = this.$el.find(selectorFromClass(this.options.itemImageClassName));
            this.$pagination = this.$el.find(selectorFromClass(this.options.pagesClassName));

            this.$el.appendTo(this.options.appendTarget);

            this.setImageDimensions();

            this.swipe = new Swipe(this.$swipeEl.get(0), {
                startSlide: this.position,
                speed: this.options.slideSpeed,
                continuous: false
                // callback: function(index, elem) {},
            });

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

            this.setEvent(this.$el, 'click', 'thumbClassName', function(e) {

                this.setPosition(this.$thumbs.index($(e.currentTarget)));

            });

            this.setEvent(this.$el, 'click', 'toggleThumbsBtnClassName', this.toggleThumbnails);
            this.setEvent(this.$el, 'click', 'arrowNextClassName', this.next);
            this.setEvent(this.$el, 'click', 'arrowPrevClassName', this.prev);
            this.setEvent(this.$el, 'click', 'closeBtnClassName', this.close);

            this.setEvent($window, 'resize', null, this.setImageDimensions);

            this.setEvent($document, 'keyup', null, function(e) {

                this.options.closeOnEscapeKey && e.keyCode === 27 && this.close();

                if (this.options.navigateWithKeys && this.options.items.length > 1) {
                    (e.keyCode === 39 || e.keyCode === 68) && this.next();
                    (e.keyCode === 37 || e.keyCode === 65) && this.prev();
                }

            });

        },

        normalizePosition: function(position) {

            if (position >= this.options.items.length) {
                return 0;
            } else if (position < 0) {
                return this.options.items.length - 1;
            } else {
                return position;
            }

        },

        setImageDimensions: function() {

            this.$itemImages.css('max-height', this.$swipeEl.height() + 'px');

        },

        loadImage: function(position, loadAdjecent) {

            var self = this,
                image = new Image(),
                normalizedPosition = this.normalizePosition(position),
                url = this.options.items[normalizedPosition].largeImage;

            this.$itemImages.eq(normalizedPosition).attr('src', url);

            if (loadAdjecent) {
                image.onload = function() {
                    self.loadImage(position + 1).loadImage(position - 1);
                };
            }

            image.src = url;

            return this;

        },

        setPosition: function(position) {

            var newPosition = this.normalizePosition(position);

            if (newPosition !== this.position) {

                this.position = newPosition;
                this.swipe.slide(newPosition);
                this.loadImage(newPosition, true);

                this.$pagination.text((newPosition + 1) + '/' + this.options.items.length);

                this.options.afterPositionChange && this.options.afterPositionChange(this);

            }

        },

        next: function() {

            this.setPosition(this.position + 1);

        },

        prev: function() {

            this.setPosition(this.position - 1);

        },

        toggleThumbnails: function() {

            this.$el.hasClass(this.options.thumbsActiveClassName) ? this.hideThumbNails() : this.showThumbnails();

        },

        showThumbnails: function() {

            if (!this.$thumbs) {
                $(this.templates.thumbs(this.options)).appendTo(this.$el);
                this.$thumbs = this.$el.find(selectorFromClass(this.options.thumbClassName));
            }

            this.$el.addClass(this.options.thumbsActiveClassName);

        },

        hideThumbNails: function() {

            this.$el.removeClass(this.options.thumbsActiveClassName);

        },

        close: function() {

            $window.off(this.ens);
            $document.off(this.ens);
            this.swipe.kill();
            this.$el.remove();

        },

        templates: {
            main: function(data) {
                return '<div class="' + data.elementClassName + '">' +
                            '<div class="' + data.headerClassName + '">' +
                                '<div class="' + data.brandingClassName + '">' + data.brandingText + '</div>' +
                                '<p class="' + data.pagesClassName + '">' + (data.position + 1) + '/' + data.items.length + '</p>' +
                                '<button type="button" title="' + data.toggleThumbsBtnText + '" class="' + data.toggleThumbsBtnClassName + '">' + data.toggleThumbsBtnText + '</button>' +
                                '<button type="button" title="' + data.closeBtnText + '" class="' + data.closeBtnClassName + '">' + data.closeBtnText + '</button>' +
                            '</div>' +
                            '<div class="' + data.itemsWrapClassName + '">' +
                                '<ul>' +
                                    joinText(data.items, function(item) {
                                        return '<li>' +
                                                    '<div class="' + data.itemClassName + '">' +
                                                        '<img class="' + data.itemImageClassName + '" data-src="' + item.largeImage + '" alt="' + item.title + '" />' +
                                                    '</div>' +
                                                '</li>';
                                    }) +
                                '</ul>' +
                            '</div>' +
                        '</div>';
            },
            thumbs: function(data) {
                return '<div class="' + data.thumbsWrapClassName + '">' +
                            '<ul>' +
                                joinText(data.items, function(item) {
                                    return '<li>' +
                                                '<div class="' + data.thumbClassName + '">' +
                                                    '<img src="' + item.smallImage + '" alt="' + item.title + '" />' +
                                                '</div>' +
                                            '</li>';
                                }) +
                            '</ul>' +
                        '</div>';
            },
            arrows: function(data) {
                return '<div class="' + data.arrowsClassName + '">' +
                            '<button type="button" class="' + data.arrowNextClassName + '"></button>' +
                            '<button type="button" class="' + data.arrowPrevClassName + '"></button>' +
                        '</div>';
            }
        }

    });

    /* default values */

    Gallery.defaults = {

        elementClassName: 'gpElement',
        headerClassName: 'gpHeader',
        closeBtnClassName: 'gpCloseBtn',
        pagesClassName: 'gpPages',
        brandingClassName: 'gpBrand',
        itemsWrapClassName: 'gpItems',
        itemClassName: 'gpItem',
        itemImageClassName: 'gpItemImage',

        toggleThumbsBtnClassName: 'gpToggleThumbsBtn',
        thumbsWrapClassName: 'gpThumbs',
        thumbClassName: 'gpThumb',

        arrowsClassName: 'gpArrows',
        arrowNextClassName: 'gpArrow gpArrowNext',
        arrowPrevClassName: 'gpArrow gpArrowPrev',

        brandingText: 'Gallery pane',
        toggleThumbsBtnText: 'Toggle thumbs',
        closeBtnText: 'Close gallery',

        appendTarget: 'body',

        items: [],
        position: 0,
        continuous: true,
        slideSpeed: 300,
        navigateWithKeys: true,
        closeOnEscapeKey: true,

        afterRender: null

    };

    return Gallery;

}));
