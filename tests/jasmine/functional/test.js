var sshot = 'test/screenshots/';
module.exports = {
    'p106 login works': function (test) {
        test
            .open('file:///'+__dirname+'/../MobileApp/login.html')
            .assert.title().is('XYZ')
            .type('#username-inner', 'john.millerp106@gmail.com')
            .type('#password-inner', 'Abcd1234')
            .screenshot(sshot+'login.jpg')
            .click('#submit')
            .waitFor(function(title){
                return window.document.title === title;
            }, 'index.html', 10000)
            //.assert.text('.sapMBarPH .sapMLabel').is('My Home')
            .assert.chain()
            .query('.sapMBarPH .sapMLabel')
            .text().is('My Home')
            .visible()
            .attr('class', 'p106-HomepageTitle')
            .end()
            .end()
            .screenshot(sshot+'homepage.jpg')
            .done();
    },
    'user administration': function (test) {
        test
            .click('#administrationTile')
            .waitFor(function(title){
                return window.document.title === title;
            }, 'index.html', 10000)
            //.assert.text('.sapMBarPH .sapMLabel').is('My Home')
            .done();
    }
};