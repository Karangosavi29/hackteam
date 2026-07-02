const required = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL'];

const validateEnv = () => {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(`Missing env variables: ${missing.join(', ')}`);
    process.exit(1);
  }
};

module.exports = { validateEnv };