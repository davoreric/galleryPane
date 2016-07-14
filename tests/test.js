module.exports = {

    'Open gallery pane' : function (client) {

        client
            .url('http://davoreric.github.io/galleryPane/')
            .click('#openGallery');

        client.expect.element('.gpElement').to.be.present;

    },

    'Is first image visible' : function (client) {

        var firstImageSelector = '.gpItems li:nth-child(1) img';

        client
            .waitForElementVisible(firstImageSelector, 5000);

        client.expect.element(firstImageSelector).to.be.visible;

    },

    'Open thumbs' : function (client) {

        client
            .click('.gpToggleThumbsBtn');

        client.expect.element('.gpThumbs').to.be.visible;

    },

    'Click on second thumb and open image' : function (client) {

        var secondImageSelector = '.gpItems li:nth-child(2) img';

        client
            .waitForElementVisible('.gpThumbs', 5000)
            .click('.gpThumbs li:nth-child(2) .gpThumb')
            .waitForElementVisible(secondImageSelector, 5000);

        client.expect.element(secondImageSelector).to.be.visible;

    },

    'Close thumbs' : function (client) {

        client
            .click('.gpToggleThumbsBtn');

        client.expect.element('.gpThumbs').to.not.be.visible;

    },

    'Close gallery pane' : function (client) {

        client
            .click('.gpCloseBtn')
            .pause(500);

        client.expect.element('.gpElement').to.not.be.present;

        client.end();

    }

};
