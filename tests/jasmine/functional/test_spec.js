var sshot = 'reports/screenshots/';
var webdriverjs = require('webdriverjs'),
    wdjsSeleniumBundle = require("webdriverjs-selenium-bundle");

describe('app tests', function() {

    var client = {};
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 9999999;

    beforeEach(function() {
        client = webdriverjs.remote({ desiredCapabilities: {
            browserName: 'chrome',
            chromeOptions:{
                args:['--disable-web-security']
            }
        } });
        client.use(wdjsSeleniumBundle({autostop: false}));
        client.init();
    });

    describe('Open app', function() {
        it('should show app', function(done){
            console.log("Entered test");
            client
                //.url('file:///'+__dirname+'/../../../app/index.html')
                .url('http://localhost:9000')
                .getTitle(function(err, title) {
                    console.log("TITLE: %s", title);
                    expect(err).toBe(null);
                    expect(title).toBe('XYZ');
                })
//                .setValue('#username-inner', 'john.millerp106@gmail.com')
//                .setValue('#password-inner', 'Abcd1234')
//                .saveScreenshot(sshot+'login.png', function(err, image){
//                    if(!err) console.log('login.png saved');
//                })
//                .click('#submit');
//            console.log();
//            client
//                .waitFor('div#content', 10000, function(err){
//                    console.log();
//                })
//    //            .waitFor(function(title){
//    //                return window.document.title === title;
//    //            }, 'index.html', 10000)
//                //.assert.text('.sapMBarPH .sapMLabel').is('My Home')
//                .getText('.sapMBarPH .sapMLabel', function(err, val){
//                    expect(val).toBe('My Home');
//                })
//                .getAttribute('.sapMBarPH .sapMLabel', 'class', function(err, val){
//                    expect(val).toBe('p106-HomepageTitle');
//                })
//                .saveScreenshot(sshot+'homepage.png', function(err, image){
//                    if(!err) console.log('homepage.png saved');
//                })
                .call(done);
        });
    });

    afterEach(function(done) {
        client.end(done);
    });
});