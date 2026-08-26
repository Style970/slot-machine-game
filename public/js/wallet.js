const token =
    localStorage.getItem("token");


if (!token) {

    window.location.href =
        "/login.html";

}


const amountInput =
    document.getElementById(
        "amount"
    );


const payButton =
    document.getElementById(
        "payButton"
    );


const paymentBox =
    document.getElementById(
        "paymentBox"
    );


const paymentLink =
    document.getElementById(
        "paymentLink"
    );


const qrContainer =
    document.getElementById(
        "qrContainer"
    );


const orderIdElement =
    document.getElementById(
        "orderId"
    );


const paymentStatus =
    document.getElementById(
        "paymentStatus"
    );


const checkButton =
    document.getElementById(
        "checkButton"
    );


const balanceElement =
    document.getElementById(
        "walletBalance"
    );


const historyElement =
    document.getElementById(
        "depositHistory"
    );


let currentOrderId = null;


/*
|--------------------------------------------------------------------------
| Quick amount buttons
|--------------------------------------------------------------------------
*/

document
    .querySelectorAll(
        "[data-amount]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                amountInput.value =
                    button.dataset.amount;

            }
        );

    });


/*
|--------------------------------------------------------------------------
| Load balance
|--------------------------------------------------------------------------
*/

async function loadBalance() {

    try {

        const response =
            await fetch(
                "/api/auth/me",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message
            );

        }


        balanceElement.textContent =
            "₹" +
            Number(
                data.user.balance
            ).toLocaleString("en-IN");


    } catch (error) {

        console.error(error);

    }

}


/*
|--------------------------------------------------------------------------
| Create payment
|--------------------------------------------------------------------------
*/

payButton.addEventListener(
    "click",
    async () => {

        const amount =
            Number(
                amountInput.value
            );


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            alert(
                "Enter a valid amount"
            );

            return;

        }


        payButton.disabled = true;

        payButton.textContent =
            "Creating payment...";


        try {

            const response =
                await fetch(
                    "/api/wallet/deposit",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify({
                                amount
                            })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Payment creation failed"
                );

            }


            currentOrderId =
                data.orderId;


            orderIdElement.textContent =
                currentOrderId;


            paymentBox.classList.remove(
                "hidden"
            );


            /*
             * QR returned by backend.
             */

            if (
                data.qrImage
            ) {

                qrContainer.innerHTML =
                    `
                    <img
                        src="${data.qrImage}"
                        alt="Payment QR"
                        class="payment-qr"
                    >
                    `;

            } else {

                qrContainer.innerHTML =
                    `
                    <div class="qr-placeholder">

                        QR will appear after
                        PhonePe provider
                        configuration.

                    </div>
                    `;

            }


            /*
             * Provider checkout URL.
             */

            if (
                data.paymentUrl
            ) {

                paymentLink.href =
                    data.paymentUrl;

                paymentLink.style.display =
                    "block";

            } else {

                paymentLink.style.display =
                    "none";

            }


            paymentStatus.textContent =
                "Waiting for payment...";


            loadHistory();


        } catch (error) {

            alert(
                error.message
            );

        }


        payButton.disabled =
            false;

        payButton.textContent =
            "Continue to Payment";

    }
);


/*
|--------------------------------------------------------------------------
| Check payment
|--------------------------------------------------------------------------
*/

checkButton.addEventListener(
    "click",
    checkPayment
);


async function checkPayment() {

    if (!currentOrderId) {

        return;

    }


    checkButton.disabled =
        true;


    paymentStatus.textContent =
        "Checking payment...";


    try {

        const response =
            await fetch(

                `/api/wallet/deposit/${encodeURIComponent(
                    currentOrderId
                )}`,

                {

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }

            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to check payment"
            );

        }


        if (
            data.status ===
            "SUCCESS"
        ) {

            paymentStatus.textContent =
                "✅ Payment successful. Balance credited.";

            await loadBalance();

            await loadHistory();

        } else if (
            data.status ===
            "FAILED"
        ) {

            paymentStatus.textContent =
                "❌ Payment failed.";

        } else {

            paymentStatus.textContent =
                "⏳ Payment is still pending.";

        }


    } catch (error) {

        paymentStatus.textContent =
            error.message;

    }


    checkButton.disabled =
        false;

}


/*
|--------------------------------------------------------------------------
| History
|--------------------------------------------------------------------------
*/

async function loadHistory() {

    try {

        const response =
            await fetch(
                "/api/wallet/deposits",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message
            );

        }


        historyElement.innerHTML =
            data.deposits.map(
                deposit => {

                    let statusClass =
                        "pending";


                    if (
                        deposit.status ===
                        "SUCCESS"
                    ) {

                        statusClass =
                            "success";

                    }


                    if (
                        deposit.status ===
                        "FAILED"
                    ) {

                        statusClass =
                            "failed";

                    }


                    return `

                    <div
                        class="deposit-item"
                    >

                        <strong>
                            ₹${Number(
                                deposit.amount
                            ).toLocaleString(
                                "en-IN"
                            )}
                        </strong>

                        <span
                            class="${statusClass}"
                        >
                            ${deposit.status}
                        </span>

                        <small>
                            ${new Date(
                                deposit.createdAt
                            ).toLocaleString()}
                        </small>

                    </div>

                    `;

                }
            ).join("");


    } catch (error) {

        historyElement.textContent =
            error.message;

    }

}


/*
|--------------------------------------------------------------------------
| Back
|--------------------------------------------------------------------------
*/

document
    .getElementById(
        "backButton"
    )
    .addEventListener(
        "click",
        () => {

            window.location.href =
                "/game.html";

        }
    );


loadBalance();

loadHistory();