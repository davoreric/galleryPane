# galleryPane
Standalone gallery pane module with swipe slider and social integration

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
            name: 'slika 1',
            large: 'http://www.omnihotels.com/-/media/images/globals/activities/skiing-86491418.jpg?h=660&la=en&w=1170',
            thumb: 'http://www.omnihotels.com/-/media/images/globals/activities/skiing-86491418.jpg?h=660&la=en&w=1170',
            url: '/slika-1',
            social: {
                facebook: { count: 12 }
            }
        },
        {
            name: 'slika 2',
            large: 'http://i.telegraph.co.uk/multimedia/archive/02777/skiing_2777599b.jpg',
            thumb: 'http://i.telegraph.co.uk/multimedia/archive/02777/skiing_2777599b.jpg',
            url: '/slika-2',
            social: {
                facebook: { count: 225 }
            }
        },
        {
            name: 'slika 3',
            large: 'http://gossipgenie.com/wp-content/uploads/2014/01/Alpine-Skiing.jpg',
            thumb: 'http://gossipgenie.com/wp-content/uploads/2014/01/Alpine-Skiing.jpg',
            url: '/slika-3',
            social: {
                facebook: { count: 145 }
            }
        }
    ];





