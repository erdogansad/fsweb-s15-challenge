const request = require("supertest");
const server = require("./server");
const db = require("../data/dbConfig");
const bilmeceler = require("../api/bilmeceler/bilmeceler-data");

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});
afterAll(async () => {
  await db.destroy();
});

test("[0] sanity check", () => {
  expect(true).not.toBe(false);
});

describe("Auth", () => {
  describe("[POST] /api/auth/register", () => {
    test("[1] veritabanında yeni bir kullanıcı oluşturuluyor", async () => {
      const res = await request(server).post("/api/auth/register").send({ username: "foo", password: "bar" });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id", 1);
    });
    test("[2] aynı kullanıcı adıyla kayıt olunamaz", async () => {
      await request(server).post("/api/auth/register").send({ username: "foo", password: "bar" });
      const res2 = await request(server).post("/api/auth/register").send({ username: "foo", password: "bar" });
      expect(res2.status).toBe(409);
      expect(res2.body).toHaveProperty("message", "username alınmış");
    });
    test("[3] kullanıcı adı ve şifre gereklidir", async () => {
      const res = await request(server).post("/api/auth/register").send({ username: "foo" }),
        res2 = await request(server).post("/api/auth/register").send({ password: "foo" });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "username ve şifre gereklidir");
      expect(res2.status).toBe(400);
      expect(res2.body).toHaveProperty("message", "username ve şifre gereklidir");
    });
  });
  describe("[POST] /api/auth/login", () => {
    test("[4] kullanıcı girişi başarılı", async () => {
      await request(server).post("/api/auth/register").send({ username: "foo", password: "bar" });
      const res = await request(server).post("/api/auth/login").send({ username: "foo", password: "bar" });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "welcome, foo");
    });
    test("[5] kullanıcı adı ve şifre gereklidir", async () => {
      const res = await request(server).post("/api/auth/login").send({ username: "foo" }),
        res2 = await request(server).post("/api/auth/login").send({ password: "foo" });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "username ve şifre gereklidir");
      expect(res2.status).toBe(400);
      expect(res2.body).toHaveProperty("message", "username ve şifre gereklidir");
    });
    test("[6] kullanıcı adı ve şifre doğru değil", async () => {
      await request(server).post("/api/auth/register").send({ username: "foo", password: "bar" });
      const res = await request(server).post("/api/auth/login").send({ username: "foo", password: "baz" });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "geçersiz kriterler");
    });
  });
});

describe("Bilmeceler", () => {
  describe("[GET] /api/bilmeceler", () => {
    test("[7] bilmeceler listeleniyor", async () => {
      await request(server).post("/api/auth/register").send({ username: "foo", password: "bar" });
      const res = await request(server).post("/api/auth/login").send({ username: "foo", password: "bar" });
      const res2 = await request(server).get("/api/bilmeceler").set("Authorization", `Bearer ${res.body.token}`);
      expect(res2.status).toBe(200);
      expect(res2.body).toHaveLength(bilmeceler.length);
    });
    test("[8] token gönderilmediğinde 400 hatası döndürüyor", async () => {
      const res = await request(server).get("/api/bilmeceler");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "token gereklidir");
    });
    test("[9] token süresi dolduysa 401 hatası döndürüyor", async () => {
      await request(server).post("/api/auth/register").send({ username: "foo", password: "bar" });
      const res = await request(server).post("/api/auth/login").send({ username: "foo", password: "bar" });
      const res2 = await request(server)
        .get("/api/bilmeceler")
        .set(
          "Authorization",
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJmb28iLCJpYXQiOjE2ODg4MTgwMjQsImV4cCI6MTY4ODgwNzgyNH0.UcEMPoW-Fxt7BK7IeiAv_KXNtqK52Qvi5QTp7xf7woc`
        );
      expect(res2.status).toBe(401);
      expect(res2.body).toHaveProperty("message", "token geçersizdir");
    });
    test("[10] token geçersiz olduğunda 401 hatası döndürüyor", async () => {
      const res = await request(server).get("/api/bilmeceler").set("Authorization", `Bearer foo`);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "token geçersizdir");
    });
  });
});
