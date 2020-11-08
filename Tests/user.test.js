const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");

const {userOneId, userOne, setupDatabase} = require("./fixtures/db")

beforeEach(setupDatabase);


test("Should Login Existing User", async ()=>{
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password:userOne.password
    }).expect(200);
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();
    const tokensArray = response.body.user.tokens;
    const tokenAdded = tokensArray[tokensArray.length-1].token;
    expect(response.body.token).toBe(tokenAdded);
});


test("Should not login non existing user",async ()=>{
    await request(app).post("/users/login").send({
        email:"johndoe123@gmail.com",
        password:"hello123"
    }).expect(404);
});

test("Should get profile for authenticated user", async()=>{
    await request(app).
          get("/users/me").
          set("Authorization", `Bearer ${userOne.tokens[0].token}`).
          send().expect(200);
});


test("Should not get profile for unauthenticated user", async ()=>{
    await request(app).
          get("/users/me").
          set("Authorization", `Bearer ${userOne.tokens[0].token}123`).
          send().
          expect(401);
});

test("Should delete account for user" , async()=>{
    const response =  await request(app).delete("/users/me").
          set("Authorization", `Bearer ${userOne.tokens[0].token}`).
          send().expect(200);
    const user = await User.findById(userOneId);
    expect(user).toBeNull();
    
})

test("Should not delete account for non autheticated user", async()=>{
    await request(app).delete("/users/me").
          set("Authorization", `Bearer ${userOne.tokens[0].token}123`).
          send().expect(401);
});


test("Should upload profile image", async()=>{
    await request(app).post("/users/me/profileNavbar").
    set("Authorization", `Bearer ${userOne.tokens[0].token}`).
    attach('avatar','tests/fixtures/profile-pic.jpg').
    expect(200);

    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));    
});


test("Should update valid user fields", async()=>{
    const response = await request(app).patch("/users/me").
    set("Authorization", `Bearer ${userOne.tokens[0].token}`).send({
        name : "Anthony Soprano",
        age : 45
    }).expect(200);  

    const user = await User.findById(userOneId);
    expect(user.name).toBe("Anthony Soprano");
    expect(user.age).toBe(45);
});

test("Should not update user if unauthenticated", async()=>{
    const response = await request(app).patch("/users/me").
    set("Authorization", `Bearer ${userOne.tokens[0].token}123`).send({
        name : "Anthony Soprano",
        age : 45
    }).expect(401);  
});

test("Should not update user with invalid name/email/password", async()=>{
    const response = await request(app).patch("/users/me").
    set("Authorization", `Bearer ${userOne.tokens[0].token}`).send({
        name : "Anthony Soprano",
        age : 45,
        email:"anthonysoprano123gmail.com"
    }).expect(500);  
});

test("Should not update unauthenticated user", async()=>{
    const response = await request(app).patch("/users/me").
    set("Authorization", `Bearer ${userOne.tokens[0].token}123`).send({
        name : "Anthony Soprano",
        age : 45
    }).expect(401);
});

test("Should Logout User", async()=>{
    const response = await request(app).post("/users/logout").
    set("Authorization", `Bearer ${userOne.tokens[0].token}`).
    send().
    expect(200);
});

test("Should delete profile image", async()=>{
    const response = await request(app).delete(`/users/me/avatar`).
    set("Authorization", `Bearer ${userOne.tokens[0].token}`).
    send().
    expect(200);

    const user = await User.findById(userOneId);
    expect(user.avatar).toBeUndefined();
}); 

test("Should not delete profile for unautheticated user", async()=>{
    const response = await request(app).delete(`/users/me/avatar`).
    set("Authorization", `Bearer ${userOne.tokens[0].token}123`).
    send().
    expect(401);
});



