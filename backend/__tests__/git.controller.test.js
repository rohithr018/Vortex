import request from 'supertest';
import express from 'express';
import gitRoutes from '../routes/git.routes.js';
import * as gitController from '../controllers/git.controller.js';

const app = express();
app.use(express.json());
app.use('/api/git', gitRoutes);
// Mock Octokit API functions
jest.mock('@octokit/rest', () => {
    return {
        Octokit: jest.fn().mockImplementation(() => ({
            repos: {
                listForUser: jest.fn(({ username }) => {
                    if (username === 'notfound') {
                        const error = new Error('Not Found');
                        error.status = 404;
                        throw error;
                    }
                    return Promise.resolve({ data: [{ id: 1, name: 'repo1' }] });
                }),
                listBranches: jest.fn(({ owner, repo }) => {
                    if (repo === 'missing') {
                        const error = new Error('Not Found');
                        error.status = 404;
                        throw error;
                    }
                    return Promise.resolve({ data: [{ name: 'main' }] });
                }),
            },
        })),
    };
});

describe('Git Controller', () => {
    it('should return repositories for a valid GitHub user', async () => {
        const response = await request(app).post('/api/git/repos').send({
            githubProfile: 'validuser',
        });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(expect.any(Array));
    });

    it('should return 404 for invalid GitHub user', async () => {
        const response = await request(app).post('/api/git/repos').send({
            githubProfile: 'notfound',
        });

        expect(response.status).toBe(404);
        expect(response.body.message).toMatch(/GitHub user not found/);
    });

    it('should return branches of a repo', async () => {
        const response = await request(app).get('/api/git/branches/testowner/testrepo');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(expect.arrayContaining([{ name: 'main' }]));
    });

    it('should return 404 if repo is missing', async () => {
        const response = await request(app).get('/api/git/branches/testowner/missing');

        expect(response.status).toBe(404);
        expect(response.body.message).toMatch(/Repository not found/);
    });
});
