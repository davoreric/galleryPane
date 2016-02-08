(function(root, factory) {

    if (typeof define === 'function' && define.amd) {

        define(['jquery'], factory);

    } else if (typeof module === 'object' && module.exports) {

        module.exports = factory(require('jquery'));

    } else {

        root.Gallery = factory(jQuery);

    }

}(this, function($) {

    function gallery(data) {

        this.options = $.extend({}, gallery.defaults, data);

    }

    $.extend(gallery.prototype, {

        /* render methods */

        render: function() {

            this.$gallery = $('<section id="' + this.options.wrapId + '"></section>');

            this.headerTemplate().appendTo(this.$gallery);
            this.itemsTemplate().appendTo(this.$gallery);

            if (this.options.data.length) {

                this.thumbsTemplate().appendTo(this.$gallery);
                this.slider();

            }

            if (this.options.social) {

                this.socialTemplate().appendTo(this.$gallery);

            }

            this.events();
            this.setPosition();

            $('body').append(this.$gallery);

            //enables chaining on invoke
            return this;

        },

        /* bind events methods */

        events: function() {

            this.$gallery.on('click', '.closeButton', this.close.bind(this));
            this.$gallery.on('click', '.thumbButton', this.toggleThumbs.bind(this));

            this.$gallery.on('click', '.thumbs .item', this.thumbClick.bind(this));
            this.$gallery.on('dblclick', '.thumbs .item', this.thumbDblclick.bind(this));

        },

        /* action methods */

        toggleThumbs: function() {

            this.$gallery.toggleClass('thumbsActive');

        },

        thumbClick: function(e) {

            e.preventDefault();

            var position = $(e.currentTarget).data('order');

            this.setPosition(position);

        },

        thumbDblclick: function(e) {

            e.preventDefault();

            var position = $(e.currentTarget).data('order');

            this.toggleThumbs();
            this.setPosition(position);

        },

        close: function() {

            this.$gallery.remove();

        },

        setPosition: function(pos) {

            console.log(pos);

            if (typeof pos !== 'undefined') {

                this.options.position = pos;

            }

            //set correct page number
            this.$page.text(this.options.position + 1);

            //activate correct thumb
            $.each(this.$thumbs, function() {

                $(this).removeClass('active');

            });

            this.$thumbs[this.options.position].addClass('active');

            //activate correct image item
            $.each(this.$items, function() {

                $(this).removeClass('active');

            });

            this.$items[this.options.position].addClass('active');

            return this;

        },

        /* slider method */

        slider: function() {

            //console.log('slider');

        },

        /* templating methods */

        headerTemplate: function() {

            var $wrap = $('<div class="head">' +
                '<a class="brand">' + this.options.brandText + '</a>' +
                ((this.options.data.length > 1) ? '<span class="page">/' + this.options.data.length + '</span>' : '') +
                ((this.options.data.length > 1) ? '<a class="thumbButton ' + this.options.thumbsIconClass + '"><span>' + this.options.thumbsText + '</span></a>' : '') +
                '<a class="closeButton ' + this.options.closeIconClass + '"><span>' + this.options.closeText + '</span></a>' +
            '</div>');

            this.$page = $('<span>' + (this.options.position + 1) + '</span>');

            $wrap.find('.page').prepend(this.$page);

            return $wrap;

        },

        thumbsTemplate: function() {

            var $wrap = $('<div class="thumbs"></div>'),
                $inner = $('<div class="wrap"></div>').appendTo($wrap);

            this.$thumbs = [];

            if (this.options.data) {

                $(this.options.data).each(function(i, item) {

                    this.$thumbs.push($('<a class="item" data-order="' + i + '"><img src="' + item.thumb + '" alt="' + item.name + '" /></a>'));
                    $inner.append(this.$thumbs[i]);

                }.bind(this));

            } else {

                $inner.append('<p>No images found!</p>');

            }

            return $wrap;

        },

        itemsTemplate: function() {

            var $wrap = $('<div class="media"></div>');

            this.$items = [];

            if (this.options.data) {

                $(this.options.data).each(function(i, item) {

                    this.$items.push($('<div class="item"><img src="' + item.large + '" alt="' + item.name + '" /></div>'));
                    $wrap.append(this.$items[i]);

                }.bind(this));

            } else {

                $wrap.append('<p>No images found!</p>');

            }

            return $wrap;

        },

        socialTemplate: function() {

            var $wrap = $('<div class="social" />');

            this.$socials = [];

            $(this.options.social.content).each(function(i, item) {

                this.$socials.push($('<a class="' + item.name + 'Block ' + item.className + ' item">' + item.name + '</a>'));
                $wrap.append(this.$socials[i]);

            }.bind(this));

            return $wrap;

        }

    });

    /* default values */

    gallery.defaults = {

        wrapId: 'galleryModule',
        thumbsIconClass: '',
        closeIconClass: '',

        brandText: 'Gallery module',
        thumbsText: 'Show thumbs',
        closeText: 'Close gallery',

        social: {
            content: [
                { name: 'facebook', className: '' },
                { name: 'twitter', className: '' },
                { name: 'gPlus', className: '' },
                { name: 'viber', className: '' },
                { name: 'mail', className: '' }
            ]
        },

        data: null,
        position: 0

    };

    return gallery;

}));
