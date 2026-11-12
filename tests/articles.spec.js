const request = require("supertest");
const { app } = require("../server");
const jwt = require("jsonwebtoken");
const config = require("../config");
const mongoose = require("mongoose");
const mockingoose = require("mockingoose");
const User = require("../api/users/users.model");
const Article = require("../api/articles/articles.schema");

describe("tester API articles", () => {
  let token;
  const USER_ID = new mongoose.Types.ObjectId().toString();
  const ARTICLE_ID = new mongoose.Types.ObjectId().toString();
  const MOCK_USER = {
    _id: USER_ID,
    name: "admin",
    email: "admin@test.net",
    role: "admin",
  };
  const MOCK_DATA_CREATED = {
    title: "Mon article",
    content: "Contenu de l'article",
    status: "draft",
  };
  const MOCK_DATA_UPDATED = {
    _id: ARTICLE_ID,
    title: "Titre modifié",
    content: "Contenu de l'article",
    status: "published",
    user: USER_ID,
  };

  beforeEach(() => {
    token = jwt.sign({ userId: USER_ID }, config.secretJwtToken);
    // utilisateur récupéré par le middleware d'authentification
    mockingoose(User).toReturn(MOCK_USER, "findOne");
    mockingoose(Article).toReturn(MOCK_DATA_UPDATED, "findOneAndUpdate");
    mockingoose(Article).toReturn({ deletedCount: 1 }, "deleteOne");
  });

  test("[Articles] Create Article", async () => {
    const res = await request(app)
      .post("/api/articles")
      .send(MOCK_DATA_CREATED)
      .set("x-access-token", token);
    expect(res.status).toBe(201);
    expect(res.body.title).toBe(MOCK_DATA_CREATED.title);
    expect(res.body.user).toBe(USER_ID);
  });

  test("[Articles] Update Article", async () => {
    const res = await request(app)
      .put(`/api/articles/${ARTICLE_ID}`)
      .send({ title: "Titre modifié", status: "published" })
      .set("x-access-token", token);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe(MOCK_DATA_UPDATED.title);
  });

  test("[Articles] Delete Article", async () => {
    const res = await request(app)
      .delete(`/api/articles/${ARTICLE_ID}`)
      .set("x-access-token", token);
    expect(res.status).toBe(204);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
