[![Build Status](https://travis-ci.org/davoreric/galleryPane.svg?branch=master)](https://travis-ci.org/davoreric/galleryPane)

# galleryPane
Standalone gallery pane module with swipe slider and social integration. Supports AMD and CommonJS module integration.

You can view [DEMO HERE](http://davoreric.github.io/galleryPane/).


# Demo install
- git clone
- npm install
- bower install
- open "/demo/"

# Integration

Main files:

- /dist/gallery.css
- /dist/script.js

Invoke example:

    var gallery = new Gallery({

        data: jsonData,
        rootUrl: '/demo',
        historyAPI: false,
        thumbsIconClass: 'iconRpl gridIcon',
        closeIconClass: 'iconRpl closeIcon'

    }).render();


JSON data example:

    var jsonData = [
        {
            title: 'slika 1',
            large: 'http://www.omnihotels.com/-/media/images/globals/activities/skiing-86491418.jpg?h=660&la=en&w=1170',
            thumb: 'http://www.omnihotels.com/-/media/images/globals/activities/skiing-86491418.jpg?h=660&la=en&w=1170',
            url: '/slika-1',
            author: 'Marky Mark',
            source: 'Rolling Stone',
            social: {
                facebook: { count: 12 }
            }
        },
        {
            title: 'slika 2',
            large: 'http://i.telegraph.co.uk/multimedia/archive/02777/skiing_2777599b.jpg',
            thumb: 'http://i.telegraph.co.uk/multimedia/archive/02777/skiing_2777599b.jpg',
            url: '/slika-2',
            author: 'Marky Mark',
            source: 'Rolling Stone',
            social: {
                facebook: { count: 225 }
            }
        },
        {
            title: 'slika 3',
            large: 'http://gossipgenie.com/wp-content/uploads/2014/01/Alpine-Skiing.jpg',
            thumb: 'http://gossipgenie.com/wp-content/uploads/2014/01/Alpine-Skiing.jpg',
            url: '/slika-3',
            author: 'Marky Mark',
            source: 'Rolling Stone',
            social: {
                facebook: { count: 145 }
            }
        }
    ];





