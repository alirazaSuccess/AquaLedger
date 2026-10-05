import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  userName,
}) {
  try {
    const fromEmail =
      process.env.EMAIL_FROM ||
      "AquaLedger <onboarding@resend.dev>";

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],

      subject: "Reset Your AquaLedger Password",

      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Reset Your AquaLedger Password</title>
          </head>

          <body style="
            margin: 0;
            padding: 0;
            background-color: #f4f7fb;
            font-family: Arial, Helvetica, sans-serif;
            color: #1f2937;
          ">

            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="background-color: #f4f7fb; padding: 40px 16px;"
            >
              <tr>
                <td align="center">

                  <!-- Main Card -->
                  <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                      max-width: 560px;
                      background-color: #ffffff;
                      border-radius: 16px;
                      overflow: hidden;
                      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
                    "
                  >

                    <!-- Header -->
                    <tr>
                      <td
                        style="
                          background: linear-gradient(
                            135deg,
                            #0f766e,
                            #0891b2
                          );
                          padding: 32px 30px;
                          text-align: center;
                        "
                      >

                        <div style="
                          display: inline-block;
                          width: 54px;
                          height: 54px;
                          line-height: 54px;
                          border-radius: 14px;
                          background-color: rgba(255,255,255,0.18);
                          color: #ffffff;
                          font-size: 28px;
                          font-weight: bold;
                          margin-bottom: 12px;
                        ">
                          A
                        </div>

                        <h1 style="
                          margin: 0;
                          color: #ffffff;
                          font-size: 28px;
                          line-height: 36px;
                          font-weight: 700;
                        ">
                          AquaLedger
                        </h1>

                        <p style="
                          margin: 6px 0 0;
                          color: rgba(255,255,255,0.88);
                          font-size: 13px;
                        ">
                          Smart Water Business Management
                        </p>

                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 36px 32px 30px;">

                        <h2 style="
                          margin: 0 0 12px;
                          color: #111827;
                          font-size: 23px;
                          line-height: 30px;
                        ">
                          Reset Your Password
                        </h2>

                        <p style="
                          margin: 0 0 20px;
                          color: #4b5563;
                          font-size: 15px;
                          line-height: 24px;
                        ">
                          Hello <strong>${userName || "there"}</strong>,
                        </p>

                        <p style="
                          margin: 0 0 18px;
                          color: #4b5563;
                          font-size: 15px;
                          line-height: 24px;
                        ">
                          We received a request to reset the password
                          for your AquaLedger account.
                        </p>

                        <p style="
                          margin: 0 0 26px;
                          color: #4b5563;
                          font-size: 15px;
                          line-height: 24px;
                        ">
                          Click the button below to securely create a
                          new password for your account.
                        </p>

                        <!-- Button -->
                        <table
                          width="100%"
                          cellpadding="0"
                          cellspacing="0"
                          border="0"
                        >
                          <tr>
                            <td align="center">

                              <a
                                href="${resetUrl}"
                                style="
                                  display: inline-block;
                                  background-color: #0f766e;
                                  color: #ffffff;
                                  text-decoration: none;
                                  padding: 14px 30px;
                                  border-radius: 9px;
                                  font-size: 15px;
                                  font-weight: 700;
                                  line-height: 20px;
                                "
                              >
                                Reset My Password
                              </a>

                            </td>
                          </tr>
                        </table>

                        <!-- Expiry Notice -->
                        <div style="
                          margin-top: 28px;
                          padding: 15px 16px;
                          background-color: #fff7ed;
                          border: 1px solid #fed7aa;
                          border-radius: 9px;
                        ">
                          <p style="
                            margin: 0;
                            color: #9a3412;
                            font-size: 13px;
                            line-height: 20px;
                          ">
                            <strong>Security notice:</strong>
                            This password reset link expires in
                            <strong>2 minutes</strong>.
                          </p>
                        </div>

                        <!-- Security Info -->
                        <p style="
                          margin: 26px 0 0;
                          color: #6b7280;
                          font-size: 13px;
                          line-height: 21px;
                        ">
                          If you did not request a password reset,
                          no action is required. Your account remains
                          secure and your current password will not change.
                        </p>

                        <!-- Link fallback -->
                        <p style="
                          margin: 22px 0 0;
                          color: #9ca3af;
                          font-size: 11px;
                          line-height: 18px;
                          word-break: break-all;
                        ">
                          If the button does not work, copy and paste
                          the following link into your browser:
                        </p>

                        <p style="
                          margin: 6px 0 0;
                          color: #0f766e;
                          font-size: 11px;
                          line-height: 18px;
                          word-break: break-all;
                        ">
                          ${resetUrl}
                        </p>

                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td
                        style="
                          padding: 22px 30px;
                          background-color: #f8fafc;
                          border-top: 1px solid #e5e7eb;
                          text-align: center;
                        "
                      >

                        <p style="
                          margin: 0 0 6px;
                          color: #374151;
                          font-size: 13px;
                          font-weight: 600;
                        ">
                          AquaLedger
                        </p>

                        <p style="
                          margin: 0;
                          color: #9ca3af;
                          font-size: 11px;
                          line-height: 18px;
                        ">
                          Smart Water Business Management
                        </p>

                        <p style="
                          margin: 10px 0 0;
                          color: #9ca3af;
                          font-size: 10px;
                        ">
                          This is an automated email. Please do not reply.
                        </p>

                      </td>
                    </tr>

                  </table>

                </td>
              </tr>
            </table>

          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend email error:", error);

      return {
        success: false,
        error,
      };
    }

    console.log(
      "Password reset email sent successfully:",
      data?.id
    );

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Password reset email error:", error);

    return {
      success: false,
      error,
    };
  }
}