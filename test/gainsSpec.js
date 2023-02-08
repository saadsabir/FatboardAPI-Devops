const chaiHttp = require('chai-http');
const sinon = require('sinon');
const sinontest = require('sinon-test');
const test = sinontest(sinon);
const chai = require('chai');
const accounts_controller = require('../controllers/accountsController');
const tickets_controller = require('../controllers/ticketsController');
const gains_controller = require('../controllers/gainsController');
const config = require('./config');
const router = config.serverdev;
const { expect } = chai;
const accounts_spec = require('./accountsSpec'); 

//configuration of chai
chai.use(chaiHttp);
chai.should();

/* 
* API TICKETS group description
*/
describe('Tickets', () => {
  /* 
  * add a test ticket group description
  */
 describe('add a test ticket', () => {
  /* 
  * test case to check if addtestticket function exist 
  */
  it('Should exist',test(function(){
    expect(tickets_controller.addtestticket).to.not.be.undefined;
  }));
  /* 
  * test case to add a test ticket  
  */
  it("Should add a test ticket",(done) => {
    chai.request(router)
    .post('/test/addtestticket')
    .end((err,res) => {
      res.should.have.status(200);
      expect(res.body.success).to.equals(true);
      done();
    });
  });
  /* 
  * get all tickets group description
  */
  describe('get all tickets', () => {
    /* 
    * test case to check if getalltickets function exist 
    */
    it('Should exist',test(function(){
      expect(tickets_controller.getalltickets).to.not.be.undefined;
    }));
    /* 
    * test case to get all tickets with an admin token
    */
    it('Should get list of tickets',(done) => {
      chai.request(router)
      .get('/tickets/getalltickets')
      .set("Authorization", "Bearer " + accounts_spec.adminToken)
      .end((err,res)=>{
        res.should.have.status(200);
        expect(res.body.success).to.equals(true);
        done();
      });
    });
    /* 
    * test case to get all tickets with a user token
    */
    it('Should return token permissions error',(done) => {
      chai.request(router)
      .get('/tickets/getalltickets')
      .set("Authorization", "Bearer " + accounts_spec.userToken)
      .end((err,res)=>{
        res.should.have.status(401);
        expect(res.body.success).to.equals(false);
        done();
      });
    });
    /* 
    * test case to get all tickets with an invalid token
    */
    it('Should return JsonWebTokenError',(done) => {
      chai.request(router)
      .get('/tickets/getalltickets')
      .end((err,res)=>{
        res.should.have.status(401);
        expect(res.body.success).to.equals(false);
        done();
      });
    });
  });
});
  /* 
  * validate a ticket group description
  */
  describe('validate a ticket', () => {
    /* 
    * test case to check if validateticket function exist 
    */
    it('Should exist',test(function(){
      expect(tickets_controller.validateticket).to.not.be.undefined;
    }));
    /* 
    * test case to validate a ticket  
    */
    it("Should validate a ticket",(done) => {
      chai.request(router)
      .post('/tickets/validateticket')
      .set("Authorization", "Bearer " + accounts_spec.testToken)
      .send({"numTicket":config.numtickettest})
      .end((err,res) => {
        res.should.have.status(200);
        expect(res.body.success).to.equals(true);
        done();
      });
    });
  });

});

/* 
* API GAIN group description
*/
describe('Gain', () => {
  describe('get my list of gain', () => {
    /* 
    * test case to check if getmygain function exist 
    */
    it('Should exist',test(function(){
      expect(gains_controller.getmygain).to.not.be.undefined;
    }));
    /* 
    * test case to get list of gain with a valid token
    */
    it('Should get my list of gain',(done) => {
      chai.request(router)
      .get('/gains/getmygain')
      .set("Authorization", "Bearer " + accounts_spec.testToken)
      .end((err,res)=>{
        res.should.have.status(200);
        expect(res.body.success).to.equals(true);
        done();
      });
    });
    /* 
    * test case to get list of gain with an invalid token
    */
    it('Should get JsonWebTokenError',(done) => {
      chai.request(router)
      .get('/gains/getmygain')
      .set("Authorization", "Bearer ")
      .end((err,res)=>{
        res.should.have.status(401);
        expect(res.body.success).to.equals(false);
        done();
      });
    });
  });
});

/******************************************************************************************* */
//last clean tests from DB

/* 
* DELETE GAIN group description
*/ 
describe('Delete gain', () => {
  /* 
  * test case to check if deletetestgain function exist 
  */
  it('Should exist',test(function(){
    expect(gains_controller.deletetestgain).to.not.be.undefined;
  }));
  /* 
  * test case to delete test gain
  */
  it('Should delete test gain',(done) => {
    chai.request(router)
    .delete('/test/deletetestgain')
    .end((err,res)=>{
      res.should.have.status(200);
      expect(res.body.success).to.equals(true);
      done();
    });
  });
});
/* 
* UPDATE TICKET group description
*/ 
describe('UPDATE ticket', () => {
  /* 
  * test case to check if updatetestticket function exist 
  */
  it('Should exist',test(function(){
    expect(tickets_controller.updatetestticket).to.not.be.undefined;
  }));
  /* 
  * test case to update test ticket
  */
  it('Should reset test ticket',(done) => {
    chai.request(router)
    .put('/test/updatetestticket')
    .end((err,res)=>{
      res.should.have.status(200);
      expect(res.body.success).to.equals(true);
      done();
    });
  });
});
/* 
* DELETE ACCOUNT group description
*/ 
describe('Delete account', () => {
  /* 
  * test case to check if deletetestaccount function exist 
  */
  it('Should exist',test(function(){
    expect(accounts_controller.deletetestaccount).to.not.be.undefined;
  }));
  /* 
  * test case to delete test account
  */
  it('Should delete test account',(done) => {
    chai.request(router)
    .delete('/test/deletetestaccount')
    .end((err,res)=>{
      res.should.have.status(200);
      expect(res.body.success).to.equals(true);
      done();
    });
  });
});
/* 
* DELETE admin and user test account group description
*/ 
describe('Delete admin and user test account', () => {
  /* 
  * test case to check if deleteadminandusertestaccount function exist 
  */
  it('Should exist',test(function(){
    expect(accounts_controller.deleteadminandusertestaccount).to.not.be.undefined;
  }));
  /* 
  * test case to delete test account
  */
  it('Should delete test admin and user accounts',(done) => {
    chai.request(router)
    .delete('/test/deleteadminandusertestaccount')
    .end((err,res)=>{
      res.should.have.status(200);
      expect(res.body.success).to.equals(true);
      done();
    });
  });
});
/* 
  * delete test ticket group description
  */
 describe('delete test ticket', () => {
  /* 
  * test case to check if deletetestticket function exist 
  */
  it('Should exist',test(function(){
    expect(tickets_controller.deletetestticket).to.not.be.undefined;
  }));
  /* 
  * test case to delete test ticket  
  */
  it("Should delete test ticket",(done) => {
    chai.request(router)
    .delete('/test/deletetestticket')
    .end((err,res) => {
      res.should.have.status(200);
      expect(res.body.success).to.equals(true);
      done();
    });
  });
});
