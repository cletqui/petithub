export const getOctokitInstance = vi.fn(() => ({
  repos: {
    get: vi
      .fn()
      .mockResolvedValue({
        data: { id: 123, name: "mock-repo", full_name: "mockuser/mock-repo" },
      }),
    listForUser: vi
      .fn()
      .mockResolvedValue({
        data: [{ id: 123, name: "mock-repo", full_name: "mockuser/mock-repo" }],
      }),
  },
}));

export const verifyToken = vi.fn((token: string) => token === "valid-token");
export const getRandomRepository = vi
  .fn()
  .mockResolvedValue({
    id: 123,
    name: "mock-repo",
    full_name: "mockuser/mock-repo",
  });
export const getRepository = vi
  .fn()
  .mockResolvedValue({
    id: 123,
    name: "mock-repo",
    full_name: "mockuser/mock-repo",
  });
export const getMaxId = vi.fn().mockResolvedValue(815471592);
