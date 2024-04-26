//value used for fetch request when performing API related operations
const username = document.querySelector(".username").textContent.trim();

// creation of socket to transfer passwords to other users
const socket = io("http://localhost:4030");


// create password account function
async function createPasswordAccount(accountName, accountUsername, accountPassword) {
    accountName = accountName.toLowerCase();
    accountName = accountName.replace(accountName[0], accountName[0].toUpperCase());

    try {
        let response = await fetch(`/api/create-password-account/users/${ username }`, {
            method: "PATCH",
            body: JSON.stringify({ accountName, accountUsername, accountPassword }),
            headers: { "Content-Type": "application/json" }
        });

        let data = await response.json();

        if(data.error) {
            return data;
        } else if(data.user) {
            return true
        }
    } catch(err) {
        console.log(err);
    }
}

// update password account function
async function updatePasswordAccount(accountName, accountUsername, accountPassword) {
    accountName = accountName.toLowerCase();
    accountName = accountName.replace(accountName[0], accountName[0].toUpperCase());

    try {
        let response = await fetch(`api/update-password-account/users/${ username }/${ accountName }`, {
            method: "PATCH",
            body: JSON.stringify({ accountName, accountUsername, accountPassword }),
            headers: { "Content-Type": "application/json" }
        });

        let data = await response.json();

        if(data.error) {
            return data;
        } else if(data.user) {
            return true;
        }
    } catch(err) {
        console.log(err);
    }
}

// function that will copy password to clipboard
async function copyPassword() {
    let accountPassword = $(".password-account-modal.active #account-password").attr("value");
    accountPassword = encodeURIComponent(accountPassword);
    
    try {
        $.ajax({
            url: `/api/decrypt-password/users/${ accountPassword }`,
            method: "POST",
            body: JSON.stringify({ password: accountPassword }),
            contentType: "application/json",
            success: function(result) {
                var $temp = $("<input>");
                $("body").append($temp);
                $temp.val(result.password).select();
                document.execCommand("copy");
                $temp.remove();
            }
        });
    } catch (error) {
        console.log(error);
    }
}

// function that will decrypt and reveal account password
async function showPassword(accountPassword) {
    accountPassword = encodeURIComponent(accountPassword);

    try {
        $.ajax({
            method: "POST",
            url: `/api/decrypt-password/users/${ accountPassword }`,
            body: { password: accountPassword },
            contentType: "application/json;",
            success: function(result) {
                $(".password-account-modal.active #account-password").attr("type", "text");
                $(".password-account-modal.active #account-password").val(result.password);
            }
        });
    } catch (error) {
        console.log(error);
    }
}

// enable fields
async function enableFields() {
    $(".password-account-modal.active #account-password").removeAttr("disabled");
    $(".password-account-modal.active #account-username").removeAttr("disabled");
}

// reset to default
async function reset() {
    let accountPassword = $(".password-account-modal.active #account-password").attr("value");

    $(".password-account-modal.active #account-password").attr("type", "password");
    $(".password-account-modal.active #account-password").val(accountPassword);

    $(".password-account-modal.active #account-password").attr("disabled", "disabled");
    $(".password-account-modal.active #account-username").attr("disabled", "disabled");
}
// delete password account
async function deletePasswordAccount(accountName) {
    try {
        let response = await fetch(`/api/delete-password-account/users/${ username }/${ accountName }`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" }
        });

        let data = await response.json();

        if(data.error) {
            return data;
        } else if(data.user) {
            return true;
        }
    } catch(err) {
        console.error(err);
    }
}

// delete user account
async function deleteUserAccount(email) {
    try {
        let response = await fetch(`/api/delete-user-account/users/${ email }`, {
            method: "DELETE",
            headers: { "Content-type": "application/json" }
        });

        let data = await response.json();

        if(data.error) {
            alert(data.error);
            return data.error;
        } else {
            return true;
        }
    } catch(err) {
        console.error(err);
    }
}


function sharePassword() {
    let accountPassword = $(".password-account-modal.active #account-password").attr("value");
    let accountUsername = $(".password-account-modal.active #account-username").val();
    let accountName = $(".password-account-modal.active .fullname").text().trim();

    accountPassword = encodeURIComponent(accountPassword);

    try {
        $.ajax({
            method: "POST",
            url: `/api/decrypt-password/users/${ accountPassword }`,
            body: { password: accountPassword },
            contentType: "application/json;",
            success: function(result) {
                accountPassword = result.password;
                socket.emit("share-password", { accountName, accountUsername, accountPassword});
            }
        });
    } catch (error) {
        console.log(error);
    }
}

// appending password to user view and creating password account when user clicks it
socket.on("receive-password", (password) => {
    $(".received-passwords").prepend(`<p class="received-password-name">${ password.accountName }</p><hr/>`);
   
    $(".received-password-name").on("click", function() {
        createPasswordAccount(password.accountName, password.accountUsername, password.accountPassword);
        location.assign("/");
    });
});

