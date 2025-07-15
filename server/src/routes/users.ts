import { Hono } from "hono";
// import type { User } from "shared/dist";
// import { json } from "hono/media";

const users: User[] = []; // In-memory storage for demonstration

export const usersRouter = new Hono();

usersRouter.get("/search", async (c) => {
  const { email, nickname, latitude, longitude } = c.req.query();

  if (latitude && longitude) {
    // Simple distance calculation (in degrees)
    const usersWithDistance = users.map((user) => ({
      ...user,
      distance: Math.sqrt(
        Math.pow(user.latitude! - Number(latitude), 2) +
          Math.pow(user.longitude! - Number(longitude), 2),
      ),
    }));

    return json(
      c,
      usersWithDistance.sort((a, b) => a.distance - b.distance),
    );
  }

  const filteredUsers = users.filter(
    (user) =>
      user.email.includes(email || "") ||
      user.nickname.includes(nickname || ""),
  );

  return json(c, filteredUsers);
});

export default usersRouter;
