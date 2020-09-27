const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose =require("mongoose");
const app = require("../src/app");
const User = require("../src/models/user");
const Meeting = require("../src/models/meeting")
const moment = require("moment");

const {userOneId, userOne, setupDatabase,meeting1, meeting2, meeting3, userTwoId, userTwo} = require("./fixtures/db")

beforeEach(setupDatabase);

test("Should create meeting for user", async ()=>{
    const response = await request(app).
                           post("/meetings").
                           set("Authorization", `Bearer ${userOne.tokens[0].token}`).
                           send({
                               description:"Meeting 1",
                               startHour :10,
                               startMin :30,
                               endHour:12,
                               endMin:45,
                               dateOfMeeting:moment().format('DD/MM/YYYY'),
                               creator:userOneId
                           }).expect(200);
    const meeting = await Meeting.findById(response.body._id);
    expect(meeting).not.toBeNull();
    expect(meeting.startHour).toBe(10);
});

test("Should not create meeting with invalid details",  async()=>{
    const response = await request(app).
                           post("/meetings").
                           set("Authorization", `Bearer ${userOne.tokens[0].token}`).
                           send({
                               description:"Meeting 1",
                               startHour :-10,
                               startMin :30,
                               endHour:12,
                               endMin:45,
                               dateOfMeeting:moment().format('DD/MM/YYYY'),
                               creator:userOneId
                           }).expect(400);
})

test("Should not update meeting with invalid details", async()=>{
    const response = await request(app).
                           patch(`/meetings/${meeting1._id}`).
                           set("Authorization", `Bearer ${userOne.tokens[0].token}`).
                           send({
                            startHour :-10,
                            startMin :30
                           }).expect(400);
});

test("Should not update other users meetings", async()=>{
    const response = await request(app).
                    patch(`/meetings/${meeting1._id}`).
                    set("Authorization", `Bearer ${userTwo.tokens[0].token}`).
                    send({
                    startHour :10,
                    startMin :30
                    }).expect(404);
    const meeting = await Meeting.findOne({creator:userOneId});
    expect(meeting).not.toBeNull();    
});

test("should excuse member form meeting", async()=>{
    const response = await request(app).
                    patch(`/meetings/removeUser/${meeting2._id}`).
                    set("Authorization", `Bearer ${userOne.tokens[0].token}`).
                    send().expect(200);
    const meeting = await Meeting.findById(meeting1._id);
    const user = User.findById(userOneId);
    expect(meeting.emails).not.toContain(user.email);
})

test("should delete meeting if no members in emails", async()=>{
    const response = await request(app).
                    patch(`/meetings/removeUser/${meeting1._id}`).
                    set("Authorization", `Bearer ${userOne.tokens[0].token}`).
                    send().expect(200);
    const meeting = await Meeting.findById(meeting1._id);
    expect(meeting).toBeNull();
});


test("Should fetch user meeting by id", async()=>{
    const response = await request(app).
                           get(`/meetings/${meeting1._id}`).
                           set("Authorization", `Bearer ${userOne.tokens[0].token}`).
                           send().
                           expect(200); 
})

test("Should not fetch user meeting by id if not autheticated", async()=>{
    const response = await request(app).
                           get(`/meetings/${meeting1._id}`).
                           set("Authorization", `Bearer ${userOne.tokens[0].token}123`).
                           send().
                           expect(401); 
})


test("Should get meetings of user1", async()=>{
    const response = await request(app).
                           get("/meetings").
                           set("Authorization", `Bearer ${userOne.tokens[0].token}`).
                           send().
                           expect(200);
    expect(response.body.length).toBe(2);
});

test("Should not allow second user to delete first user's meetings", async()=>{
    const response = await request(app).
                           delete(`/meetings/${meeting1._id}`).
                           set("Authorization", `Bearer ${userTwo.tokens[0].token}`).
                           send().
                           expect(404);
    const meeting = await Meeting.findOne({creator:userOneId});
    expect(meeting).not.toBeNull();
});

test("Should delete user meeting", async()=>{
    const response = await request(app).
                           delete(`/meetings/${meeting1._id}`).
                           set("Authorization", `Bearer ${userOne.tokens[0].token}`).
                           send().
                           expect(200);
});


test("Should not delete meeting if unauthenticated", async()=>{
    const response = await request(app).
                            delete(`/meetings/${meeting1._id}`).
                            set("Authorization", `Bearer ${userOne.tokens[0].token}123`).
                            send().
                            expect(401);
});









