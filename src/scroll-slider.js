(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('jquery'));
    } else {
        root.ScrollSlider = factory(jQuery);
    }

}(this, function($) {

    var root = this,
        instanceCounter = 0,
        $window = $(root);

    function selectorFromClass(classes) {

        return '.' + classes.replace(/\s/g, '.');

    }

    function ScrollSlider(el, options) {

        this.initialize.apply(this, arguments);

    }

    ScrollSlider.defaults = {
        scrollerSelector: ':first-child',
        animatedElSelector: 'ul, ol',
        itemSelector: 'li',

        slideWidth: 0.5,

        arrowWrapClass: 'scrollSliderArrows',
        arrowNextClass: 'scrollSliderArrowNext',
        arrowPrevClass: 'scrollSliderArrowPrev',
        arrowDisabledClass: 'scrollSliderArrowDisabled',
        hasArrowsClass: 'scrollSliderHasArrows',
        touchClass: 'scrollSliderTouch',

        arrowPrevText: 'Prev',
        arrowNextText: 'Next',

        continuous: false,
        isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0
    };

    $.extend(ScrollSlider.prototype, {

        initialize: function(el, options) {

            this.$el = $(el);

            this.ens = '.ScrollSlider' + (++instanceCounter);
            this.options = $.extend({}, ScrollSlider.defaults,  options);

            this.$scroller = this.$el.find(this.options.scrollerSelector);
            this.$animatedEl = this.$el.find(this.options.animatedElSelector).eq(0);
            this.$items = this.$el.find(this.options.itemSelector);

            this.setup();
            this.setupEvents();

        },

        setup: function() {

            this.animatedElWidth = this.$animatedEl.outerWidth();

            if (this.options.isTouch) {

                this.$scroller.addClass(this.options.touchClass);

            } else {

                this.slideOffset = 0;
                this.context = 'first';

                this.elSize = this.$el.outerWidth();

                if (typeof this.options.slideWidth === 'function') {
                    this.slideSize = this.options.slideWidth(this);
                } else {
                    this.slideSize = this.elSize * parseFloat(this.options.slideWidth);
                }

                this.setupArrows();
                this.elPadding = parseInt(this.$el.css('padding-left'), 10);
                this.animate(0);
            }

        },

        setupEvents: function() {

            var self = this;

            $window.on('resize' + this.ens, function() {

                self.elSize && self.$el.outerWidth() !== self.elSize && self.setup();

            });

        },

        slideNext: function() {

            var proposedOffset = this.slideOffset + this.slideSize;

            if (proposedOffset + this.elSize > this.animatedElWidth) {

                if (this.animatedElWidth - this.slideOffset - this.elSize > 0) {

                    this.slideOffset = this.animatedElWidth - this.elSize + this.elPadding * 2;
                    this.context = 'last';

                } else {

                    if (this.options.continuous) {

                        this.context = 'first';
                        this.slideOffset = 0;

                    } else {

                        this.context = 'last';

                    }

                }

            } else {

                this.context = 'inBetween';
                this.slideOffset = proposedOffset;

            }

            this.animate(this.slideOffset).setupArrows();

        },

        slidePrev: function() {

            var proposedOffset = this.slideOffset - this.slideSize;

            if (proposedOffset <= 0) {

                if (this.slideOffset !== 0 && this.slideOffset <= this.elSize) {

                    this.slideOffset = 0;
                    this.context = 'first';

                } else {

                    if (this.options.continuous) {

                        this.slideOffset = this.animatedElWidth - this.elSize + this.elPadding * 2;
                        this.context = 'last';

                    } else {

                        this.slideOffset = 0;
                        this.context = 'first';

                    }

                }

            } else {

                if (this.context === 'last') {
                    this.slideOffset = this.slideSize * Math.floor((this.animatedElWidth - this.elSize) / this.slideSize);
                } else {
                    this.slideOffset -= this.slideSize;
                }

                this.context = 'inBetween';

            }

            this.animate(this.slideOffset).setupArrows();

        },

        scrollTo: function(itemPosition) {

            var $item = this.$items.eq(itemPosition),
                itemOffset = $item.offset().left - this.$items.eq(0).offset().left,
                diffToCurrentOffset = itemOffset - this.slideOffset;

            if (this.options.isTouch) {
                this.offset = itemOffset;
                this.animate(itemOffset);
            } else {
                if (diffToCurrentOffset + $item.outerWidth() > this.elSize) {
                    this.slideNext();
                } else if (diffToCurrentOffset < 0) {
                    this.slidePrev();
                }
            }

            return this;

        },

        animate: function(offset) {

            this.$scroller.stop().animate({'scrollLeft': offset}, 300);
            return this;

        },

        setupArrows: function() {

            var self = this,
                options = this.options;

            if (!this.$arrows) {

                this.$arrows = $('<div>').addClass(this.options.arrowWrapClass);
                this.$arrowNext = $('<button type="button" class="' + options.arrowNextClass + '">' + options.arrowNextText + '</button>').appendTo(this.$arrows);
                this.$arrowPrev = $('<button type="button" class="' + options.arrowPrevClass + '">' + options.arrowPrevText + '</button>').appendTo(this.$arrows);

                this.$arrows.appendTo(this.$el).on('click' + this.ens, 'button', function(e) {

                    var $arrow = $(e.target);

                    if (!$arrow.hasClass(options.arrowDisabledClass)) {
                        $arrow.hasClass(options.arrowNextClass) ? self.slideNext() : self.slidePrev();
                    }

                });

            }

            this.$el.toggleClass(options.hasArrowsClass, this.animatedElWidth >= this.elSize);

            if (!this.options.continuous) {

                this.$arrowNext.toggleClass(options.arrowDisabledClass, this.context === 'last');
                this.$arrowPrev.toggleClass(options.arrowDisabledClass, this.context === 'first');

            }

        },

        destroy: function() {

            $window.off(this.ens);
            this.$el.off(this.ens);
            this.$arrows && this.$arrows.remove();

        }

    });

    $.ScrollSlider = ScrollSlider;

    $.fn.scrollSlider = function(options) {
        return this.each(function() {
            if (!$.data(this, 'scrollSlider')) {
                $.data(this, 'scrollSlider', new ScrollSlider(this, options));
            }
        });
    };

    return $;

}));
