// LandingPrep — pm2 process config for the Hostinger VPS.
// Keeps the Node server running 24/7 and restarts it on crash / reboot.
//
//   npm i -g pm2
//   pm2 start config/ecosystem.config.cjs
//   pm2 save
//   pm2 startup        # then run the command it prints (enables boot startup)
//
// The Gemini API key + PORT come from .env (never commit .env).
module.exports = {
  apps: [
    {
      name: "landingprep",
      script: "server.js",
      cwd: __dirname + "/..",
      instances: 1,
      autorestart: true,
      max_memory_restart: "400M",
      env: { NODE_ENV: "production" },
    },
  ],
};
