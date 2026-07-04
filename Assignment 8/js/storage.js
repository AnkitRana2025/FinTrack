// ==============================
// Local Storage Keys
// ==============================

const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";


// ==============================
// Get All Users
// ==============================

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}


// ==============================
// Save Users
// ==============================

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}


// ==============================
// Get Current User
// ==============================

function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}


// ==============================
// Set Current User
// ==============================

function setCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}


// ==============================
// Logout
// ==============================

function logoutUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
}


// ==============================
// Update Current User
// ==============================

function updateCurrentUser(updatedUser) {

    const users = getUsers();

    const updatedUsers = users.map(user => {

        if (user.id === updatedUser.id) {
            return updatedUser;
        }

        return user;

    });

    saveUsers(updatedUsers);

    setCurrentUser(updatedUser);

}