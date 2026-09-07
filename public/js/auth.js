const API = "/api";

const token =
    localStorage.getItem("token");
    
    if(token){
      window.location.href =
        "/game.html";
    }

function saveAuth(data) {

    localStorage.setItem(
        "token",
        data.token
    );

    localStorage.setItem(
        "user",
        JSON.stringify(data.user)
    );

}


function showMessage(
    element,
    message,
    success = false
) {

    element.textContent =
        message;

    element.className =
        success
            ? "form-message success"
            : "form-message error";

}


/* =========================
   REGISTER
========================= */

const registerForm =
    document.getElementById(
        "registerForm"
    );


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const message =
                document.getElementById(
                    "registerMessage"
                );


            const name =
                document.getElementById(
                    "name"
                ).value.trim();


            const mobile =
                document.getElementById(
                    "mobile"
                ).value.trim();


            const password =
                document.getElementById(
                    "password"
                ).value;


            try {

                const response =
                    await fetch(
                        `${API}/auth/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    name,
                                    mobile,
                                    password
                                })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Registration failed"
                    );

                }


                saveAuth(data);


                showMessage(
                    message,
                    "Registration successful",
                    true
                );


                setTimeout(() => {

                    window.location.href =
                        "/game.html";

                }, 500);


            } catch (error) {

                showMessage(
                    message,
                    error.message
                );

            }

        }
    );

}


/* =========================
   LOGIN
========================= */

const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const message =
                document.getElementById(
                    "loginMessage"
                );


            const mobile =
                document.getElementById(
                    "loginMobile"
                ).value.trim();


            const password =
                document.getElementById(
                    "loginPassword"
                ).value;


            try {

                const response =
                    await fetch(
                        `${API}/auth/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    mobile,
                                    password
                                })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Login failed"
                    );

                }


                saveAuth(data);


                showMessage(
                    message,
                    "Login successful",
                    true
                );


                setTimeout(() => {

                    window.location.href =
                        "/game.html";

                }, 500);


            } catch (error) {

                showMessage(
                    message,
                    error.message
                );

            }

        }
    );

}