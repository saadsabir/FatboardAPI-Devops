const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const sinontest = require('sinon-test');
const test = sinontest(sinon);
const config = require('./config');
const accounts_controller = require('../controllers/accountsController');
const router = config.serverdev;
const { expect } = chai;
var testToken = '';
var adminToken = '';
var userToken = '';


//configuration of chai
chai.use(chaiHttp);
chai.should();

 /* 
* API ACCOUNT group description
*/
describe('Account', () => {
    /* 
    * create admin account group description
    */
    describe('create an admin account', () => {
        /* 
        * test case to check if addadmintestaccount function exist 
        */
        it('Should exist',test(function(){
            expect(accounts_controller.addadmintestaccount).to.not.be.undefined;
        }));
        /* 
        * test case to create a new admin account
        */
        it('Should create a new admin account',(done) => {
            chai.request(router)
            .post('/test/addadmintestaccount')
            .set("Content-Type", "application/json")
            .end((err,res)=>{
            res.should.have.status(200);
            expect(res.body.success).to.equals(true);
            adminToken = res.body.result;
            exports.adminToken = adminToken;
            done();
            });
        });
    });
    /* 
    * create user account group description
    */
    describe('create an user account', () => {
        /* 
        * test case to check if addusertestaccount function exist 
        */
        it('Should exist',test(function(){
            expect(accounts_controller.addusertestaccount).to.not.be.undefined;
        }));
        /* 
        * test case to create a new admin account
        */
        it('Should create a new user account',(done) => {
            chai.request(router)
            .post('/test/addusertestaccount')
            .set("Content-Type", "application/json")
            .end((err,res)=>{
            res.should.have.status(200);
            expect(res.body.success).to.equals(true);
            userToken = res.body.result;
            exports.userToken = userToken;
            done();
            });
        });
    });
    /* 
    * get all accounts group description
    */
    describe('Get all accounts', () => {
        /* 
        * test case to check if getallaccounts function exist 
        */
        it('Should exist',test(function(){
            expect(accounts_controller.getallaccounts).to.not.be.undefined;
        }));
        /* 
        * test case to get all accounts with an admin token
        */
        it('Should get list of accounts',(done) => {
            chai.request(router)
            .get('/accounts/getallaccounts')
            .set("Authorization", "Bearer " + adminToken)
            .end((err,res)=>{
            res.should.have.status(200);
            expect(res.body.success).to.equals(true);
            done();
            });
        });
        /* 
        * test case to get all accounts with a user token
        */
        it('Should return token permissions error',(done) => {
            chai.request(router)
            .get('/accounts/getallaccounts')
            .set("Authorization", "Bearer " + userToken)
            .end((err,res)=>{
            res.should.have.status(401);
            expect(res.body.success).to.equals(false);
            done();
            });
        });
        /* 
        * test case to get all accounts with an invalid token
        */
        it('Should return JsonWebTokenError',(done) => {
            chai.request(router)
            .get('/accounts/getallaccounts')
            .end((err,res)=>{
            res.should.have.status(401);
            expect(res.body.success).to.equals(false);
            done();
            });
        });
    });
    /* 
    * get an account group description
    */
    describe('Get an account', () => {
        /* 
        * test case to check if getmyaccount function exist 
        */
        it('Should exist',test(function(){
            expect(accounts_controller.getmyaccount).to.not.be.undefined;
        }));
        /* 
        * test case to get an account with a valid token
        */
        it('Should get an account by token',(done) => {
            chai.request(router)
            .get('/accounts/getmyaccount')
            .set("Authorization", "Bearer " + userToken)
            .end((err,res)=>{
            res.should.have.status(200);
            expect(res.body.success).to.equals(true);
            done();
            });
        });
        /* 
        * test case to get an account with an invalid token
        */
        it('Should return JsonWebTokenError',(done) => {
            chai.request(router)
            .get('/accounts/getmyaccount')
            .end((err,res)=>{
            res.should.have.status(401);
            expect(res.body.success).to.equals(false);
            done();
            });
        });
    });

    /* 
    * create an account group description
    */
    describe('create a test account', () => {
        /* 
        * test case to check if addaccount function exist 
        */
        it('Should exist',test(function(){
            expect(accounts_controller.addaccount).to.not.be.undefined;
        }));
        /* 
        * test case to create a new account
        */
        it('Should create a new account',(done) => {
            chai.request(router)
            .post('/accounts/addaccount')
            .set("Content-Type", "application/json")
            .send({"email": config.emailtest, "password": config.passwordtest,"acceptCGU":true})
            .end((err,res)=>{
            res.should.have.status(200);
            expect(res.body.success).to.equals(true);
            done();
            });
        });
    });

    /* 
    * update an account group description
    */
    describe('update an account', () => {
        /* 
        * test case to check if updateaccount function exist 
        */
        it('Should exist',test(function(){
            expect(accounts_controller.updateaccount).to.not.be.undefined;
        }));
        /* 
        * test case to update an account
        */
        it('Should update an account',(done) => {
            chai.request(router)
            .put('/accounts/updateaccount')
            .set("Authorization", "Bearer " + userToken)
            .set("Content-Type", "application/json")
            .send({
            "email":"usertest001@test.fr",   
            "datenaissance": "1994-09-10",
            "nom": "nomtest",
            "prenom": "prenomtest",
            "password": "test",
            "tel": "0000000000",
            })
            .end((err,res)=>{
            res.should.have.status(200);
            expect(res.body.success).to.equals(true);
            done();
            });
        });
    });
    });

/* 
* API CONNECTION group description
*/
describe('Connection', () => {
    /* 
    * Classic connection group description
    */
    describe('Classic Connection', () => {
        /* 
        * test case to check if connection function exist 
        */
        it('Should exist',test(function(){
            expect(accounts_controller.connection).to.not.be.undefined;
        }));
        /* 
        * test case to do a classic connection
        */
        it('Should do a classic connection',(done) => {
            chai.request(router)
            .post('/accounts/connection')
            .set("Content-Type", "application/json")
            .send({"email": config.emailtest, "password": config.passwordtest})
            .end((err,res)=>{
            res.should.have.status(200);
            expect(res.body.success).to.equals(true);
            testToken = res.body.result;
            exports.testToken = testToken;
            done();
            });
        });    
        /* 
        * test case to return a connection error
        */
        it('Should return a connection error',(done) => {
            chai.request(router)
            .post('/accounts/connection')
            .set("Content-Type", "application/json")
            .send({"email": config.emailtest, "password": "fake"})
            .end((err,res)=>{
            res.should.have.status(401);
            expect(res.body.success).to.equals(false);
            done();
            });
        });
    });  
});

