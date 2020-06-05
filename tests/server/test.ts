import request from "supertest";

import { describe, it } from "mocha";
import { app, server } from "../../server/server";

describe("server", () => {
  it("index", async () => {
    await request(app).get("/").expect(200);
  });

  it("about", (done) => {
    request(app).get("/about").expect(200, done);
  });

  it("about-submitted", (done) => {
    request(app).get("/about-submitted").expect(200, done);
  });

  it("request-calculation", async () => {
    await request(app).get("/request-calculation").expect(200);
  });

  it("request-calculation-submitted", async () => {
    await request(app).get("/request-calculation-submitted").expect(200);
  });

  it("status", async () => {
    await request(app).get("/status").expect(200);
  });

  after((done) => {
    process.exit();
  });
});
