let lib = {
    uMap: {},
    getUser(id) {
        return lib.uMap[id] || {};
    },
    cacheUsers(users) {
        for (let user of users) {
            lib.uMap[user.id] = user;
        }
    }
};

export default lib;