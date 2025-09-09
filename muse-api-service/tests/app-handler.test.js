import request from "supertest";
import { app } from "../app.js";

describe("[Middleware] Error handling", () => {
	it("should return 404 for unknown route", async () => {
		const res = await request(app).get("/non-existent-route");
		expect(res.status).toBe(404);
		expect(res.body).toEqual({ error: "Not found" });
	});

	it("should return 500 for internal server error", async () => {
		app.get("/error-for-test", (req, res) => {
			throw new Error("Test error");
		});

		const res = await request(app).get("/error-for-test");
		expect(res.status).toBe(500);
		expect(res.body).toEqual({ error: "Test error" });
	});
});
