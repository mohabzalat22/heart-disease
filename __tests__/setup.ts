// Global test setup
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.OLLAMA_BASE_URL = 'http://localhost:11434';
process.env.OLLAMA_MODEL = 'test-model';
process.env.MCP_SERVER_URL = 'http://localhost:5000';
(process.env as any).NODE_ENV = 'test';
