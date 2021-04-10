module.exports = {
  apps : [
      {
        name: "networker",
        script: "./index.js",
        watch: false,
        instance_var: 'INSTANCE_ID',
        env: {
            "PORT": 3090,
            "NODE_ENV": "production"
        }
      }
  ]
}