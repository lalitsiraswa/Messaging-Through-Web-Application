type AuthPayload = {
    id: String,
    role: String,
    username: String,
    workspace: String;
    name: String;
};

export type AuthResponse = {
    message: String,
    payload: AuthPayload,
    status: String,
    token: String;
};
