module.exports = (function(settings) {

    settings.test_workers = false;
    return settings;

})({

    "src_folders" : ["tests"],
    "output_folder" : "reports",

    "selenium" : {

        "start_process" : false,
        "host" : "hub.browserstack.com",
        "port" : 80

    },

    "test_settings" : {

        "default" : {

            "launch_url" : "http://hub.browserstack.com",
            "selenium_port"  : 80,
            "selenium_host"  : "hub.browserstack.com",
            "silent": true,
            "screenshots" : {
                "enabled" : false,
                "path" : ""
            },

            "desiredCapabilities": {

                "browserName": "Chrome",
                "browser_version": "46.0",
                "os": "Windows",
                "os_version": "8.1",
                "javascriptEnabled": true,
                "acceptSslCerts": true,
                "browserstack.user": process.env.BROWSER_STACK_USERNAME,
                "browserstack.key": process.env.BROWSER_STACK_ACCESS_KEY

            }

        }

    }

});
