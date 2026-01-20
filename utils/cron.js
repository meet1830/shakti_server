import cron from "node-cron";

const initKeepAliveCron = () => {
  // Cron syntax: minute | hour | day of month | month | day of week
  // "*/10 8-23 * * *" means: Every 10 mins, between 8:00 AM and 11:59 PM (23:59)
  cron.schedule(
    "*/10 8-23 * * *",
    async () => {
      try {
        fetch(`${process.env.SERVER_URL}/health`, {
          method: "GET",
          headers: {
            "User-Agent": "Render-Keep-Alive-Cron",
          },
        });
      } catch (error) {
        //
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    },
  );
};

export { initKeepAliveCron };
