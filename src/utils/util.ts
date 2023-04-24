export const generateSessionId = () => {
    const rand_session_id = Math.random().toString(36).substr(2, 11);
    return rand_session_id;
}