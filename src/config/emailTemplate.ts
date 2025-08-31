export const getTemplate = (userName: string, code : string, expiresAt : Date) => {
    return `
      <table align="center" cellpadding="0" cellspacing="0" border="0" width="520" style="font-family: Arial, sans-serif; background:#f9f9f9; color:#333; padding:20px; font-size:125%;">
        <tr>
          <td style="padding-bottom:25px;">
            <img src="cid:logo" alt="Logo" width="150" style="display:inline;"/>
          </td>
        </tr>
        <tr>
          <td>
            <h4 style="color:#444; margin:0 0 40px; font-size:1.75em;">Password Reset Request</h4>
            <p style="margin:0 0 12px;">Hello ${userName || "User"},</p>
            <p style="margin:0 0 12px;">You requested a password reset. Use the code below to reset your password:</p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:25px 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#fff; border:1px solid #ddd; border-radius:8px; padding:18px;">
              <tr>
                <td align="center" style="font-size:1.25em; font-weight:bold; color:#2c3e50;">${code}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td>
            <p style="font-size:0.875em; color:#666; margin:0 0 12px;">This code will expire at <strong>${expiresAt.toLocaleString()}</strong>.</p>
            <p style="margin:0 0 12px;">If you did not request this reset, you can safely ignore this email.</p>
          </td>
        </tr>
        <tr>
          <td style="padding-top:25px; border-top:1px solid #ddd;">
            <p style="font-size:0.75em; color:#aaa; margin:0;">This is an automated message, please do not reply.</p>
          </td>
        </tr>
      </table>
    `;
}